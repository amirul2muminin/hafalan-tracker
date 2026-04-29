import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import {
  calcHafalanMetrics,
  calcMurojaahMetrics,
  calcExamMetrics,
  calcBalance,
  getLast7DaysChart,
  getWeeklyChart,
  type HafalanMetrics,
  type MurojaahMetrics,
  type ExamMetrics,
  type BalanceStatus,
} from '@/lib/analytics-utils';
import type { Database } from '@/integrations/supabase/types';
import type { HafalanBaruLog, MurojaahLog, UjianLog } from '@/types';
type Student = Database['public']['Tables']['students']['Row'];

export interface UseStudentAnalyticsReturn {
  studentId: string;
  student: Student | undefined;
  hafalan: HafalanMetrics;
  murojaah: MurojaahMetrics;
  exam: ExamMetrics;
  balance: { ratio: number; status: BalanceStatus };
  last7Days: { day: string; hafalan: number; murojaah: number }[];
  weekly: { week: string; hafalan: number; murojaah: number }[];
  examStats: { name: string; value: number }[];
  hLogs: HafalanBaruLog[];
  mLogs: MurojaahLog[];
  uLogs: UjianLog[];
  hasData: boolean;
}

export function useStudentAnalytics(studentId: string): UseStudentAnalyticsReturn {
  const {
    students,
    getStudentHafalanLogs,
    getStudentMurojaahLogs,
    getStudentPersiapanLogs,
    getStudentUjianLogs,
    fetchStudentData,
  } = useAppStore();

  useEffect(() => {
    if (studentId) fetchStudentData(studentId);
  }, [studentId, fetchStudentData]);

  const student = students.find((s) => s.id === studentId);

  const hLogs = getStudentHafalanLogs(studentId);
  const mLogs = getStudentMurojaahLogs(studentId);
  const pLogs = getStudentPersiapanLogs(studentId);
  const uLogs = getStudentUjianLogs(studentId);

  const hafalan = useMemo(
    () => calcHafalanMetrics(hLogs, studentId),
    [hLogs, studentId]
  );

  const murojaah = useMemo(
    () => calcMurojaahMetrics(mLogs, studentId),
    [mLogs, studentId]
  );

  const exam = useMemo(
    () => calcExamMetrics(pLogs, uLogs, studentId),
    [pLogs, uLogs, studentId]
  );

  const balance = useMemo(
    () => calcBalance(hLogs, mLogs, studentId),
    [hLogs, mLogs, studentId]
  );

  const last7Days = useMemo(
    () => getLast7DaysChart(hLogs, mLogs),
    [hLogs, mLogs]
  );

  const weekly = useMemo(
    () => getWeeklyChart(hLogs, mLogs),
    [hLogs, mLogs]
  );

  const examStats = useMemo(() => [
    { name: 'Mumtaz / Jayyid+', value: exam.passed },
    { name: 'Jayyid / Maqbul', value: uLogs.filter(e => e.result === 'jayyid' || e.result === 'maqbul').length },
    { name: 'Gagal', value: exam.failed },
  ].filter((e) => e.value > 0), [exam, uLogs]);

  const hasData = hLogs.length > 0 || mLogs.length > 0 || uLogs.length > 0;

  return {
    studentId,
    student,
    hafalan,
    murojaah,
    exam,
    balance,
    last7Days,
    weekly,
    examStats,
    hLogs,
    mLogs,
    uLogs,
    hasData,
  };
}