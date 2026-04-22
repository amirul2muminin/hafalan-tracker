import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { ExamType } from '@/types';

const examTypes: { value: ExamType; label: string }[] = [
  { value: 'quarter_juz', label: '¼ Juz' },
  { value: 'half_juz', label: '½ Juz' },
  { value: 'one_juz', label: '1 Juz' },
  { value: 'five_juz', label: '5 Juz' },
];

const AddExam = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { students, addExam } = useAppStore();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    student_id: params.get('student') || '',
    exam_type: 'quarter_juz' as ExamType,
    juz_start: 30,
    juz_end: 30,
    exam_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) { toast({ title: 'Pilih murid', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      await addExam({
        student_id: form.student_id,
        exam_type: form.exam_type,
        status: 'pending',
        exam_date: form.exam_date,
        juz_start: form.juz_start,
        juz_end: form.juz_end,
      });
      toast({ title: 'Ujian berhasil ditambahkan ✅' });
      navigate(-1);
    } catch {
      toast({ title: 'Gagal menyimpan', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Tambah Ujian" back />
      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Murid</label>
          <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Pilih murid</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Tipe Ujian</label>
          <div className="grid grid-cols-2 gap-2">
            {examTypes.map((t) => (
              <button key={t.value} type="button" onClick={() => setForm({ ...form, exam_type: t.value })}
                className={`py-3 rounded-xl text-sm font-semibold transition-colors ${form.exam_type === t.value ? 'bg-ujian text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Juz Mulai</label>
            <input type="number" min={1} max={30} value={form.juz_start} onChange={(e) => setForm({ ...form, juz_start: +e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Juz Akhir</label>
            <input type="number" min={1} max={30} value={form.juz_end} onChange={(e) => setForm({ ...form, juz_end: +e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Tanggal Ujian</label>
          <input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <Button type="submit" className="w-full py-3 text-sm font-semibold" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Ujian'}
        </Button>
      </form>
    </div>
  );
};

export default AddExam;
