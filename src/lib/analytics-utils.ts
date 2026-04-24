import type { HafalanBaruLog, PersiapanUjianLog, UjianLog, MurojaahLog, Student, TargetHafalan, StudentProgress } from '@/types';
import { linesToPages, pagesToJuz } from './juz-mapping';

// ─── Time helpers ────────────────────────────────────────────
export function getDateRange(period: 'week' | 'month' | 'semester' | 'year'): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case 'week': start.setDate(end.getDate() - 6); break;
    case 'month': start.setMonth(end.getMonth() - 1); break;
    case 'semester': start.setMonth(end.getMonth() - 6); break;
    case 'year': start.setFullYear(end.getFullYear() - 1); break;
  }
  return { start, end };
}

export function getPreviousRange(period: 'week' | 'month' | 'semester' | 'year'): { start: Date; end: Date } {
  const { start, end } = getDateRange(period);
  const duration = end.getTime() - start.getTime();
  return { start: new Date(start.getTime() - duration), end: new Date(start.getTime() - 1) };
}

function inRange(dateStr: string, start: Date, end: Date) {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

type BaseLog = { student_id: string; created_at: string };

function filterLogs<T extends BaseLog>(logs: T[], opts: { studentId?: string; start?: Date; end?: Date }): T[] {
  return logs.filter(l => {
    if (opts.studentId && l.student_id !== opts.studentId) return false;
    if (opts.start && opts.end && !inRange(l.created_at, opts.start, opts.end)) return false;
    return true;
  });
}

function sumLines(logs: HafalanBaruLog[]) {
  return logs.reduce((s, l) => s + l.total_lines, 0);
}

function uniqueDays(logs: BaseLog[]) {
  return new Set(logs.map(l => l.created_at.split('T')[0])).size;
}

// ─── Trend calculation ───────────────────────────────────────
export type TrendDirection = 'up' | 'down' | 'stable';

function calcTrend(values: number[]): TrendDirection {
  if (values.length < 2) return 'stable';
  const last = values.slice(-3);
  const diffs = last.slice(1).map((v, i) => v - last[i]);
  const avgDiff = diffs.reduce((s, d) => s + d, 0) / diffs.length;
  if (avgDiff > 0) return 'up';
  if (avgDiff < 0) return 'down';
  return 'stable';
}

// Weekly breakdown for trend (last N weeks)
function weeklyLines(logs: HafalanBaruLog[], weeks: number): number[] {
  const result: number[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(); end.setDate(end.getDate() - i * 7);
    const start = new Date(end); start.setDate(start.getDate() - 6);
    const filtered = filterLogs(logs, { start, end });
    result.push(sumLines(filtered));
  }
  return result;
}

// ─── Streak calculation ──────────────────────────────────────
function calcStreak(logs: BaseLog[]): { current: number; longest: number } {
  const dates = [...new Set(logs.map(l => l.created_at.split('T')[0]))].sort();
  if (!dates.length) return { current: 0, longest: 0 };

  let longest = 1, current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) { current++; longest = Math.max(longest, current); }
    else { current = 1; }
  }
  longest = Math.max(longest, current);

  // Check if streak is active (includes today or yesterday)
  const lastDate = new Date(dates[dates.length - 1]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = (today.getTime() - lastDate.getTime()) / 86400000;
  if (diff > 1) current = 0;

  return { current, longest };
}

// ─── Student Hafalan Metrics ─────────────────────────────────
export interface HafalanMetrics {
  totalLines: number;
  totalPages: number;
  totalJuz: number;
  linesPerDay: number;
  linesThisWeek: number;
  linesLastWeek: number;
  linesThisMonth: number;
  linesLastMonth: number;
  weekGrowth: number; // percentage
  monthGrowth: number;
  trend: TrendDirection;
  weeklyTrend: number[]; // last 8 weeks
  activeDaysThisWeek: number;
  streakCurrent: number;
  streakLongest: number;
  consistencyScore: number; // 0-100
  bestWeekLines: number;
}

export function calcHafalanMetrics(logs: HafalanBaruLog[], studentId?: string): HafalanMetrics {
  const all = filterLogs(logs, { studentId });
  const totalLines = sumLines(all);
  const totalPages = linesToPages(totalLines);
  const totalJuz = pagesToJuz(totalPages);

  const { start: ws, end: we } = getDateRange('week');
  const { start: pws, end: pwe } = getPreviousRange('week');
  const { start: ms, end: me } = getDateRange('month');
  const { start: pms, end: pme } = getPreviousRange('month');

  const linesThisWeek = sumLines(filterLogs(all, { start: ws, end: we }));
  const linesLastWeek = sumLines(filterLogs(all, { start: pws, end: pwe }));
  const linesThisMonth = sumLines(filterLogs(all, { start: ms, end: me }));
  const linesLastMonth = sumLines(filterLogs(all, { start: pms, end: pme }));

  const weekGrowth = linesLastWeek ? ((linesThisWeek - linesLastWeek) / linesLastWeek) * 100 : 0;
  const monthGrowth = linesLastMonth ? ((linesThisMonth - linesLastMonth) / linesLastMonth) * 100 : 0;

  const wt = weeklyLines(all, 8);
  const trend = calcTrend(wt);

  const activeDaysThisWeek = uniqueDays(filterLogs(all, { start: ws, end: we }));
  const { current: streakCurrent, longest: streakLongest } = calcStreak(all);

  // Consistency: active days / 7 * weight + streak bonus
  const consistencyScore = Math.min(100, Math.round((activeDaysThisWeek / 7) * 70 + Math.min(streakCurrent, 7) / 7 * 30));

  const bestWeekLines = Math.max(...wt, 0);

  const daysSinceFirst = all.length ? Math.max(1, Math.ceil((Date.now() - new Date(all[all.length - 1].created_at).getTime()) / 86400000)) : 1;
  const linesPerDay = Math.round(totalLines / daysSinceFirst);

  return {
    totalLines, totalPages, totalJuz,
    linesPerDay, linesThisWeek, linesLastWeek, linesThisMonth, linesLastMonth,
    weekGrowth, monthGrowth, trend, weeklyTrend: wt,
    activeDaysThisWeek, streakCurrent, streakLongest, consistencyScore, bestWeekLines,
  };
}

// ─── Murojaah Metrics ────────────────────────────────────────
export interface MurojaahMetrics {
  totalPages: number;
  avgPagesPerWeek: number;
  activeDaysThisWeek: number;
  consistency: number; // 0-100
  weeklyTrend: number[];
  trend: TrendDirection;
}

export function calcMurojaahMetrics(logs: MurojaahLog[], studentId?: string): MurojaahMetrics {
  const all = filterLogs(logs, { studentId });
  const totalPages = all.reduce((s, l) => s + l.total_pages, 0);

  const { start: ws, end: we } = getDateRange('week');
  const activeDaysThisWeek = uniqueDays(filterLogs(all, { start: ws, end: we }));

  const wt: number[] = [];
  for (let i = 7; i >= 0; i--) {
    const end = new Date(); end.setDate(end.getDate() - i * 7);
    const start = new Date(end); start.setDate(start.getDate() - 6);
    const filtered = filterLogs(all, { start, end });
    wt.push(filtered.reduce((s, l) => s + l.total_pages, 0));
  }

  const avgPagesPerWeek = wt.length ? Math.round(wt.reduce((s, v) => s + v, 0) / wt.length) : 0;

  return {
    totalPages,
    avgPagesPerWeek,
    activeDaysThisWeek,
    consistency: Math.min(100, Math.round((activeDaysThisWeek / 5) * 100)),
    weeklyTrend: wt,
    trend: calcTrend(wt),
  };
}

// ─── Exam/Prep Metrics ──────────────────────────────────────
export interface ExamMetrics {
  totalExams: number;
  passed: number;
  failed: number;
  passRate: number;
  avgPrepDays: number;
  prepBenchmark: 'excellent' | 'normal' | 'slow' | 'critical' | 'none';
  prepTrend: TrendDirection;
}

export function calcExamMetrics(prepLogs: PersiapanUjianLog[], ujianLogs: UjianLog[], studentId?: string): ExamMetrics {
  const studentExams = filterLogs(ujianLogs, { studentId });
  const passed = studentExams.filter(e => e.result === 'mumtaz' || e.result === 'jayyid_jiddan_plus' || e.result === 'jayyid_jiddan' || e.result === 'jayyid_plus' || e.result === 'jayyid' || e.result === 'maqbul').length;
  const failed = studentExams.filter(e => e.result === 'rosib').length;
  const totalExams = studentExams.length;
  const passRate = totalExams > 0 ? Math.round((passed / (passed + failed || 1)) * 100) : 0;

  const sPrepLogs = filterLogs(prepLogs, { studentId });
  const prepDaysPerExam: number[] = [];

  for (const exam of studentExams) {
    const examDate = new Date(exam.created_at);
    const twoWeeksBefore = new Date(examDate); twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);
    const days = uniqueDays(filterLogs(sPrepLogs, { start: twoWeeksBefore, end: examDate }));
    if (days > 0) prepDaysPerExam.push(days);
  }

  const avgPrepDays = prepDaysPerExam.length ? Math.round(prepDaysPerExam.reduce((s, d) => s + d, 0) / prepDaysPerExam.length) : 0;

  let prepBenchmark: ExamMetrics['prepBenchmark'] = 'none';
  if (avgPrepDays > 0) {
    if (avgPrepDays <= 3) prepBenchmark = 'excellent';
    else if (avgPrepDays <= 5) prepBenchmark = 'normal';
    else if (avgPrepDays <= 7) prepBenchmark = 'slow';
    else prepBenchmark = 'critical';
  }

  return {
    totalExams, passed, failed, passRate,
    avgPrepDays, prepBenchmark, prepTrend: calcTrend(prepDaysPerExam),
  };
}

// ─── Balance Metric ──────────────────────────────────────────
export type BalanceStatus = 'balanced' | 'hafalan_heavy' | 'murojaah_heavy' | 'no_data';

export function calcBalance(hLogs: HafalanBaruLog[], mLogs: MurojaahLog[], studentId?: string): { ratio: number; status: BalanceStatus } {
  const { start, end } = getDateRange('month');
  const hafalanLines = sumLines(filterLogs(hLogs, { studentId, start, end }));
  const murojaahLines = filterLogs(mLogs, { studentId, start, end }).reduce((s, l) => s + l.total_pages * 15, 0); // approx lines

  if (!hafalanLines && !murojaahLines) return { ratio: 0, status: 'no_data' };
  const total = hafalanLines + murojaahLines;
  const ratio = hafalanLines / (total || 1);

  if (ratio > 0.7) return { ratio, status: 'hafalan_heavy' };
  if (ratio < 0.3) return { ratio, status: 'murojaah_heavy' };
  return { ratio, status: 'balanced' };
}

// ─── Alerts ──────────────────────────────────────────────────
export interface Alert {
  studentId: string;
  studentName: string;
  type: 'warning' | 'danger';
  category: 'hafalan' | 'murojaah' | 'ujian';
  message: string;
}

export function generateAlerts(
  students: Student[], 
  hLogs: HafalanBaruLog[], 
  mLogs: MurojaahLog[], 
  pLogs: PersiapanUjianLog[]
): Alert[] {
  const alerts: Alert[] = [];
  const today = new Date();

  for (const student of students) {
    const hafalanLogs = hLogs.filter(l => l.student_id === student.id);
    const murojaahLogs = mLogs.filter(l => l.student_id === student.id);

    // Hafalan: no setoran > 3 days
    if (hafalanLogs.length > 0) {
      const lastDate = new Date(Math.max(...hafalanLogs.map(l => new Date(l.created_at).getTime())));
      const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);
      if (daysSince > 3) {
        alerts.push({
          studentId: student.id, studentName: student.name,
          type: daysSince > 5 ? 'danger' : 'warning',
          category: 'hafalan',
          message: `Tidak setor ${daysSince} hari`,
        });
      }
    }

    // Hafalan: growth declining
    const wt = weeklyLines(hafalanLogs, 4);
    if (wt.length >= 3) {
      const declines = wt.slice(1).filter((v, i) => v < wt[i]).length;
      if (declines >= 2) {
        alerts.push({
          studentId: student.id, studentName: student.name,
          type: 'warning', category: 'hafalan',
          message: 'Hafalan menurun 2 minggu berturut-turut',
        });
      }
    }

    // Hafalan: active days < 3 this week
    const { start: ws, end: we } = getDateRange('week');
    const activeDays = uniqueDays(filterLogs(hafalanLogs, { start: ws, end: we }));
    if (activeDays < 3 && hafalanLogs.length > 0) {
      alerts.push({
        studentId: student.id, studentName: student.name,
        type: 'warning', category: 'hafalan',
        message: `Hanya aktif ${activeDays} hari minggu ini`,
      });
    }

    // Murojaah: jarang
    if (murojaahLogs.length > 0) {
      const lastMuro = new Date(Math.max(...murojaahLogs.map(l => new Date(l.created_at).getTime())));
      const daysSince = Math.floor((today.getTime() - lastMuro.getTime()) / 86400000);
      if (daysSince > 5) {
        alerts.push({
          studentId: student.id, studentName: student.name,
          type: 'warning', category: 'murojaah',
          message: `Tidak murojaah ${daysSince} hari`,
        });
      }
    }
  }

  return alerts.sort((a, b) => (a.type === 'danger' ? -1 : 1) - (b.type === 'danger' ? -1 : 1));
}

// ─── Student Ranking ─────────────────────────────────────────
export interface StudentRanking {
  studentId: string;
  name: string;
  linesThisWeek: number;
  consistency: number;
  prepEfficiency: number;
  tier: 'top' | 'middle' | 'bottom';
}

export function calcStudentRankings(
  students: Student[], 
  hLogs: HafalanBaruLog[], 
  pLogs: PersiapanUjianLog[], 
  uLogs: UjianLog[]
): StudentRanking[] {
  const rankings = students.map(s => {
    const h = calcHafalanMetrics(hLogs, s.id);
    const e = calcExamMetrics(pLogs, uLogs, s.id);
    return {
      studentId: s.id,
      name: s.name,
      linesThisWeek: h.linesThisWeek,
      consistency: h.consistencyScore,
      prepEfficiency: e.avgPrepDays || 0,
      tier: 'middle' as 'top' | 'middle' | 'bottom',
    };
  }).sort((a, b) => b.linesThisWeek - a.linesThisWeek);

  const top20 = Math.ceil(rankings.length * 0.2);
  const bottom20 = Math.floor(rankings.length * 0.8);
  rankings.forEach((r, i) => {
    if (i < top20) r.tier = 'top';
    else if (i >= bottom20) r.tier = 'bottom';
  });

  return rankings;
}

// ─── Daily chart data (last 7 days) ──────────────────────────
export function getLast7DaysChart(hLogs: HafalanBaruLog[], mLogs: MurojaahLog[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayHLogs = hLogs.filter(l => l.created_at.startsWith(dateStr));
    const dayMLogs = mLogs.filter(l => l.created_at.startsWith(dateStr));
    return {
      day: d.toLocaleDateString('id', { weekday: 'short' }),
      hafalan: dayHLogs.reduce((s, l) => s + l.total_lines, 0),
      murojaah: dayMLogs.reduce((s, l) => s + l.total_pages * 15, 0),
    };
  });
}

// ─── Weekly chart data (last 8 weeks) ────────────────────────
export function getWeeklyChart(hLogs: HafalanBaruLog[], mLogs: MurojaahLog[]) {
  return Array.from({ length: 8 }, (_, i) => {
    const end = new Date(); end.setDate(end.getDate() - (7 - i) * 7);
    const start = new Date(end); start.setDate(start.getDate() - 6);
    const weekHLogs = filterLogs(hLogs, { start, end });
    const weekMLogs = filterLogs(mLogs, { start, end });
    return {
      week: `M${8 - (7 - i)}`,
      hafalan: weekHLogs.reduce((s, l) => s + l.total_lines, 0),
      murojaah: weekMLogs.reduce((s, l) => s + l.total_pages * 15, 0),
    };
  });
}

// ─── Class summary ───────────────────────────────────────────
export interface ClassSummary {
  totalStudents: number;
  avgLinesPerWeek: number;
  avgMurojaahPages: number;
  avgPrepDays: number;
  activeStudents: number;
  decliningStudents: number;
  alertCount: number;
}

export function calcClassSummary(
  students: Student[], 
  hLogs: HafalanBaruLog[], 
  pLogs: PersiapanUjianLog[], 
  uLogs: UjianLog[], 
  mLogs: MurojaahLog[]
): ClassSummary {
  const alerts = generateAlerts(students, hLogs, mLogs, pLogs);
  let totalLinesWeek = 0, totalMuroPages = 0, totalPrep = 0, declining = 0, active = 0;
  let prepCount = 0;

  for (const s of students) {
    const h = calcHafalanMetrics(hLogs, s.id);
    const m = calcMurojaahMetrics(mLogs, s.id);
    const e = calcExamMetrics(pLogs, uLogs, s.id);
    totalLinesWeek += h.linesThisWeek;
    totalMuroPages += m.avgPagesPerWeek;
    if (e.avgPrepDays > 0) { totalPrep += e.avgPrepDays; prepCount++; }
    if (h.trend === 'down') declining++;
    if (h.activeDaysThisWeek > 0) active++;
  }

  const n = students.length || 1;
  return {
    totalStudents: students.length,
    avgLinesPerWeek: Math.round(totalLinesWeek / n),
    avgMurojaahPages: Math.round(totalMuroPages / n),
    avgPrepDays: prepCount ? Math.round(totalPrep / prepCount) : 0,
    activeStudents: active,
    decliningStudents: declining,
    alertCount: alerts.length,
  };
}

export interface TargetMetrics {
  id: string;
  targetType: TargetHafalan['target_type'];
  targetValue: number;
  currentValue: number;
  progressPct: number;
  deadline: string;
  status: 'completed' | 'on-track' | 'late';
}

export function calcTargetMetrics(
  targets: TargetHafalan[],
  progress: StudentProgress,
): TargetMetrics[] {
  return targets.map((t) => {
    const currentValue = t.current_value ?? (
      t.target_type === 'juz' ? progress.total_juz
        : t.target_type === 'page' ? progress.total_pages
        : progress.total_lines
    );
    const progressPct = Math.min(100, Math.round((currentValue / t.target_value) * 100));
    const deadline = new Date(t.deadline);
    const isLate = deadline < new Date() && progressPct < 100;
    const status: TargetMetrics['status'] = progressPct >= 100 ? 'completed' : isLate ? 'late' : 'on-track';
    return { id: t.id, targetType: t.target_type, targetValue: t.target_value, currentValue, progressPct, deadline: t.deadline, status };
  });
}
