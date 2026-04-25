import { useParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';
import { BookOpen, RefreshCw, ClipboardCheck, Target, Plus, CheckCircle2, XCircle, Clock, BarChart3, ChevronRight, IdCard, IdCardLanyard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const tabs = [
  { key: 'hafalan', label: 'Hafalan', icon: BookOpen },
  { key: 'murojaah', label: 'Murojaah', icon: RefreshCw },
] as const;

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { students, getStudentHafalanLogs, getStudentUjianLogs, getStudentMurojaahLogs, getStudentProgress, fetchStudentData } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>('hafalan');

  useEffect(() => {
    if (studentId) fetchStudentData(studentId);
  }, [studentId, fetchStudentData]);

  const student = students.find((s) => s.id === studentId);
  if (!student) return <div className="p-4">Murid tidak ditemukan</div>;

  const hafalanLogs = getStudentHafalanLogs(student.id);
  const murojaahLogs = getStudentMurojaahLogs(student.id);
  const exams = getStudentUjianLogs(student.id);
  const progress = getStudentProgress(student.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title={student.name} subtitle={`${progress.total_lines} baris · ${progress.total_pages} hal · ${progress.total_juz} juz`} back
        action={
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(`/students/${student.id}/analytics`)}
              className="p-2 rounded-lg hover:bg-muted transition-colors">
              <BarChart3 className="w-5 h-5 text-primary" />
            </button>
            <button onClick={() => navigate(`/students/${student.id}/profile`)}
              className="p-2 rounded-lg hover:bg-muted transition-colors">
              <IdCardLanyard className="w-5 h-5 text-primary" />
            </button>
          </div>
        }
      />



      <div className="px-4 pt-2">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn('flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all',
                activeTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground')}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 space-y-2">
        {activeTab === 'hafalan' && (
          <>
            <button onClick={() => navigate(`/students/${student.id}/analytics`)}
              className="w-full bg-primary/5 rounded-xl p-3 border border-primary/20 flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <div className="text-left flex-1">
                <p className="text-xs font-semibold text-foreground">Lihat Analitik</p>
                <p className="text-[10px] text-muted-foreground">Statistik & tren hafalan</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">{hafalanLogs.length} catatan</span>
              <Button size="sm" onClick={() => navigate(`/add/hafalan?student=${student.id}`)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Hafalan
              </Button>
            </div>
            {hafalanLogs.length === 0 && <EmptyState icon={<BookOpen className="w-5 h-5 text-muted-foreground" />} title="Belum ada hafalan" />}
            {hafalanLogs.map((log) => (
              <div
                key={log.id}
                className="bg-card rounded-2xl p-4 border border-border space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    Setoran
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(log.created_at), "d MMM", { locale: idLocale })}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Juz {log.juz_id}
                  </p>
                </div>

                {/* Range (Start → End) */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Mulai
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      Hal {log.from_page}, baris {log.from_line}
                    </p>
                  </div>

                  <div className="text-muted-foreground text-sm">→</div>

                  <div className="flex-1 text-right">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Selesai
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      Hal {log.to_page}, baris {log.to_line}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Setoran</span>
                  <span>{log.total_lines} baris</span>
                </div>

                {/* Note */}
                {log.note && (
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <p className="text-xs italic text-muted-foreground leading-relaxed">
                      "{log.note}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {activeTab === 'murojaah' && (
          <>

            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">{murojaahLogs.length} catatan</span>
              <Button size="sm" onClick={() => navigate(`/add/murojaah?student=${student.id}`)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Murojaah
              </Button>
            </div>
            {murojaahLogs.length === 0 && <EmptyState icon={<RefreshCw className="w-5 h-5 text-muted-foreground" />} title="Belum ada murojaah" />}
            {murojaahLogs.map((log) => (
              <div key={log.id} className="bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold category-murojaah px-2 py-0.5 rounded-full">{log.total_pages} hal</span>
                  <span className="text-[10px] text-muted-foreground">{format(new Date(log.created_at), 'd MMM', { locale: idLocale })}</span>
                </div>
                <p className="text-sm font-semibold text-foreground mt-1">Juz {log.juz_id}</p>
                {log.note && <p className="text-xs text-muted-foreground mt-1 italic">"{log.note}"</p>}
              </div>
            ))}
          </>
        )}


      </div>
      <BottomNav />
    </div>
  );
};

export default StudentDetail;
