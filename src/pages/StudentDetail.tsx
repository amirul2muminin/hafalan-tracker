import { useParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';
import { BookOpen, RefreshCw, Plus, BarChart3, ChevronRight, IdCardLanyard, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HafalanBaruLog, PersiapanUjianLog, UjianLog, MurojaahLog, ExamType, ExamResult } from '@/types';

const tabs = [
  { key: 'hafalan', label: 'Hafalan', icon: BookOpen },
  { key: 'murojaah', label: 'Murojaah', icon: RefreshCw },
] as const;

const examTypes: { value: ExamType; label: string }[] = [
  { value: 'quarter_juz', label: '¼ Juz' },
  { value: 'half_juz', label: '½ Juz' },
  { value: 'one_juz', label: '1 Juz' },
  { value: 'five_juz', label: '5 Juz' },
];

const examResults: { value: ExamResult; label: string }[] = [
  { value: 'mumtaz', label: 'Mumtaz' },
  { value: 'jayyid_jiddan_plus', label: 'Jayyid Jiddan +' },
  { value: 'jayyid_jiddan', label: 'Jayyid Jiddan' },
  { value: 'jayyid_plus', label: 'Jayyid +' },
  { value: 'jayyid', label: 'Jayyid' },
  { value: 'maqbul', label: 'Maqbul' },
  { value: 'rosib', label: 'Rosib' },
];

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const {
    students,
    getStudentHafalanLogs,
    getStudentPersiapanLogs,
    getStudentUjianLogs,
    getStudentMurojaahLogs,
    getStudentProgress,
    fetchStudentData,
    updateHafalanBaruLog,
    removeHafalanBaruLog,
    updatePersiapanUjianLog,
    removePersiapanUjianLog,
    updateUjianLog,
    removeUjianLog,
    updateMurojaahLog,
    removeMurojaahLog,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>('hafalan');

  // Edit dialogs state
  const [editSetoranOpen, setEditSetoranOpen] = useState(false);
  const [editPersiapanOpen, setEditPersiapanOpen] = useState(false);
  const [editUjianOpen, setEditUjianOpen] = useState(false);
  const [editMurojaahOpen, setEditMurojaahOpen] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLog, setDeletingLog] = useState<{ id: string; type: string } | null>(null);

  // Edit form states
  const [setoranForm, setSetoranForm] = useState<Partial<HafalanBaruLog>>({});
  const [persiapanForm, setPersiapanForm] = useState<Partial<PersiapanUjianLog>>({});
  const [ujianForm, setUjianForm] = useState<Partial<UjianLog>>({});
  const [murojaahForm, setMurojaahForm] = useState<Partial<MurojaahLog>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentId) fetchStudentData(studentId);
  }, [studentId, fetchStudentData]);

  const student = students.find((s) => s.id === studentId);
  if (!student) return <div className="p-4">Murid tidak ditemukan</div>;

  const hafalanLogs = getStudentHafalanLogs(student.id);
  const persiapanLogs = getStudentPersiapanLogs(student.id);
  const examLogs = getStudentUjianLogs(student.id);
  const murojaahLogs = getStudentMurojaahLogs(student.id);
  const progress = getStudentProgress(student.id);

  // Combine setoran, persiapan ujian, and ujian into one chronological list
  type CombinedLog = {
    id: string;
    type: 'setoran' | 'persiapan_ujian' | 'ujian';
    juz_id: number;
    created_at: string;
    note?: string;
    exam_type?: string;
    juz_part?: number;
    result?: string;
    total_lines?: number;
    from_page?: number;
    from_line?: number;
    to_page?: number;
    to_line?: number;
    pages?: number;
  };

  const combinedHafalanLogs: CombinedLog[] = [
    ...hafalanLogs.map(l => ({ ...l, type: 'setoran' as const })),
    ...persiapanLogs.map(l => ({ ...l, type: 'persiapan_ujian' as const })),
    ...examLogs.map(l => ({ ...l, type: 'ujian' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Edit handlers
  const openEditSetoran = (log: HafalanBaruLog) => {
    setSetoranForm({ ...log });
    setEditSetoranOpen(true);
  };

  const openEditPersiapan = (log: PersiapanUjianLog) => {
    setPersiapanForm({ ...log });
    setEditPersiapanOpen(true);
  };

  const openEditUjian = (log: UjianLog) => {
    setUjianForm({ ...log });
    setEditUjianOpen(true);
  };

  const openEditMurojaah = (log: MurojaahLog) => {
    setMurojaahForm({ ...log });
    setEditMurojaahOpen(true);
  };

  const openDeleteDialog = (id: string, type: string) => {
    setDeletingLog({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleSaveSetoran = async () => {
    setLoading(true);
    try {
      await updateHafalanBaruLog(setoranForm.id!, {
        juz_id: setoranForm.juz_id,
        from_page: setoranForm.from_page,
        from_line: setoranForm.from_line,
        to_page: setoranForm.to_page,
        to_line: setoranForm.to_line,
        note: setoranForm.note,
      });
      setEditSetoranOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersiapan = async () => {
    setLoading(true);
    try {
      await updatePersiapanUjianLog(persiapanForm.id!, {
        juz_id: persiapanForm.juz_id,
        exam_type: persiapanForm.exam_type,
        juz_part: persiapanForm.juz_part,
        note: persiapanForm.note,
      });
      setEditPersiapanOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUjian = async () => {
    setLoading(true);
    try {
      await updateUjianLog(ujianForm.id!, {
        juz_id: ujianForm.juz_id,
        exam_type: ujianForm.exam_type,
        juz_part: ujianForm.juz_part,
        result: ujianForm.result,
        note: ujianForm.note,
      });
      setEditUjianOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMurojaah = async () => {
    setLoading(true);
    try {
      await updateMurojaahLog(murojaahForm.id!, {
        juz_id: murojaahForm.juz_id,
        total_pages: murojaahForm.total_pages,
        note: murojaahForm.note,
      });
      setEditMurojaahOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLog) return;
    setLoading(true);
    try {
      if (deletingLog.type === 'setoran') {
        await removeHafalanBaruLog(deletingLog.id);
      } else if (deletingLog.type === 'persiapan_ujian') {
        await removePersiapanUjianLog(deletingLog.id);
      } else if (deletingLog.type === 'ujian') {
        await removeUjianLog(deletingLog.id);
      } else if (deletingLog.type === 'murojaah') {
        await removeMurojaahLog(deletingLog.id);
      }
      setDeleteDialogOpen(false);
      setDeletingLog(null);
    } finally {
      setLoading(false);
    }
  };

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
              <span className="text-xs text-muted-foreground">{combinedHafalanLogs.length} catatan</span>
              <Button size="sm" onClick={() => navigate(`/add/hafalan?student=${student.id}`)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Hafalan
              </Button>
            </div>
            {combinedHafalanLogs.length === 0 && <EmptyState icon={<BookOpen className="w-5 h-5 text-muted-foreground" />} title="Belum ada hafalan" />}
            {combinedHafalanLogs.map((log) => (
              <div
                key={log.id}
                className="bg-card rounded-2xl p-4 border border-border space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[10px] font-medium px-2 py-1 rounded-full",
                    log.type === 'setoran' && "bg-hafalan/10 text-hafalan",
                    log.type === 'persiapan_ujian' && "bg-warning/10 text-warning",
                    log.type === 'ujian' && "bg-ujian/10 text-ujian"
                  )}>
                    {log.type === 'setoran' && 'Setoran'}
                    {log.type === 'persiapan_ujian' && 'Persiapan Ujian'}
                    {log.type === 'ujian' && 'Ujian'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(log.created_at), "d MMM", { locale: idLocale })}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-muted transition-colors">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {log.type === 'setoran' && (
                          <DropdownMenuItem onClick={() => openEditSetoran(hafalanLogs.find(l => l.id === log.id)!)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                        )}
                        {log.type === 'persiapan_ujian' && (
                          <DropdownMenuItem onClick={() => openEditPersiapan(persiapanLogs.find(l => l.id === log.id)!)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                        )}
                        {log.type === 'ujian' && (
                          <DropdownMenuItem onClick={() => openEditUjian(examLogs.find(l => l.id === log.id)!)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openDeleteDialog(log.id, log.type)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Juz {log.juz_id}
                    {log.juz_part && ` · Part ${log.juz_part}`}
                  </p>
                </div>

                {log.type === 'setoran' && (
                  <>
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
                  </>
                )}

                {log.type === 'persiapan_ujian' && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tipe</span>
                    <span className="capitalize">{log.exam_type?.replace(/_/g, ' ')}</span>
                  </div>
                )}

                {log.type === 'ujian' && (
                  <>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Tipe</span>
                      <span className="capitalize">{log.exam_type?.replace(/_/g, ' ')}</span>
                    </div>
                    {log.result && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Hasil</span>
                        <span className={cn(
                          "font-medium capitalize",
                          (log.result === 'mumtaz' || log.result === 'jayyid_jiddan' || log.result === 'jayyid_jiddan_plus') && "text-success",
                          log.result === 'rosib' && "text-destructive",
                          (log.result === 'jayyid' || log.result === 'jayyid_plus' || log.result === 'maqbul') && "text-warning"
                        )}>
                          {log.result.replace(/_/g, ' ').replace('plus', '+')}
                        </span>
                      </div>
                    )}
                  </>
                )}

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
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{format(new Date(log.created_at), 'd MMM', { locale: idLocale })}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-muted transition-colors">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditMurojaah(log)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(log.id, 'murojaah')} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground mt-1">Juz {log.juz_id}</p>
                {log.note && <p className="text-xs text-muted-foreground mt-1 italic">"{log.note}"</p>}
              </div>
            ))}
          </>
        )}
      </div>
      <BottomNav />

      {/* Edit Setoran Dialog */}
      <Dialog open={editSetoranOpen} onOpenChange={setEditSetoranOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Setoran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Juz</label>
              <Input
                type="number"
                min={1}
                max={30}
                value={setoranForm.juz_id || ''}
                onChange={(e) => setSetoranForm({ ...setoranForm, juz_id: +e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Dari Halaman</label>
                <Input
                  type="number"
                  value={setoranForm.from_page || ''}
                  onChange={(e) => setSetoranForm({ ...setoranForm, from_page: +e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Dari Baris</label>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={setoranForm.from_line || ''}
                  onChange={(e) => setSetoranForm({ ...setoranForm, from_line: +e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sampai Halaman</label>
                <Input
                  type="number"
                  value={setoranForm.to_page || ''}
                  onChange={(e) => setSetoranForm({ ...setoranForm, to_page: +e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sampai Baris</label>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={setoranForm.to_line || ''}
                  onChange={(e) => setSetoranForm({ ...setoranForm, to_line: +e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Catatan</label>
              <Textarea
                value={setoranForm.note || ''}
                onChange={(e) => setSetoranForm({ ...setoranForm, note: e.target.value })}
                rows={2}
                placeholder="Catatan opsional..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSetoranOpen(false)}>Batal</Button>
            <Button onClick={handleSaveSetoran} disabled={loading}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Persiapan Ujian Dialog */}
      <Dialog open={editPersiapanOpen} onOpenChange={setEditPersiapanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Persiapan Ujian</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Juz</label>
              <Input
                type="number"
                min={1}
                max={30}
                value={persiapanForm.juz_id || ''}
                onChange={(e) => setPersiapanForm({ ...persiapanForm, juz_id: +e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipe Ujian</label>
              <select
                value={persiapanForm.exam_type || ''}
                onChange={(e) => setPersiapanForm({ ...persiapanForm, exam_type: e.target.value as ExamType })}
                className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {examTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Juz Part (ke-)</label>
              <Input
                type="number"
                min={1}
                value={persiapanForm.juz_part || ''}
                onChange={(e) => setPersiapanForm({ ...persiapanForm, juz_part: +e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Catatan</label>
              <Textarea
                value={persiapanForm.note || ''}
                onChange={(e) => setPersiapanForm({ ...persiapanForm, note: e.target.value })}
                rows={2}
                placeholder="Catatan opsional..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPersiapanOpen(false)}>Batal</Button>
            <Button onClick={handleSavePersiapan} disabled={loading}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Ujian Dialog */}
      <Dialog open={editUjianOpen} onOpenChange={setEditUjianOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Ujian</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Juz</label>
              <Input
                type="number"
                min={1}
                max={30}
                value={ujianForm.juz_id || ''}
                onChange={(e) => setUjianForm({ ...ujianForm, juz_id: +e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipe Ujian</label>
              <select
                value={ujianForm.exam_type || ''}
                onChange={(e) => setUjianForm({ ...ujianForm, exam_type: e.target.value as ExamType })}
                className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {examTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Juz Part (ke-)</label>
              <Input
                type="number"
                min={1}
                value={ujianForm.juz_part || ''}
                onChange={(e) => setUjianForm({ ...ujianForm, juz_part: +e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Hasil</label>
              <select
                value={ujianForm.result || ''}
                onChange={(e) => setUjianForm({ ...ujianForm, result: e.target.value as ExamResult })}
                className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {examResults.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Catatan</label>
              <Textarea
                value={ujianForm.note || ''}
                onChange={(e) => setUjianForm({ ...ujianForm, note: e.target.value })}
                rows={2}
                placeholder="Catatan opsional..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUjianOpen(false)}>Batal</Button>
            <Button onClick={handleSaveUjian} disabled={loading}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Murojaah Dialog */}
      <Dialog open={editMurojaahOpen} onOpenChange={setEditMurojaahOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Murojaah</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Juz</label>
              <Input
                type="number"
                min={1}
                max={30}
                value={murojaahForm.juz_id || ''}
                onChange={(e) => setMurojaahForm({ ...murojaahForm, juz_id: +e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Jumlah Halaman</label>
              <Input
                type="number"
                min={1}
                max={30}
                value={murojaahForm.total_pages || ''}
                onChange={(e) => setMurojaahForm({ ...murojaahForm, total_pages: +e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Catatan</label>
              <Textarea
                value={murojaahForm.note || ''}
                onChange={(e) => setMurojaahForm({ ...murojaahForm, note: e.target.value })}
                rows={2}
                placeholder="Catatan opsional..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMurojaahOpen(false)}>Batal</Button>
            <Button onClick={handleSaveMurojaah} disabled={loading}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Catatan</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetail;
