import { create } from 'zustand';
import type { Student, DailyLog, ExamSession, TargetHafalan, MurojaahCycle, StudentProgress } from '@/types';
import { linesToPages, pagesToJuz } from '@/lib/juz-mapping';
import * as api from '@/lib/supabase-queries';

const PAGES_SEQUENCE = [3, 6, 9, 12, 15, 18, 20];

interface AppState {
  students: Student[];
  dailyLogs: DailyLog[];
  exams: ExamSession[];
  targets: TargetHafalan[];
  murojaahCycles: Record<string, MurojaahCycle>;
  loading: boolean;

  // Fetch
  fetchAll: () => Promise<void>;
  fetchStudentData: (studentId: string) => Promise<void>;

  // Mutations
  addStudent: (name: string) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  addLog: (log: Omit<DailyLog, 'id' | 'created_at'>) => Promise<void>;
  addExam: (exam: Omit<ExamSession, 'id' | 'created_at'>) => Promise<void>;
  updateExamStatus: (id: string, status: ExamSession['status']) => Promise<void>;
  addTarget: (target: Omit<TargetHafalan, 'id' | 'created_at'>) => Promise<void>;
  updateMurojaahCycle: (studentId: string) => Promise<MurojaahCycle>;

  // Selectors
  getStudentLogs: (studentId: string) => DailyLog[];
  getStudentExams: (studentId: string) => ExamSession[];
  getStudentTargets: (studentId: string) => TargetHafalan[];
  getStudentProgress: (studentId: string) => StudentProgress;
  getTodayLogs: () => DailyLog[];
}

export const useAppStore = create<AppState>()((set, get) => ({
  students: [],
  dailyLogs: [],
  exams: [],
  targets: [],
  murojaahCycles: {},
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [students, dailyLogs, exams, targets] = await Promise.all([
        api.fetchStudents(),
        api.fetchDailyLogs(),
        api.fetchExams(),
        api.fetchTargets(),
      ]);
      set({ students, dailyLogs, exams, targets, loading: false });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      set({ loading: false });
    }
  },

  fetchStudentData: async (studentId: string) => {
    try {
      const [logs, exams, targets, cycle] = await Promise.all([
        api.fetchDailyLogs(studentId),
        api.fetchExams(studentId),
        api.fetchTargets(studentId),
        api.fetchMurojaahCycle(studentId),
      ]);
      set((s) => ({
        dailyLogs: [
          ...s.dailyLogs.filter((l) => l.student_id !== studentId),
          ...logs,
        ],
        exams: [
          ...s.exams.filter((e) => e.student_id !== studentId),
          ...exams,
        ],
        targets: [
          ...s.targets.filter((t) => t.student_id !== studentId),
          ...targets,
        ],
        murojaahCycles: cycle
          ? { ...s.murojaahCycles, [studentId]: cycle }
          : s.murojaahCycles,
      }));
    } catch (err) {
      console.error('Failed to fetch student data:', err);
    }
  },

  addStudent: async (name: string) => {
    const student = await api.insertStudent({ name });
    set((s) => ({ students: [...s.students, student] }));
  },

  removeStudent: async (id: string) => {
    await api.deleteStudent(id);
    set((s) => ({ students: s.students.filter((st) => st.id !== id) }));
  },

  addLog: async (log) => {
    const created = await api.insertDailyLog(log);
    set((s) => ({ dailyLogs: [created, ...s.dailyLogs] }));
  },

  addExam: async (exam) => {
    const created = await api.insertExam(exam);
    set((s) => ({ exams: [created, ...s.exams] }));
  },

  updateExamStatus: async (id, status) => {
    await api.updateExamStatus(id, status);
    set((s) => ({
      exams: s.exams.map((e) => (e.id === id ? { ...e, status } : e)),
    }));
  },

  addTarget: async (target) => {
    const created = await api.insertTarget(target);
    set((s) => ({ targets: [...s.targets, created] }));
  },

  updateMurojaahCycle: async (studentId: string) => {
    const cycles = get().murojaahCycles;
    const current = cycles[studentId] || { student_id: studentId, current_day: 0, current_pages: 0 };
    const currentIdx = PAGES_SEQUENCE.indexOf(current.current_pages);
    const nextIdx = currentIdx >= PAGES_SEQUENCE.length - 1 ? 0 : currentIdx + 1;
    const updated: Omit<MurojaahCycle, 'id' | 'created_at' | 'updated_at'> = {
      student_id: studentId,
      current_day: current.current_day + 1,
      current_pages: PAGES_SEQUENCE[nextIdx],
    };
    const result = await api.upsertMurojaahCycle(updated);
    set({ murojaahCycles: { ...cycles, [studentId]: result } });
    return result;
  },

  getStudentLogs: (studentId) => get().dailyLogs.filter((l) => l.student_id === studentId),
  getStudentExams: (studentId) => get().exams.filter((e) => e.student_id === studentId),
  getStudentTargets: (studentId) => get().targets.filter((t) => t.student_id === studentId),

  getStudentProgress: (studentId) => {
    const logs = get().dailyLogs.filter((l) => l.student_id === studentId && l.category === 'hafalan_baru');
    const total_lines = logs.reduce((sum, l) => sum + l.total_lines, 0);
    const total_pages = linesToPages(total_lines);
    const total_juz = pagesToJuz(total_pages);
    return { total_lines, total_pages, total_juz };
  },

  getTodayLogs: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().dailyLogs.filter((l) => l.created_at.startsWith(today));
  },
}));
