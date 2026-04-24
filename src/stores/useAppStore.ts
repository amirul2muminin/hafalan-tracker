import { create } from 'zustand';
import type { Student, HafalanBaruLog, PersiapanUjianLog, UjianLog, MurojaahLog, TargetHafalan, MurojaahCycle, StudentProgress } from '@/types';
import { linesToPages, pagesToJuz } from '@/lib/juz-mapping';
import * as api from '@/lib/supabase-queries';

const PAGES_SEQUENCE = [3, 6, 9, 12, 15, 18, 20];

interface AppState {
  students: Student[];
  hafalanBaruLogs: HafalanBaruLog[];
  persiapanUjianLogs: PersiapanUjianLog[];
  ujianLogs: UjianLog[];
  murojaahLogs: MurojaahLog[];
  targets: TargetHafalan[];
  murojaahCycles: Record<string, MurojaahCycle>;
  loading: boolean;

  // Fetch
  fetchAll: () => Promise<void>;
  fetchStudentData: (studentId: string) => Promise<void>;

  // Mutations
  addStudent: (name: string) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  addHafalanBaruLog: (log: Omit<HafalanBaruLog, 'id' | 'created_at'>) => Promise<void>;
  addPersiapanUjianLog: (log: Omit<PersiapanUjianLog, 'id' | 'created_at'>) => Promise<void>;
  addUjianLog: (log: Omit<UjianLog, 'id' | 'created_at'>) => Promise<void>;
  addMurojaahLog: (log: Omit<MurojaahLog, 'id' | 'created_at'>) => Promise<void>;
  addTarget: (target: Omit<TargetHafalan, 'id' | 'created_at'>) => Promise<void>;
  updateMurojaahCycle: (studentId: string) => Promise<MurojaahCycle>;

  // Selectors
  getStudentHafalanLogs: (studentId: string) => HafalanBaruLog[];
  getStudentPersiapanLogs: (studentId: string) => PersiapanUjianLog[];
  getStudentUjianLogs: (studentId: string) => UjianLog[];
  getStudentMurojaahLogs: (studentId: string) => MurojaahLog[];
  getStudentTargets: (studentId: string) => TargetHafalan[];
  getStudentProgress: (studentId: string) => StudentProgress;
  getTodayHafalanLogs: () => HafalanBaruLog[];
}

export const useAppStore = create<AppState>()((set, get) => ({
  students: [],
  hafalanBaruLogs: [],
  persiapanUjianLogs: [],
  ujianLogs: [],
  murojaahLogs: [],
  targets: [],
  murojaahCycles: {},
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [students, hafalanBaruLogs, persiapanUjianLogs, ujianLogs, murojaahLogs, targets] = await Promise.all([
        api.fetchStudents(),
        api.fetchHafalanBaruLogs(),
        api.fetchPersiapanUjianLogs(),
        api.fetchUjianLogs(),
        api.fetchMurojaahLogs(),
        api.fetchTargets(),
      ]);
      set({ students, hafalanBaruLogs, persiapanUjianLogs, ujianLogs, murojaahLogs, targets, loading: false });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      set({ loading: false });
    }
  },

  fetchStudentData: async (studentId: string) => {
    try {
      const [hLogs, pLogs, uLogs, mLogs, targets, cycle] = await Promise.all([
        api.fetchHafalanBaruLogs(studentId),
        api.fetchPersiapanUjianLogs(studentId),
        api.fetchUjianLogs(studentId),
        api.fetchMurojaahLogs(studentId),
        api.fetchTargets(studentId),
        api.fetchMurojaahCycle(studentId),
      ]);
      set((s) => ({
        hafalanBaruLogs: [...s.hafalanBaruLogs.filter((l) => l.student_id !== studentId), ...hLogs],
        persiapanUjianLogs: [...s.persiapanUjianLogs.filter((l) => l.student_id !== studentId), ...pLogs],
        ujianLogs: [...s.ujianLogs.filter((l) => l.student_id !== studentId), ...uLogs],
        murojaahLogs: [...s.murojaahLogs.filter((l) => l.student_id !== studentId), ...mLogs],
        targets: [...s.targets.filter((t) => t.student_id !== studentId), ...targets],
        murojaahCycles: cycle ? { ...s.murojaahCycles, [studentId]: cycle } : s.murojaahCycles,
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

  addHafalanBaruLog: async (log) => {
    const created = await api.insertHafalanBaruLog(log);
    set((s) => ({ hafalanBaruLogs: [created, ...s.hafalanBaruLogs] }));
  },

  addPersiapanUjianLog: async (log) => {
    const created = await api.insertPersiapanUjianLog(log);
    set((s) => ({ persiapanUjianLogs: [created, ...s.persiapanUjianLogs] }));
  },

  addUjianLog: async (log) => {
    const created = await api.insertUjianLog(log);
    set((s) => ({ ujianLogs: [created, ...s.ujianLogs] }));
  },

  addMurojaahLog: async (log) => {
    const created = await api.insertMurojaahLog(log);
    set((s) => ({ murojaahLogs: [created, ...s.murojaahLogs] }));
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

  getStudentHafalanLogs: (studentId) => get().hafalanBaruLogs.filter((l) => l.student_id === studentId),
  getStudentPersiapanLogs: (studentId) => get().persiapanUjianLogs.filter((l) => l.student_id === studentId),
  getStudentUjianLogs: (studentId) => get().ujianLogs.filter((l) => l.student_id === studentId),
  getStudentMurojaahLogs: (studentId) => get().murojaahLogs.filter((l) => l.student_id === studentId),
  getStudentTargets: (studentId) => get().targets.filter((t) => t.student_id === studentId),

  getStudentProgress: (studentId) => {
    const logs = get().hafalanBaruLogs.filter((l) => l.student_id === studentId);
    const total_lines = logs.reduce((sum, l) => sum + l.total_lines, 0);
    const total_pages = linesToPages(total_lines);
    const total_juz = pagesToJuz(total_pages);
    return { total_lines, total_pages, total_juz };
  },

  getTodayHafalanLogs: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().hafalanBaruLogs.filter((l) => l.created_at.startsWith(today));
  },
}));
