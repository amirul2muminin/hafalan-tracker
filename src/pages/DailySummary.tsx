import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { useHomePage } from '@/hooks/useHomePage';

const DailySummary = () => {
  const navigate = useNavigate();
  const { topHafalan, topMurojaah, stagnant, stagnantMurojaah, todayHafalanCount, todayMurojaahCount } = useHomePage();

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Ringkasan Harian"
        subtitle={`${todayHafalanCount} hafalan · ${todayMurojaahCount} murojaah`}
        back
      />

      <div className="px-4 pt-3 space-y-4">
        {/* Hafalan Section */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm font-semibold text-foreground">Hafalan</span>
          </div>

          <div className="px-4 py-3 space-y-3">
            {/* Top Hafalan */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Terbanyak</p>
              {topHafalan.length > 0 ? (
                <div className="space-y-2">
                  {topHafalan.map(({ student, progress }, i) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-green-400/20 text-green-400 text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm text-foreground">{student.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-green-400">{progress} baris</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Belum ada data hafalan</p>
              )}
            </div>

            {/* Stagnant Hafalan */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Stagnan</p>
              {stagnant.length > 0 ? (
                <div className="space-y-2">
                  {stagnant.map(({ student }) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{student.name}</span>
                      <span className="text-xs font-medium text-yellow-500">Tidak ada kemajuan</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Semua murid berkembang</p>
              )}
            </div>
          </div>
        </div>

        {/* Murojaah Section */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-sm font-semibold text-foreground">Murojaah</span>
          </div>

          <div className="px-4 py-3 space-y-3">
            {/* Top Murojaah */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Terbanyak</p>
              {topMurojaah.length > 0 ? (
                <div className="space-y-2">
                  {topMurojaah.map(({ student, progress }, i) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm text-foreground">{student.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-cyan-400">{progress} hal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Belum ada data murojaah</p>
              )}
            </div>

            {/* Stagnant Murojaah */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Stagnan</p>
              {stagnantMurojaah.length > 0 ? (
                <div className="space-y-2">
                  {stagnantMurojaah.map(({ student }) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{student.name}</span>
                      <span className="text-xs font-medium text-yellow-500">Tidak ada kemajuan</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Semua murid berkembang</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DailySummary;
