import { useAppStore } from '@/stores/useAppStore';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';

const StudentList = () => {
  const navigate = useNavigate();
  const { students, getStudentProgress, getStudentTargets } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Daftar Murid" subtitle={`${students.length} murid`}
        action={<Button size="sm" onClick={() => {
          const name = prompt('Nama murid baru:');
          if (name) useAppStore.getState().addStudent({ id: Date.now().toString(), name });
        }}>+ Murid</Button>}
      />

      <div className="px-4 pt-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari murid..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((student) => {
            const progress = getStudentProgress(student.id);
            const targets = getStudentTargets(student.id);
            const mainTarget = targets[0];
            const pct = mainTarget ? Math.min(100, Math.round(((mainTarget.current_value || progress.total_juz) / mainTarget.target_value) * 100)) : 0;

            return (
              <button
                key={student.id}
                onClick={() => navigate(`/students/${student.id}`)}
                className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-3 transition-colors active:bg-muted text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{student.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{progress.total_ayah} ayah · {progress.total_juz} juz</p>
                  {mainTarget && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">{pct}%</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default StudentList;
