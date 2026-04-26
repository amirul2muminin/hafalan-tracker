import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import type { Student } from '@/types';

export type StudentFilter = 'belum-hafalan' | 'belum-murojaah' | null;

export function useStudentFilters() {
  const [searchParams] = useSearchParams();
  const students = useAppStore((s) => s.students);
  const hafalanBaruLogs = useAppStore((s) => s.hafalanBaruLogs);
  const murojaahLogs = useAppStore((s) => s.murojaahLogs);

  const today = new Date().toISOString().split('T')[0];

  const todayHafalanLogs = useMemo(() => hafalanBaruLogs.filter((l) => l.created_at.startsWith(today)), [hafalanBaruLogs, today]);
  const todayMurojaahLogs = useMemo(() => murojaahLogs.filter((l) => l.created_at.startsWith(today)), [murojaahLogs, today]);

  const belumHafalan = useMemo(() => {
    const studentsWithHafalanToday = new Set(todayHafalanLogs.map((l) => l.student_id));
    return students.filter((s) => !studentsWithHafalanToday.has(s.id));
  }, [students, todayHafalanLogs]);

  const belumMurojaah = useMemo(() => {
    const studentsWithMurojaahToday = new Set(todayMurojaahLogs.map((l) => l.student_id));
    return students.filter((s) => !studentsWithMurojaahToday.has(s.id));
  }, [students, todayMurojaahLogs]);

  const activeFilter = (searchParams.get('filter') as StudentFilter) || null;

  const getFilteredStudents = (): Student[] => {
    switch (activeFilter) {
      case 'belum-hafalan':
        return belumHafalan;
      case 'belum-murojaah':
        return belumMurojaah;
      default:
        return students;
    }
  };

  const filterLabel = () => {
    switch (activeFilter) {
      case 'belum-hafalan':
        return 'Belum Hafalan';
      case 'belum-murojaah':
        return 'Belum Murojaah';
      default:
        return null;
    }
  };

  return {
    belumHafalan,
    belumMurojaah,
    activeFilter,
    getFilteredStudents,
    filterLabel,
  };
}