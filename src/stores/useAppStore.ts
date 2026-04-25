import { create } from 'zustand';
import type { Student, HafalanBaruLog, PersiapanUjianLog, UjianLog, MurojaahLog, StudentProgress } from '@/types';
import { linesToPages, pagesToJuz } from '@/lib/juz-mapping';
import * as api from '@/lib/supabase-queries';
import { persist } from 'zustand/middleware';

interface AppState {
  students: Student[];
  hafalanBaruLogs: HafalanBaruLog[];
  persiapanUjianLogs: PersiapanUjianLog[];
  ujianLogs: UjianLog[];
  murojaahLogs: MurojaahLog[];
  lastUpdatedAt: string | null;

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


  // Selectors
  getStudentHafalanLogs: (studentId: string) => HafalanBaruLog[];
  getStudentPersiapanLogs: (studentId: string) => PersiapanUjianLog[];
  getStudentUjianLogs: (studentId: string) => UjianLog[];
  getStudentMurojaahLogs: (studentId: string) => MurojaahLog[];

  getStudentProgress: (studentId: string) => StudentProgress;
  getTodayHafalanLogs: () => HafalanBaruLog[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      students: [],
      hafalanBaruLogs: [],
      persiapanUjianLogs: [],
      ujianLogs: [],
      murojaahLogs: [],

      loading: false,
      lastUpdatedAt: null,

      // 🔥 FETCH ALL (incremental)
      fetchAll: async () => {
        set({ loading: true });

        try {
          const last = get().lastUpdatedAt || undefined;

          const [
            students,
            hafalanBaruLogs,
            persiapanUjianLogs,
            ujianLogs,
            murojaahLogs,
          ] = await Promise.all([
            api.fetchStudents(last),
            api.fetchHafalanBaruLogs(undefined, last),
            api.fetchPersiapanUjianLogs(undefined, last),
            api.fetchUjianLogs(undefined, last),
            api.fetchMurojaahLogs(undefined, last),
          ]);

          const newLast = getLatestTimestamp([
            students,
            hafalanBaruLogs,
            persiapanUjianLogs,
            ujianLogs,
            murojaahLogs,
          ]);

          set((s) => ({
            students: mergeById(s.students, students),
            hafalanBaruLogs: mergeById(s.hafalanBaruLogs, hafalanBaruLogs),
            persiapanUjianLogs: mergeById(s.persiapanUjianLogs, persiapanUjianLogs),
            ujianLogs: mergeById(s.ujianLogs, ujianLogs),
            murojaahLogs: mergeById(s.murojaahLogs, murojaahLogs),
            lastUpdatedAt: newLast || s.lastUpdatedAt,
            loading: false,
          }));
        } catch (err) {
          console.error('Failed to fetch data:', err);
          set({ loading: false });
        }
      },

      // 🔥 FETCH PER STUDENT (incremental juga)
      fetchStudentData: async (studentId: string) => {
        try {
          const last = get().lastUpdatedAt || undefined;

          const [hLogs, pLogs, uLogs, mLogs] = await Promise.all([
            api.fetchHafalanBaruLogs(studentId, last),
            api.fetchPersiapanUjianLogs(studentId, last),
            api.fetchUjianLogs(studentId, last),
            api.fetchMurojaahLogs(studentId, last),
          ]);

          const newLast = getLatestTimestamp([hLogs, pLogs, uLogs, mLogs]);

          set((s) => ({
            hafalanBaruLogs: mergeById(s.hafalanBaruLogs, hLogs),
            persiapanUjianLogs: mergeById(s.persiapanUjianLogs, pLogs),
            ujianLogs: mergeById(s.ujianLogs, uLogs),
            murojaahLogs: mergeById(s.murojaahLogs, mLogs),
            lastUpdatedAt: newLast || s.lastUpdatedAt,
          }));
        } catch (err) {
          console.error('Failed to fetch student data:', err);
        }
      },

      // 🔥 MUTATIONS (update lastUpdatedAt juga)
      addStudent: async (name: string) => {
        const student = await api.insertStudent({ name });

        set((s) => ({
          students: mergeById(s.students, [student]),
          lastUpdatedAt: student.updated_at || s.lastUpdatedAt,
        }));
      },

      removeStudent: async (id: string) => {
        await api.deleteStudent(id);

        set((s) => ({
          students: s.students.filter((st) => st.id !== id),
        }));
      },

      addHafalanBaruLog: async (log) => {
        const created = await api.insertHafalanBaruLog(log);

        set((s) => ({
          hafalanBaruLogs: mergeById(s.hafalanBaruLogs, [created]),
          lastUpdatedAt: created.updated_at || s.lastUpdatedAt,
        }));
      },

      addPersiapanUjianLog: async (log) => {
        const created = await api.insertPersiapanUjianLog(log);

        set((s) => ({
          persiapanUjianLogs: mergeById(s.persiapanUjianLogs, [created]),
          lastUpdatedAt: created.updated_at || s.lastUpdatedAt,
        }));
      },

      addUjianLog: async (log) => {
        const created = await api.insertUjianLog(log);

        set((s) => ({
          ujianLogs: mergeById(s.ujianLogs, [created]),
          lastUpdatedAt: created.updated_at || s.lastUpdatedAt,
        }));
      },

      addMurojaahLog: async (log) => {
        const created = await api.insertMurojaahLog(log);

        set((s) => ({
          murojaahLogs: mergeById(s.murojaahLogs, [created]),
          lastUpdatedAt: created.updated_at || s.lastUpdatedAt,
        }));
      },

      // SELECTORS (tetap sama)
      getStudentHafalanLogs: (id) =>
        get().hafalanBaruLogs.filter((l) => l.student_id === id),

      getStudentPersiapanLogs: (id) =>
        get().persiapanUjianLogs.filter((l) => l.student_id === id),

      getStudentUjianLogs: (id) =>
        get().ujianLogs.filter((l) => l.student_id === id),

      getStudentMurojaahLogs: (id) =>
        get().murojaahLogs.filter((l) => l.student_id === id),

      getStudentProgress: (studentId) => {
        const logs = get().getStudentHafalanLogs(studentId);
        const total_lines = logs.reduce((sum, l) => sum + l.total_lines, 0);
        const total_pages = linesToPages(total_lines);
        const total_juz = pagesToJuz(total_pages);
        return { total_lines, total_pages, total_juz };
      },

      getTodayHafalanLogs: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().hafalanBaruLogs.filter((l) =>
          l.created_at.startsWith(today)
        );
      },
    }),
    {
      name: 'hafalan-storage',

      partialize: (state) => ({
        students: state.students,
        hafalanBaruLogs: state.hafalanBaruLogs,
        persiapanUjianLogs: state.persiapanUjianLogs,
        ujianLogs: state.ujianLogs,
        murojaahLogs: state.murojaahLogs,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    }
  )
);


const mergeById = <T extends { id: string; deleted_at?: string | null }>(
  oldArr: T[],
  newArr: T[]
) => {
  const map = new Map(oldArr.map((i) => [i.id, i]));

  for (const item of newArr) {
    if (item.deleted_at) {
      map.delete(item.id); // 🔥 hapus dari state
    } else {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values());
};

const getLatestTimestamp = (arrays: any[][]) => {
  let latest: string | null = null;

  for (const arr of arrays) {
    for (const item of arr) {
      if (!item.updated_at) continue;
      if (!latest || item.updated_at > latest) {
        latest = item.updated_at;
      }
    }
  }

  return latest;
};