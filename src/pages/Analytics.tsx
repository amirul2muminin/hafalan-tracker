import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TrendIcon, GrowthBadge, MetricCard, PrepBenchmarkBadge, BalanceBadge } from '@/components/analytics/shared';
import { AlertTriangle, AlertCircle, Flame, Target, BookOpen, RefreshCw, GraduationCap, Users, BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(213,94%,56%)', 'hsl(152,69%,41%)', 'hsl(25,95%,53%)', 'hsl(199,89%,48%)'];

const AlertItem = ({ alert }: { alert: { studentName: string; message: string; type: 'danger' | 'warning'; category: string } }) => (
  <div className={cn(
    'flex items-start gap-3 p-3 rounded-lg border',
    alert.type === 'danger' ? 'bg-destructive/5 border-destructive/20' : 'bg-warning/5 border-warning/20',
  )}>
    {alert.type === 'danger' ? <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />}
    <div className="min-w-0">
      <p className="text-xs font-bold text-foreground">{alert.studentName}</p>
      <p className="text-[11px] text-muted-foreground">{alert.message}</p>
    </div>
    <span className={cn(
      'text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ml-auto',
      alert.category === 'hafalan' && 'bg-hafalan-light text-hafalan-foreground',
      alert.category === 'murojaah' && 'bg-murojaah-light text-murojaah-foreground',
      alert.category === 'ujian' && 'bg-ujian-light text-ujian-foreground',
    )}>{alert.category}</span>
  </div>
);

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const {
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
  } = useAnalytics();

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Analitik" subtitle="Statistik & monitoring hafalan" />

      <div className="px-4 pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5 h-9 mb-4">
            <TabsTrigger value="overview" className="text-[10px] px-1">Ringkasan</TabsTrigger>
            <TabsTrigger value="hafalan" className="text-[10px] px-1">Hafalan</TabsTrigger>
            <TabsTrigger value="murojaah" className="text-[10px] px-1">Murojaah</TabsTrigger>
            <TabsTrigger value="ujian" className="text-[10px] px-1">Ujian</TabsTrigger>
            <TabsTrigger value="alerts" className="text-[10px] px-1 relative">
              Peringatan
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center">{alerts.length}</span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Class Summary */}
            <div className="grid grid-cols-3 gap-2">
              <MetricCard label="Murid Aktif" value={`${classSummary.activeStudents}/${classSummary.totalStudents}`} icon={<Users className="w-3.5 h-3.5 text-primary" />} />
              <MetricCard label="Menurun" value={classSummary.decliningStudents} icon={<TrendingDown className="w-3.5 h-3.5 text-destructive" />} />
              <MetricCard label="Peringatan" value={alerts.length} icon={<AlertTriangle className="w-3.5 h-3.5 text-warning" />} />
            </div>

            {/* 7-day chart */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-xs font-bold text-foreground mb-3">Aktivitas 7 Hari Terakhir (baris)</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last7Days}>
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

            {/* Balance */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-xs font-bold text-foreground mb-2">Keseimbangan Bulan Ini</h3>
              <div className="flex items-center justify-between">
                <BalanceBadge status={balance.status} />
                <span className="text-xs text-muted-foreground">Rasio: {Math.round(balance.ratio * 100)}% hafalan</span>
              </div>
            </div>

            {/* Top Students */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-primary" /> Ranking Murid (Baris/Minggu)
              </h3>
              {rankings.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Belum ada data</p>
              ) : (
                <div className="space-y-2">
                  {rankings.slice(0, 5).map((r, i) => (
                    <div key={r.studentId} className="flex items-center gap-2">
                      <span className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                        r.tier === 'top' ? 'bg-hafalan text-primary-foreground' : r.tier === 'bottom' ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground',
                      )}>{i + 1}</span>
                      <span className="text-xs text-foreground flex-1 truncate">{r.name}</span>
                      <span className="text-xs font-bold text-foreground">{r.linesThisWeek} baris</span>
                      <div className="w-12 bg-muted rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-hafalan" style={{ width: `${Math.min(100, (r.consistency))}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Total Catatan" value={totalLogs} icon={<BookOpen className="w-3.5 h-3.5 text-primary" />} />
              <MetricCard label="Total Baris" value={totalLines} icon={<Target className="w-3.5 h-3.5 text-hafalan" />} />
            </div>
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
                icon={<TrendingUp className="w-3.5 h-3.5 text-hafalan" />}
              />
            </div>

            {/* Growth comparison */}
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

            {/* Weekly Trend Line */}
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

            {/* Consistency */}
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

            {/* Achievement */}
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
                icon={<TrendingUp className="w-3.5 h-3.5 text-murojaah" />}
              />
            </div>

            {/* Weekly Trend */}
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

            {/* Consistency */}
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

            {/* Quality target */}
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

            {/* Pie chart */}
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

            {/* Prep metrics */}
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

            {/* Prep trend */}
            <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Tren Persiapan</p>
                <p className="text-xs font-bold text-foreground capitalize">{exam.prepTrend === 'up' ? 'Meningkat' : exam.prepTrend === 'down' ? 'Membaik' : 'Stabil'}</p>
              </div>
              <TrendIcon dir={exam.prepTrend === 'up' ? 'down' : exam.prepTrend === 'down' ? 'up' : 'stable'} />
            </div>
          </TabsContent>

          {/* ── ALERTS ── */}
          <TabsContent value="alerts" className="space-y-3 mt-0">
            {alerts.length === 0 ? (
              <div className="bg-card rounded-xl p-8 border border-border text-center">
                <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-success" />
                </div>
                <p className="text-sm font-bold text-foreground">Semua Baik!</p>
                <p className="text-xs text-muted-foreground mt-1">Tidak ada peringatan saat ini</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-foreground">{alerts.length} Peringatan</h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive">
                      {alerts.filter(a => a.type === 'danger').length} kritis
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/15 text-warning">
                      {alerts.filter(a => a.type === 'warning').length} warning
                    </span>
                  </div>
                </div>
                {alerts.map((alert, i) => <AlertItem key={i} alert={alert} />)}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Analytics;