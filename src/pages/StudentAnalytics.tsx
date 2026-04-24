import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip } from 'recharts';
import {
  calcHafalanMetrics, calcMurojaahMetrics, calcExamMetrics,
  calcBalance, getLast7DaysChart, getWeeklyChart,
  calcTargetMetrics,
} from '@/lib/analytics-utils';
import { TrendIcon, GrowthBadge, MetricCard, PrepBenchmarkBadge, BalanceBadge } from '@/components/analytics/shared';
import { Flame, Target, BookOpen, RefreshCw, GraduationCap, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(213,94%,56%)', 'hsl(152,69%,41%)', 'hsl(25,95%,53%)', 'hsl(199,89%,48%)'];

const StudentAnalytics = () => {
  const { studentId } = useParams();
  const { students, getStudentHafalanLogs, getStudentMurojaahLogs, getStudentPersiapanLogs, getStudentUjianLogs, getStudentTargets, getStudentProgress, fetchStudentData } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (studentId) fetchStudentData(studentId);
  }, [studentId, fetchStudentData]);

  const student = students.find((s) => s.id === studentId);
  if (!student) return <div className="p-4">Murid tidak ditemukan</div>;

  const hLogs = getStudentHafalanLogs(student.id);
  const mLogs = getStudentMurojaahLogs(student.id);
  const pLogs = getStudentPersiapanLogs(student.id);
  const uLogs = getStudentUjianLogs(student.id);
  const targets = getStudentTargets(student.id);
  const progress = getStudentProgress(student.id);

  const hafalan = useMemo(() => calcHafalanMetrics(hLogs, student.id), [hLogs, student.id]);
  const murojaah = useMemo(() => calcMurojaahMetrics(mLogs, student.id), [mLogs, student.id]);
  const exam = useMemo(() => calcExamMetrics(pLogs, uLogs, student.id), [pLogs, uLogs, student.id]);
  const balance = useMemo(() => calcBalance(hLogs, mLogs, student.id), [hLogs, mLogs, student.id]);
  const targetMetrics = useMemo(() => calcTargetMetrics(targets, progress), [targets, progress]);
  const last7 = useMemo(() => getLast7DaysChart(hLogs, mLogs), [hLogs, mLogs]);
  const weekly = useMemo(() => getWeeklyChart(hLogs, mLogs), [hLogs, mLogs]);

  const examStats = useMemo(() => [
    { name: 'Mumtaz / Jayyid+', value: exam.passed },
    { name: 'Jayyid / Maqbul', value: uLogs.filter(e => e.result === 'jayyid' || e.result === 'maqbul').length },
    { name: 'Gagal', value: exam.failed },
  ].filter((e) => e.value > 0), [exam, uLogs]);

  const hasData = hLogs.length > 0 || mLogs.length > 0 || uLogs.length > 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title={student.name} subtitle="Analitik Hafalan" back />

      <div className="px-4 pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5 h-9 mb-4">
            <TabsTrigger value="overview" className="text-[10px] px-1">Ringkasan</TabsTrigger>
            <TabsTrigger value="hafalan" className="text-[10px] px-1">Hafalan</TabsTrigger>
            <TabsTrigger value="murojaah" className="text-[10px] px-1">Murojaah</TabsTrigger>
            <TabsTrigger value="ujian" className="text-[10px] px-1">Ujian</TabsTrigger>
            <TabsTrigger value="target" className="text-[10px] px-1">Target</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            {!hasData ? (
              <div className="bg-card rounded-xl p-8 border border-border text-center">
                <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">Belum ada data</p>
                <p className="text-xs text-muted-foreground mt-1">Data akan muncul setelah murid memiliki catatan hafalan</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <MetricCard label="Total Baris" value={hafalan.totalLines} icon={<BookOpen className="w-3.5 h-3.5 text-hafalan" />} />
                  <MetricCard label="Baris/Minggu" value={hafalan.linesThisWeek} icon={<BarChart3 className="w-3.5 h-3.5 text-primary" />} />
                  <MetricCard label="Konsistensi" value={`${hafalan.consistencyScore}%`} icon={<Flame className="w-3.5 h-3.5 text-ujian" />} />
                </div>

                <div className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="text-xs font-bold text-foreground mb-3">Aktivitas 7 Hari Terakhir (baris)</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={last7}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="hafalan" fill="hsl(var(--hafalan))" radius={[4, 4, 0, 0]} name="Hafalan" />
                      <Bar dataKey="murojaah" fill="hsl(var(--murojaah))" radius={[4, 4, 0, 0]} name="Murojaah" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 justify-center mt-2">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-hafalan" /><span className="text-[10px] text-muted-foreground">Hafalan</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-murojaah" /><span className="text-[10px] text-muted-foreground">Murojaah</span></div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="text-xs font-bold text-foreground mb-2">Keseimbangan Bulan Ini</h3>
                  <div className="flex items-center justify-between">
                    <BalanceBadge status={balance.status} />
                    <span className="text-xs text-muted-foreground">Rasio: {Math.round(balance.ratio * 100)}% hafalan</span>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-primary" /> Tren 8 Minggu
                  </h3>
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={weekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="hafalan" stroke="hsl(var(--hafalan))" strokeWidth={2} dot={{ r: 3 }} name="Hafalan (baris)" />
                      <Line type="monotone" dataKey="murojaah" stroke="hsl(var(--murojaah))" strokeWidth={2} dot={{ r: 3 }} name="Murojaah (baris)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </TabsContent>

          {/* ── HAFALAN ── */}
          <TabsContent value="hafalan" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard
                label="Total Baris" value={hafalan.totalLines}
                sub={<span className="text-[10px] text-muted-foreground">{hafalan.totalPages} hal · {hafalan.totalJuz.toFixed(1)} juz</span>}
                icon={<BookOpen className="w-3.5 h-3.5 text-hafalan" />}
              />
              <MetricCard
                label="Baris/Hari" value={hafalan.linesPerDay}
                sub={<TrendIcon dir={hafalan.trend} />}
                icon={<BarChart3 className="w-3.5 h-3.5 text-hafalan" />}
              />
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-xs font-bold text-foreground mb-3">Pertumbuhan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Minggu Ini</p>
                  <p className="text-lg font-bold text-foreground">{hafalan.linesThisWeek} <span className="text-xs font-normal">baris</span></p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <GrowthBadge value={hafalan.weekGrowth} />
                    <span className="text-[10px] text-muted-foreground">vs minggu lalu ({hafalan.linesLastWeek})</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Bulan Ini</p>
                  <p className="text-lg font-bold text-foreground">{hafalan.linesThisMonth} <span className="text-xs font-normal">baris</span></p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <GrowthBadge value={hafalan.monthGrowth} />
                    <span className="text-[10px] text-muted-foreground">vs bulan lalu</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                Tren 8 Minggu <TrendIcon dir={hafalan.trend} />
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="hafalan" stroke="hsl(var(--hafalan))" strokeWidth={2} dot={{ r: 3 }} name="Hafalan (baris)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-xs font-bold text-foreground mb-3">Konsistensi</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="w-3.5 h-3.5 text-ujian" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{hafalan.streakCurrent}</p>
                  <p className="text-[10px] text-muted-foreground">Streak Hari</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{hafalan.activeDaysThisWeek}/7</p>
                  <p className="text-[10px] text-muted-foreground">Hari Aktif</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{hafalan.consistencyScore}%</p>
                  <p className="text-[10px] text-muted-foreground">Skor</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Konsistensi</span>
                  <span>{hafalan.consistencyScore}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="h-2 rounded-full bg-hafalan transition-all" style={{ width: `${hafalan.consistencyScore}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Best Week" value={`${hafalan.bestWeekLines} baris`} icon={<Target className="w-3.5 h-3.5 text-ujian" />} />
              <MetricCard label="Streak Terlama" value={`${hafalan.streakLongest} hari`} icon={<Flame className="w-3.5 h-3.5 text-ujian" />} />
            </div>
          </TabsContent>

          {/* ── MUROJAAH ── */}
          <TabsContent value="murojaah" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard
                label="Total Halaman" value={murojaah.totalPages}
                icon={<RefreshCw className="w-3.5 h-3.5 text-murojaah" />}
              />
              <MetricCard
                label="Rata-rata/Minggu" value={`${murojaah.avgPagesPerWeek} hal`}
                sub={<TrendIcon dir={murojaah.trend} />}
                icon={<BarChart3 className="w-3.5 h-3.5 text-murojaah" />}
              />
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                Tren 8 Minggu <TrendIcon dir={murojaah.trend} />
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="murojaah" stroke="hsl(var(--murojaah))" strokeWidth={2} dot={{ r: 3 }} name="Murojaah (baris)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-xs font-bold text-foreground mb-3">Konsistensi Murojaah</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{murojaah.activeDaysThisWeek}/5</p>
                  <p className="text-[10px] text-muted-foreground">Hari Aktif Minggu Ini</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{murojaah.consistency}%</p>
                  <p className="text-[10px] text-muted-foreground">Skor Konsistensi</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="h-2 rounded-full bg-murojaah transition-all" style={{ width: `${murojaah.consistency}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-xs font-bold text-foreground mb-2">Target: 20 Halaman/Minggu</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-murojaah transition-all"
                      style={{ width: `${Math.min(100, (murojaah.avgPagesPerWeek / 20) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-foreground">{Math.round((murojaah.avgPagesPerWeek / 20) * 100)}%</span>
              </div>
            </div>
          </TabsContent>

          {/* ── UJIAN ── */}
          <TabsContent value="ujian" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="Total Ujian" value={exam.totalExams} icon={<GraduationCap className="w-3.5 h-3.5 text-ujian" />} />
              <MetricCard label="Pass Rate" value={`${exam.passRate}%`} icon={<Target className="w-3.5 h-3.5 text-success" />} />
            </div>

            {examStats.length > 0 && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <h3 className="text-xs font-bold text-foreground mb-3">Status Ujian</h3>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={examStats} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                        {examStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 ml-4">
                    {examStats.map((s, i) => (
                      <div key={s.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-foreground">{s.name}: <b>{s.value}</b></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-xs font-bold text-foreground mb-3">Persiapan Ujian</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Rata-rata Persiapan</p>
                  <p className="text-lg font-bold text-foreground">{exam.avgPrepDays} <span className="text-xs font-normal">hari</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Benchmark</p>
                  <PrepBenchmarkBadge benchmark={exam.prepBenchmark} />
                </div>
              </div>
              <div className="mt-3 text-[10px] text-muted-foreground space-y-0.5">
                <p>≤3 hari: <span className="text-success font-medium">Excellent</span></p>
                <p>3-5 hari: <span className="text-hafalan-foreground font-medium">Normal</span></p>
                <p>6-7 hari: <span className="text-warning font-medium">Lambat</span></p>
                <p>&gt;7 hari: <span className="text-destructive font-medium">Kritis</span></p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Tren Persiapan</p>
                <p className="text-xs font-bold text-foreground capitalize">{exam.prepTrend === 'up' ? 'Meningkat' : exam.prepTrend === 'down' ? 'Membaik' : 'Stabil'}</p>
              </div>
              <TrendIcon dir={exam.prepTrend === 'up' ? 'down' : exam.prepTrend === 'down' ? 'up' : 'stable'} />
            </div>
          </TabsContent>

          {/* ── TARGET ── */}
          <TabsContent value="target" className="space-y-3 mt-0">
            {targetMetrics.length === 0 ? (
              <div className="bg-card rounded-xl p-8 border border-border text-center">
                <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">Belum ada target</p>
                <p className="text-xs text-muted-foreground mt-1">Target dapat ditambahkan dari halaman detail murid</p>
              </div>
            ) : (
              targetMetrics.map((t) => (
                <div key={t.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">
                      {t.targetValue} {t.targetType === 'page' ? 'halaman' : t.targetType === 'line' ? 'baris' : 'juz'}
                    </span>
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                      t.status === 'completed' && 'bg-success/10 text-success',
                      t.status === 'late' && 'bg-destructive/10 text-destructive',
                      t.status === 'on-track' && 'bg-primary/10 text-primary',
                    )}>
                      {t.status === 'completed' ? 'Selesai' : t.status === 'late' ? 'Terlambat' : 'On Track'}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                    <div className={cn(
                      'h-full rounded-full transition-all',
                      t.status === 'completed' ? 'bg-success' : t.status === 'late' ? 'bg-destructive' : 'bg-primary',
                    )} style={{ width: `${t.progressPct}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">{t.currentValue}/{t.targetValue} · {t.progressPct}%</span>
                    <span className="text-[10px] text-muted-foreground">Deadline: {new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default StudentAnalytics;
