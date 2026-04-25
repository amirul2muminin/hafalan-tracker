import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useNavigate } from 'react-router-dom';
import { BookOpen, RefreshCw, Users, ChevronRight } from 'lucide-react';
import StatCard from '@/components/StatCard';
import BottomNav from '@/components/BottomNav';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useHomePage } from '@/hooks/useHomePage';

const Dashboard = () => {
  const navigate = useNavigate();
  const { fetchAll, loading } = useAppStore();
  const { belumHafalan, belumMurojaah, topHafalan, topMurojaah, stagnant, stagnantMurojaah, todayHafalanCount, todayMurojaahCount } = useHomePage();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const quickActions = [
    { label: 'Hafalan', icon: BookOpen, path: '/add/hafalan?type=setoran', variant: 'hafalan' as const },
    { label: 'Murojaah', icon: RefreshCw, path: '/add/murojaah', variant: 'murojaah' as const },
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
          <p className="text-primary-foreground/70 text-xs mb-3">Ringkasan Hari Ini</p>

          <div className="flex gap-4">
            {/* Hafalan Column */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[10px] text-primary-foreground/70">Hafalan</span>
              </div>

              {topHafalan.length > 0 && (
                <div>
                  <p className="text-[10px] text-primary-foreground/50 mb-1.5">Terbanyak</p>
                  <div className="space-y-1.5">
                    {topHafalan.map(({ student, progress }) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <span className="text-xs text-primary-foreground">{student.name}</span>
                        <span className="text-xs font-semibold text-green-300">{progress} baris</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stagnant.length > 0 && (
                <div>
                  <p className="text-[10px] text-primary-foreground/50 mb-1.5">Stagnan</p>
                  <div className="space-y-1.5">
                    {stagnant.map(({ student }) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <span className="text-xs text-primary-foreground">{student.name}</span>
                        <span className="text-xs font-medium text-yellow-200">Tidak ada kemajuan</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topHafalan.length === 0 && stagnant.length === 0 && (
                <p className="text-xs text-primary-foreground/50 text-center py-2">Belum ada data</p>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="w-px bg-primary-foreground/20" />

            {/* Murojaah Column */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-[10px] text-primary-foreground/70">Murojaah</span>
              </div>

              {topMurojaah.length > 0 && (
                <div>
                  <p className="text-[10px] text-primary-foreground/50 mb-1.5">Terbanyak</p>
                  <div className="space-y-1.5">
                    {topMurojaah.map(({ student, progress }) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <span className="text-xs text-primary-foreground">{student.name}</span>
                        <span className="text-xs font-semibold text-cyan-300">{progress} hal</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stagnantMurojaah.length > 0 && (
                <div>
                  <p className="text-[10px] text-primary-foreground/50 mb-1.5">Stagnan</p>
                  <div className="space-y-1.5">
                    {stagnantMurojaah.map(({ student }) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <span className="text-xs text-primary-foreground">{student.name}</span>
                        <span className="text-xs font-medium text-yellow-200">Tidak ada kemajuan</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topMurojaah.length === 0 && stagnantMurojaah.length === 0 && (
                <p className="text-xs text-primary-foreground/50 text-center py-2">Belum ada data</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((a) => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className={`rounded-xl p-3 flex flex-col items-center gap-2 transition-transform active:scale-95 ${a.variant === 'hafalan' ? 'bg-card border border-hafalan/20' :
                'bg-card border border-murojaah/20'
                }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.variant === 'hafalan' ? 'bg-hafalan text-primary-foreground' :
                'bg-murojaah text-primary-foreground'
                }`}>
                <a.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">{a.label}</span>
            </button>
          ))}
        </div>


        <div className="space-y-3">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-hafalan" />
                <span className="text-sm font-semibold text-foreground">Belum Hafalan</span>
                <span className="text-xs text-muted-foreground">({belumHafalan.length})</span>
              </div>
              <button
                onClick={() => navigate('/students?filter=belum-hafalan')}
                className="flex items-center gap-1 text-xs text-primary font-medium"
              >
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-4 py-2">
              {belumHafalan.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Semua murid sudah hafalan hari ini</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 py-1.5">
                  {belumHafalan.slice(0, 5).map((s) => (
                    <span key={s.id} className="text-xs bg-hafalan/10 text-hafalan px-2 py-1 rounded-full">
                      {s.name}
                    </span>
                  ))}
                  {belumHafalan.length > 5 && (
                    <span className="text-xs text-muted-foreground">+{belumHafalan.length - 5} lagi</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-murojaah" />
                <span className="text-sm font-semibold text-foreground">Belum Murojaah</span>
                <span className="text-xs text-muted-foreground">({belumMurojaah.length})</span>
              </div>
              <button
                onClick={() => navigate('/students?filter=belum-murojaah')}
                className="flex items-center gap-1 text-xs text-primary font-medium"
              >
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-4 py-2">
              {belumMurojaah.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Semua murid sudah murojaah hari ini</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 py-1.5">
                  {belumMurojaah.slice(0, 5).map((s) => (
                    <span key={s.id} className="text-xs bg-murojaah/10 text-murojaah px-2 py-1 rounded-full">
                      {s.name}
                    </span>
                  ))}
                  {belumMurojaah.length > 5 && (
                    <span className="text-xs text-muted-foreground">+{belumMurojaah.length - 5} lagi</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Dashboard;