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
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  addHafalanBaruLog: (log: Omit<HafalanBaruLog, 'id' | 'created_at'>) => Promise<void>;
  updateHafalanBaruLog: (id: string, updates: Partial<HafalanBaruLog>) => Promise<void>;
  removeHafalanBaruLog: (id: string) => Promise<void>;
  addPersiapanUjianLog: (log: Omit<PersiapanUjianLog, 'id' | 'created_at'>) => Promise<void>;
  updatePersiapanUjianLog: (id: string, updates: Partial<PersiapanUjianLog>) => Promise<void>;
  removePersiapanUjianLog: (id: string) => Promise<void>;
  addUjianLog: (log: Omit<UjianLog, 'id' | 'created_at'>) => Promise<void>;
  updateUjianLog: (id: string, updates: Partial<UjianLog>) => Promise<void>;
  removeUjianLog: (id: string) => Promise<void>;
  addMurojaahLog: (log: Omit<MurojaahLog, 'id' | 'created_at'>) => Promise<void>;
  updateMurojaahLog: (id: string, updates: Partial<MurojaahLog>) => Promise<void>;
  removeMurojaahLog: (id: string) => Promise<void>;


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
            students: sortStudents(mergeById(s.students, students)),
            hafalanBaruLogs: sortLogs(mergeById(s.hafalanBaruLogs, hafalanBaruLogs)),
            persiapanUjianLogs: sortLogs(mergeById(s.persiapanUjianLogs, persiapanUjianLogs)),
            ujianLogs: sortLogs(mergeById(s.ujianLogs, ujianLogs)),
            murojaahLogs: sortLogs(mergeById(s.murojaahLogs, murojaahLogs)),
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
          students: sortStudents(mergeById(s.students, [student])),
          lastUpdatedAt: student.updated_at || s.lastUpdatedAt,
        }));
      },

      updateStudent: async (id, updates) => {
        const updated = await api.updateStudent(id, updates);

        set((s) => ({
          students: sortStudents(mergeById(s.students, [updated])),
          lastUpdatedAt: updated.updated_at || s.lastUpdatedAt,
        }));
      },

      removeStudent: async (id: string) => {
        const deleted = await api.deleteStudent(id); // sudah soft delete

        set((s) => ({
          students: sortStudents(mergeById(s.students, [deleted])),
          lastUpdatedAt: deleted.updated_at || s.lastUpdatedAt,
        }));
      },

      addHafalanBaruLog: async (log) => {
        const created = await api.insertHafalanBaruLog(log);

        set((s) => ({
          hafalanBaruLogs: sortLogs(
            mergeById(s.hafalanBaruLogs, [created]),
          ),
          lastUpdatedAt: created.updated_at || s.lastUpdatedAt,
        }));
      },
      updateHafalanBaruLog: async (id, updates) => {
        const updated = await api.updateHafalanBaruLog(id, updates);

        set((s) => ({
          hafalanBaruLogs: sortLogs(mergeById(s.hafalanBaruLogs, [updated])),
          lastUpdatedAt: updated.updated_at || s.lastUpdatedAt,
        }));
      },

      removeHafalanBaruLog: async (id: string) => {
        const deleted = await api.deleteHafalanBaruLog(id);

        set((s) => ({
          hafalanBaruLogs: sortLogs(mergeById(s.hafalanBaruLogs, [deleted])),
          lastUpdatedAt: deleted.updated_at || s.lastUpdatedAt,
        }));
      },

      addPersiapanUjianLog: async (log) => {
        const created = await api.insertPersiapanUjianLog(log);

        set((s) => ({
          persiapanUjianLogs: sortLogs(mergeById(s.persiapanUjianLogs, [created])),
          lastUpdatedAt: created.updated_at || s.lastUpdatedAt,
        }));
      },
      updatePersiapanUjianLog: async (id, updates) => {
        const updated = await api.updatePersiapanUjianLog(id, updates);

        set((s) => ({
          persiapanUjianLogs: sortLogs(mergeById(s.persiapanUjianLogs, [updated])),
          lastUpdatedAt: updated.updated_at || s.lastUpdatedAt,
        }));
      },

      removePersiapanUjianLog: async (id: string) => {
        const deleted = await api.deletePersiapanUjianLog(id);

        set((s) => ({
          persiapanUjianLogs: sortLogs(mergeById(s.persiapanUjianLogs, [deleted])),
          lastUpdatedAt: deleted.updated_at || s.lastUpdatedAt,
        }));
      },

      addUjianLog: async (log) => {
        const created = await api.insertUjianLog(log);

        set((s) => ({
          ujianLogs: sortLogs(mergeById(s.ujianLogs, [created])),
          lastUpdatedAt: created.updated_at || s.lastUpdatedAt,
        }));
      },

      updateUjianLog: async (id, updates) => {
        const updated = await api.updateUjianLog(id, updates);

        set((s) => ({
          ujianLogs: sortLogs(mergeById(s.ujianLogs, [updated])),
          lastUpdatedAt: updated.updated_at || s.lastUpdatedAt,
        }));
      },

      removeUjianLog: async (id: string) => {
        const deleted = await api.deleteUjianLog(id);

        set((s) => ({
          ujianLogs: sortLogs(mergeById(s.ujianLogs, [deleted])),
          lastUpdatedAt: deleted.updated_at || s.lastUpdatedAt,
        }));
      },

      addMurojaahLog: async (log) => {
        const created = await api.insertMurojaahLog(log);

        set((s) => ({
          murojaahLogs: sortLogs(mergeById(s.murojaahLogs, [created])),
          lastUpdatedAt: created.updated_at || s.lastUpdatedAt,
        }));
      },
      updateMurojaahLog: async (id, updates) => {
        const updated = await api.updateMurojaahLog(id, updates);

        set((s) => ({
          murojaahLogs: sortLogs(mergeById(s.murojaahLogs, [updated])),
          lastUpdatedAt: updated.updated_at || s.lastUpdatedAt,
        }));
      },

      removeMurojaahLog: async (id: string) => {
        const deleted = await api.deleteMurojaahLog(id);

        set((s) => ({
          murojaahLogs: sortLogs(mergeById(s.murojaahLogs, [deleted])),
          lastUpdatedAt: deleted.updated_at || s.lastUpdatedAt,
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

const sortStudents = (arr: Student[]) =>
  [...arr].sort((a, b) => a.name.localeCompare(b.name));

const sortLogs = <T extends { created_at: string }>(arr: T[]) =>
  [...arr].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );