import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Student, DailyLog, ExamSession, TargetHafalan, MurojaahCycle } from '@/types';

interface AppState {
  students: Student[];
  dailyLogs: DailyLog[];
  exams: ExamSession[];
  targets: TargetHafalan[];
  murojaahCycles: Record<string, MurojaahCycle>;

  addStudent: (student: Student) => void;
  removeStudent: (id: string) => void;
  addLog: (log: DailyLog) => void;
  addExam: (exam: ExamSession) => void;
  updateExamStatus: (id: string, status: ExamSession['status']) => void;
  addTarget: (target: TargetHafalan) => void;
  updateMurojaahCycle: (studentId: string) => MurojaahCycle;
  getStudentLogs: (studentId: string) => DailyLog[];
  getStudentExams: (studentId: string) => ExamSession[];
  getStudentTargets: (studentId: string) => TargetHafalan[];
  getStudentProgress: (studentId: string) => { total_ayah: number; total_juz: number };
  getTodayLogs: () => DailyLog[];
}

const PAGES_SEQUENCE = [3, 6, 9, 12, 15, 18, 20];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      students: [
        { id: '1', name: 'Ahmad Fauzi' },
        { id: '2', name: 'Fatimah Zahra' },
        { id: '3', name: 'Muhammad Rizki' },
        { id: '4', name: 'Aisyah Putri' },
      ],
      dailyLogs: [
        { id: 'l1', student_id: '1', date: new Date().toISOString().split('T')[0], category: 'hafalan_baru', type: 'setoran', juz_id: 30, from_ayah: 1, to_ayah: 11, total_ayah: 11, pages: 1, note: 'Lancar' },
        { id: 'l2', student_id: '2', date: new Date().toISOString().split('T')[0], category: 'murojaah', type: 'setoran', juz_id: 29, from_ayah: 1, to_ayah: 20, total_ayah: 20, pages: 3, note: '' },
        { id: 'l3', student_id: '1', date: new Date().toISOString().split('T')[0], category: 'hafalan_baru', type: 'setoran', juz_id: 30, from_ayah: 12, to_ayah: 22, total_ayah: 11, pages: 1, note: '' },
        { id: 'l4', student_id: '3', date: new Date().toISOString().split('T')[0], category: 'hafalan_baru', type: 'setoran', juz_id: 30, from_ayah: 1, to_ayah: 7, total_ayah: 7, pages: 1, note: 'Perlu perbaikan tajwid' },
      ],
      exams: [
        { id: 'e1', student_id: '1', exam_type: 'quarter_juz', status: 'pending', exam_date: new Date().toISOString().split('T')[0], juz_range: 'Juz 30' },
        { id: 'e2', student_id: '2', exam_type: 'half_juz', status: 'passed', exam_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], juz_range: 'Juz 29' },
      ],
      targets: [
        { id: 't1', student_id: '1', target_type: 'juz', target_value: 5, deadline: '2026-12-31', current_value: 1 },
        { id: 't2', student_id: '2', target_type: 'juz', target_value: 3, deadline: '2026-08-31', current_value: 2 },
      ],
      murojaahCycles: {},

      addStudent: (student) => set((s) => ({ students: [...s.students, student] })),
      removeStudent: (id) => set((s) => ({ students: s.students.filter((st) => st.id !== id) })),
      addLog: (log) => set((s) => ({ dailyLogs: [...s.dailyLogs, log] })),
      addExam: (exam) => set((s) => ({ exams: [...s.exams, exam] })),
      updateExamStatus: (id, status) =>
        set((s) => ({
          exams: s.exams.map((e) => (e.id === id ? { ...e, status } : e)),
        })),
      addTarget: (target) => set((s) => ({ targets: [...s.targets, target] })),

      updateMurojaahCycle: (studentId) => {
        const cycles = get().murojaahCycles;
        const current = cycles[studentId] || { student_id: studentId, current_day: 0, current_pages: 0 };
        const currentIdx = PAGES_SEQUENCE.indexOf(current.current_pages);
        const nextIdx = currentIdx >= PAGES_SEQUENCE.length - 1 ? 0 : currentIdx + 1;
        const updated: MurojaahCycle = {
          student_id: studentId,
          current_day: current.current_day + 1,
          current_pages: PAGES_SEQUENCE[nextIdx],
        };
        set({ murojaahCycles: { ...cycles, [studentId]: updated } });
        return updated;
      },

      getStudentLogs: (studentId) => get().dailyLogs.filter((l) => l.student_id === studentId),
      getStudentExams: (studentId) => get().exams.filter((e) => e.student_id === studentId),
      getStudentTargets: (studentId) => get().targets.filter((t) => t.student_id === studentId),

      getStudentProgress: (studentId) => {
        const logs = get().dailyLogs.filter((l) => l.student_id === studentId && l.category === 'hafalan_baru');
        const total_ayah = logs.reduce((sum, l) => sum + l.total_ayah, 0);
        return { total_ayah, total_juz: Math.floor(total_ayah / 604) || (total_ayah > 0 ? 1 : 0) };
      },

      getTodayLogs: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().dailyLogs.filter((l) => l.date === today);
      },
    }),
    { name: 'quran-tracker-storage' }
  )
);
