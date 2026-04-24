import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useNavigate } from 'react-router-dom';
import { BookOpen, RefreshCw, ClipboardCheck, Users, Clock, TrendingUp } from 'lucide-react';
import StatCard from '@/components/StatCard';
import BottomNav from '@/components/BottomNav';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const { students, hafalanBaruLogs, murojaahLogs, ujianLogs, fetchAll, loading } = useAppStore();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const today = new Date().toISOString().split('T')[0];
  const todayHafalan = hafalanBaruLogs.filter((l) => l.created_at.startsWith(today));
  const todayMurojaah = murojaahLogs.filter((l) => l.created_at.startsWith(today));
  
  const hafalanToday = todayHafalan.length;
  const murojaahToday = todayMurojaah.length;
  // Note: pending exams are now tracked as part of persiapan_ujian_logs, or we can just count today's ujian
  const examsToday = ujianLogs.filter((e) => e.created_at.startsWith(today)).length;
  const totalLinesToday = todayHafalan.reduce((s, l) => s + l.total_lines, 0);

  const quickActions = [
    { label: 'Hafalan', icon: BookOpen, path: '/add/hafalan?type=setoran', variant: 'hafalan' as const },
    { label: 'Murojaah', icon: RefreshCw, path: '/add/murojaah', variant: 'murojaah' as const },
    { label: 'Ujian', icon: ClipboardCheck, path: '/add/hafalan?type=ujian', variant: 'ujian' as const },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-primary-foreground/70 text-sm">Assalamu'alaikum</p>
            <h1 className="text-xl font-bold text-primary-foreground">Ustadz/ah</h1>
          </div>
          <div className="text-right">
            <p className="text-primary-foreground/70 text-xs">{format(new Date(), 'EEEE', { locale: id })}</p>
            <p className="text-primary-foreground text-sm font-semibold">{format(new Date(), 'd MMM yyyy', { locale: id })}</p>
          </div>
        </div>

        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 mt-4">
          <p className="text-primary-foreground/70 text-xs mb-2">Ringkasan Hari Ini</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-foreground">{hafalanToday}</p>
              <p className="text-[10px] text-primary-foreground/70">Hafalan</p>
            </div>
            <div className="text-center border-x border-primary-foreground/20">
              <p className="text-2xl font-bold text-primary-foreground">{murojaahToday}</p>
              <p className="text-[10px] text-primary-foreground/70">Murojaah</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-foreground">{totalLinesToday}</p>
              <p className="text-[10px] text-primary-foreground/70">Baris</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className={`rounded-xl p-3 flex flex-col items-center gap-2 transition-transform active:scale-95 ${
                a.variant === 'hafalan' ? 'bg-card border border-hafalan/20' :
                a.variant === 'murojaah' ? 'bg-card border border-murojaah/20' :
                'bg-card border border-ujian/20'
              }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                a.variant === 'hafalan' ? 'bg-hafalan text-primary-foreground' :
                a.variant === 'murojaah' ? 'bg-murojaah text-primary-foreground' :
                'bg-ujian text-primary-foreground'
              }`}>
                <a.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">{a.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Murid" value={loading ? '...' : students.length} icon={<Users className="w-5 h-5" />} />
          <StatCard label="Ujian Hari Ini" value={examsToday} icon={<ClipboardCheck className="w-5 h-5" />} variant="ujian" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Aktivitas Terbaru</h2>
            <button onClick={() => navigate('/students')} className="text-xs text-primary font-medium">Lihat Semua</button>
          </div>
          <div className="space-y-2">
            {[...todayHafalan, ...todayMurojaah].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map((log) => {
              const student = students.find((s) => s.id === log.student_id);
              const isHafalan = 'total_lines' in log;
              return (
                <div key={log.id} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full ${isHafalan ? 'bg-hafalan' : 'bg-murojaah'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{student?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Juz {log.juz_id} {isHafalan ? `· Hal ${log.from_page}:${log.from_line}–${log.to_page}:${log.to_line} · ${log.total_lines} baris` : `· ${(log as any).total_pages} halaman`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                    isHafalan ? 'category-hafalan' : 'category-murojaah'
                  }`}>
                    {isHafalan ? 'Hafalan' : 'Murojaah'}
                  </span>
                </div>
              );
            })}
            {todayHafalan.length === 0 && todayMurojaah.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Belum ada aktivitas hari ini</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Dashboard;
