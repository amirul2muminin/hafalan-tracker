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
  { key: 'ujian', label: 'Ujian', icon: ClipboardCheck },
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
              <div key={log.id} className="bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold category-hafalan px-2 py-0.5 rounded-full">Setoran</span>
                  <span className="text-[10px] text-muted-foreground">{format(new Date(log.created_at), 'd MMM', { locale: idLocale })}</span>
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

        {activeTab === 'ujian' && (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">{exams.length} ujian</span>
              <Button size="sm" onClick={() => navigate(`/add/hafalan?type=ujian&student=${student.id}`)}>
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
                    (exam.result === 'mumtaz' || exam.result === 'jayyid_jiddan' || exam.result === 'jayyid_jiddan_plus') && 'bg-success/10 text-success',
                    exam.result === 'rosib' && 'bg-destructive/10 text-destructive',
                    (exam.result === 'jayyid' || exam.result === 'jayyid_plus' || exam.result === 'maqbul') && 'bg-warning/10 text-warning',
                  )}>
                    {(exam.result === 'mumtaz' || exam.result === 'jayyid_jiddan' || exam.result === 'jayyid_jiddan_plus') && <CheckCircle2 className="w-3 h-3" />}
                    {exam.result === 'rosib' && <XCircle className="w-3 h-3" />}
                    {(exam.result === 'jayyid' || exam.result === 'jayyid_plus' || exam.result === 'maqbul') && <Clock className="w-3 h-3" />}
                    {exam.result.replace(/_/g, ' ').replace('plus', '+').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mt-1">Juz Part {exam.juz_part}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(exam.created_at), 'd MMM yyyy', { locale: idLocale })}</p>
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
