import { useParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';
import { BookOpen, RefreshCw, ClipboardCheck, Target, Plus, CheckCircle2, XCircle, Clock, BarChart3, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const tabs = [
  { key: 'hafalan', label: 'Hafalan', icon: BookOpen },
  { key: 'murojaah', label: 'Murojaah', icon: RefreshCw },
  { key: 'ujian', label: 'Ujian', icon: ClipboardCheck },
  { key: 'target', label: 'Target', icon: Target },
] as const;

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { students, getStudentLogs, getStudentExams, getStudentTargets, getStudentProgress, murojaahCycles, updateExamStatus, fetchStudentData } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>('hafalan');

  useEffect(() => {
    if (studentId) fetchStudentData(studentId);
  }, [studentId, fetchStudentData]);

  const student = students.find((s) => s.id === studentId);
  if (!student) return <div className="p-4">Murid tidak ditemukan</div>;

  const logs = getStudentLogs(student.id);
  const exams = getStudentExams(student.id);
  const targets = getStudentTargets(student.id);
  const progress = getStudentProgress(student.id);
  const cycle = murojaahCycles[student.id];

  const hafalanLogs = logs.filter((l) => l.category === 'hafalan_baru');
  const murojaahLogs = logs.filter((l) => l.category === 'murojaah');

  const mainTarget = targets[0];
  const pct = mainTarget ? Math.min(100, Math.round(((mainTarget.current_value || progress.total_juz) / mainTarget.target_value) * 100)) : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title={student.name} subtitle={`${progress.total_lines} baris · ${progress.total_pages} hal · ${progress.total_juz} juz`} back
        action={
          <button onClick={() => navigate(`/students/${student.id}/analytics`)}
            className="p-2 rounded-lg hover:bg-muted transition-colors">
            <BarChart3 className="w-5 h-5 text-primary" />
          </button>
        }
      />

      <div className="px-4 pt-3 pb-2">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Progress Target</span>
            <span className="text-sm font-bold text-primary">{pct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">{progress.total_juz} juz</span>
            <span className="text-[10px] text-muted-foreground">Target: {mainTarget?.target_value || '-'} {mainTarget?.target_type || 'juz'}</span>
          </div>
        </div>
      </div>

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
              <div key={log.id} className="bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold category-hafalan px-2 py-0.5 rounded-full">{log.type}</span>
                  <span className="text-[10px] text-muted-foreground">{format(new Date(log.date), 'd MMM', { locale: idLocale })}</span>
                </div>
                <p className="text-sm font-semibold text-foreground mt-1">Juz {log.juz_id} · Hal {log.from_page}:{log.from_line}–{log.to_page}:{log.to_line}</p>
                <p className="text-xs text-muted-foreground">{log.total_lines} baris · {log.pages} halaman</p>
                {log.note && <p className="text-xs text-muted-foreground mt-1 italic">"{log.note}"</p>}
              </div>
            ))}
          </>
        )}

        {activeTab === 'murojaah' && (
          <>
            <div className="bg-murojaah-light rounded-xl p-4 mb-2">
              <p className="text-xs font-semibold text-murojaah-foreground">Siklus Murojaah</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">{cycle?.current_pages || 3}</span>
                <span className="text-xs text-muted-foreground">halaman / hari {cycle?.current_day || 0}</span>
              </div>
            </div>
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
                  <span className="text-xs font-semibold category-murojaah px-2 py-0.5 rounded-full">{log.pages} hal</span>
                  <span className="text-[10px] text-muted-foreground">{format(new Date(log.date), 'd MMM', { locale: idLocale })}</span>
                </div>
                <p className="text-sm font-semibold text-foreground mt-1">Juz {log.juz_id} · Hal {log.from_page}:{log.from_line}–{log.to_page}:{log.to_line}</p>
                {log.note && <p className="text-xs text-muted-foreground mt-1 italic">"{log.note}"</p>}
              </div>
            ))}
          </>
        )}

        {activeTab === 'ujian' && (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">{exams.length} ujian</span>
              <Button size="sm" onClick={() => navigate(`/add/exam?student=${student.id}`)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Ujian
              </Button>
            </div>
            {exams.length === 0 && <EmptyState icon={<ClipboardCheck className="w-5 h-5 text-muted-foreground" />} title="Belum ada ujian" />}
            {exams.map((exam) => (
              <div key={exam.id} className="bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold category-ujian px-2 py-0.5 rounded-full">
                    {exam.exam_type.replace('_', ' ')}
                  </span>
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1',
                    exam.status === 'passed' && 'bg-success/10 text-success',
                    exam.status === 'failed' && 'bg-destructive/10 text-destructive',
                    exam.status === 'pending' && 'bg-warning/10 text-warning',
                  )}>
                    {exam.status === 'passed' && <CheckCircle2 className="w-3 h-3" />}
                    {exam.status === 'failed' && <XCircle className="w-3 h-3" />}
                    {exam.status === 'pending' && <Clock className="w-3 h-3" />}
                    {exam.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mt-1">Juz {exam.juz_start}{exam.juz_end && exam.juz_end !== exam.juz_start ? `–${exam.juz_end}` : ''}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(exam.exam_date), 'd MMM yyyy', { locale: idLocale })}</p>
                {exam.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateExamStatus(exam.id, 'passed')} className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-success/10 text-success">Lulus</button>
                    <button onClick={() => updateExamStatus(exam.id, 'failed')} className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-destructive/10 text-destructive">Tidak Lulus</button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {activeTab === 'target' && (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">{targets.length} target</span>
              <Button size="sm" onClick={() => navigate(`/add/target?student=${student.id}`)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Target
              </Button>
            </div>
            {targets.length === 0 && <EmptyState icon={<Target className="w-5 h-5 text-muted-foreground" />} title="Belum ada target" />}
            {targets.map((target) => {
              const current = target.current_value || (
                target.target_type === 'juz' ? progress.total_juz :
                target.target_type === 'page' ? progress.total_pages :
                progress.total_lines
              );
              const tPct = Math.min(100, Math.round((current / target.target_value) * 100));
              const isLate = new Date(target.deadline) < new Date() && tPct < 100;
              const isDone = tPct >= 100;
              return (
                <div key={target.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">{target.target_value} {target.target_type === 'page' ? 'halaman' : target.target_type === 'line' ? 'baris' : target.target_type}</span>
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                      isDone && 'bg-success/10 text-success',
                      isLate && 'bg-destructive/10 text-destructive',
                      !isDone && !isLate && 'bg-primary/10 text-primary',
                    )}>
                      {isDone ? 'Selesai' : isLate ? 'Terlambat' : 'On Track'}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                    <div className={cn('h-full rounded-full', isDone ? 'bg-success' : isLate ? 'bg-destructive' : 'bg-primary')} style={{ width: `${tPct}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">{current}/{target.target_value} · {tPct}%</span>
                    <span className="text-[10px] text-muted-foreground">Deadline: {format(new Date(target.deadline), 'd MMM yyyy', { locale: idLocale })}</span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default StudentDetail;
