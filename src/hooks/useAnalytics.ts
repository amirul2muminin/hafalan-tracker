import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import {
  calcHafalanMetrics,
  calcMurojaahMetrics,
  calcExamMetrics,
  calcBalance,
  generateAlerts,
  calcStudentRankings,
  calcClassSummary,
  getLast7DaysChart,
  getWeeklyChart,
  type Alert,
  type HafalanMetrics,
  type MurojaahMetrics,
  type ExamMetrics,
  type BalanceStatus,
  type StudentRanking,
  type ClassSummary,
} from '@/lib/analytics-utils';

export interface UseAnalyticsReturn {
  hafalan: HafalanMetrics;
  murojaah: MurojaahMetrics;
  exam: ExamMetrics;
  balance: { ratio: number; status: BalanceStatus };
  alerts: Alert[];
  rankings: StudentRanking[];
  classSummary: ClassSummary;
  last7Days: { day: string; hafalan: number; murojaah: number }[];
  weekly: { week: string; hafalan: number; murojaah: number }[];
  examStats: { name: string; value: number }[];
  totalLogs: number;
  totalLines: number;
}

export function useAnalytics(): UseAnalyticsReturn {
  const {
    students,
    hafalanBaruLogs,
    murojaahLogs,
    persiapanUjianLogs,
    ujianLogs,
    fetchAll,
  } = useAppStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const hafalan = useMemo(
    () => calcHafalanMetrics(hafalanBaruLogs),
    [hafalanBaruLogs]
  );

  const murojaah = useMemo(
    () => calcMurojaahMetrics(murojaahLogs),
    [murojaahLogs]
  );

  const exam = useMemo(
    () => calcExamMetrics(persiapanUjianLogs, ujianLogs),
    [persiapanUjianLogs, ujianLogs]
  );

  const balance = useMemo(
    () => calcBalance(hafalanBaruLogs, murojaahLogs),
    [hafalanBaruLogs, murojaahLogs]
  );

  const alerts = useMemo(
    () => generateAlerts(students, hafalanBaruLogs, murojaahLogs, persiapanUjianLogs),
    [students, hafalanBaruLogs, murojaahLogs, persiapanUjianLogs]
  );

  const rankings = useMemo(
    () => calcStudentRankings(students, hafalanBaruLogs, persiapanUjianLogs, ujianLogs),
    [students, hafalanBaruLogs, persiapanUjianLogs, ujianLogs]
  );

  const classSummary = useMemo(
    () => calcClassSummary(students, hafalanBaruLogs, persiapanUjianLogs, ujianLogs, murojaahLogs),
    [students, hafalanBaruLogs, persiapanUjianLogs, ujianLogs, murojaahLogs]
  );

  const last7Days = useMemo(
    () => getLast7DaysChart(hafalanBaruLogs, murojaahLogs),
    [hafalanBaruLogs, murojaahLogs]
  );

  const weekly = useMemo(
    () => getWeeklyChart(hafalanBaruLogs, murojaahLogs),
    [hafalanBaruLogs, murojaahLogs]
  );

  const examStats = useMemo(() => [
    { name: 'Mumtaz / Jayyid+', value: exam.passed },
    { name: 'Jayyid / Maqbul', value: ujianLogs.filter(e => e.result === 'jayyid' || e.result === 'maqbul').length },
    { name: 'Gagal', value: exam.failed },
  ].filter(e => e.value > 0), [exam, ujianLogs]);

  const totalLogs = hafalanBaruLogs.length + murojaahLogs.length + persiapanUjianLogs.length + ujianLogs.length;

  const totalLines = useMemo(
    () => hafalanBaruLogs.reduce((s, l) => s + l.total_lines, 0),
    [hafalanBaruLogs]
  );

  return {
    hafalan,
    murojaah,
    exam,
    balance,
    alerts,
    rankings,
    classSummary,
    last7Days,
    weekly,
    examStats,
    totalLogs,
    totalLines,
  };
}