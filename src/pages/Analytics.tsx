import { useAppStore } from '@/stores/useAppStore';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(213,94%,56%)', 'hsl(152,69%,41%)', 'hsl(25,95%,53%)', 'hsl(199,89%,48%)'];

const Analytics = () => {
  const { students, dailyLogs, exams, getStudentProgress } = useAppStore();

  // Daily hafalan last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLogs = dailyLogs.filter((l) => l.date === dateStr);
    return {
      day: d.toLocaleDateString('id', { weekday: 'short' }),
      hafalan: dayLogs.filter((l) => l.category === 'hafalan_baru').reduce((s, l) => s + l.total_ayah, 0),
      murojaah: dayLogs.filter((l) => l.category === 'murojaah').reduce((s, l) => s + l.total_ayah, 0),
    };
  });

  // Exam stats
  const examStats = [
    { name: 'Lulus', value: exams.filter((e) => e.status === 'passed').length },
    { name: 'Pending', value: exams.filter((e) => e.status === 'pending').length },
    { name: 'Gagal', value: exams.filter((e) => e.status === 'failed').length },
  ].filter((e) => e.value > 0);

  // Top students
  const studentProgress = students.map((s) => ({
    name: s.name.split(' ')[0],
    ayah: getStudentProgress(s.id).total_ayah,
  })).sort((a, b) => b.ayah - a.ayah).slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Analitik" subtitle="Statistik hafalan" />
      <div className="px-4 pt-4 space-y-4">
        {/* Daily Chart */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-xs font-bold text-foreground mb-3">Hafalan 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Bar dataKey="hafalan" fill="hsl(213,94%,56%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="murojaah" fill="hsl(152,69%,41%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-hafalan" /><span className="text-[10px] text-muted-foreground">Hafalan</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-murojaah" /><span className="text-[10px] text-muted-foreground">Murojaah</span></div>
          </div>
        </div>

        {/* Student Ranking */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-xs font-bold text-foreground mb-3">Top Murid (Total Ayah)</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={studentProgress} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={60} />
              <Bar dataKey="ayah" fill="hsl(199,89%,48%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Exam Pie */}
        {examStats.length > 0 && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-bold text-foreground mb-3">Status Ujian</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={examStats} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {examStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 ml-4">
                {examStats.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-foreground">{s.name}: {s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-2xl font-bold text-foreground">{dailyLogs.length}</p>
            <p className="text-xs text-muted-foreground">Total Catatan</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-2xl font-bold text-foreground">{dailyLogs.reduce((s, l) => s + l.total_ayah, 0)}</p>
            <p className="text-xs text-muted-foreground">Total Ayah</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Analytics;
