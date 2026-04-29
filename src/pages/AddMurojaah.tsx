import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const AddMurojaah = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { students, addMurojaahLog, getLastMurojaahLog, fetchStudentData } = useAppStore();
  const preselected = params.get('student') || '';
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    student_id: preselected,
    juz_id: 30,
    total_pages: 3,
    note: '',
  });

  // Fetch student data when student_id changes to ensure we have latest logs
  useEffect(() => {
    if (form.student_id) {
      fetchStudentData(form.student_id);
    }
  }, [form.student_id, fetchStudentData]);

  // Apply last murojaah log values when student_id changes
  useEffect(() => {
    if (!form.student_id) return;

    const lastLog = getLastMurojaahLog(form.student_id);
    if (lastLog) {
      setForm(prev => ({
        ...prev,
        juz_id: lastLog.juz_id,
        total_pages: lastLog.total_pages,
        note: '',
      }));
    }
  }, [form.student_id, getLastMurojaahLog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) { toast({ title: 'Pilih murid', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      await addMurojaahLog({
        student_id: form.student_id,
        juz_id: form.juz_id,
        total_pages: form.total_pages,
        note: form.note,
      });
      toast({ title: `Murojaah ${form.total_pages} halaman berhasil ✅` });
      navigate(-1);
    } catch {
      toast({ title: 'Gagal menyimpan', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Tambah Murojaah" back />
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
          <label className="text-xs font-semibold text-foreground mb-1 block">Jumlah Halaman</label>
          <select value={form.total_pages} onChange={(e) => setForm({ ...form, total_pages: +e.target.value })}
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num} Halaman</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Juz</label>
          <select value={form.juz_id} onChange={(e) => setForm({ ...form, juz_id: +e.target.value })}
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Catatan</label>
          <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} placeholder="Catatan opsional..."
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        <Button type="submit" className="w-full py-3 text-sm font-semibold" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Murojaah'}
        </Button>
      </form>
    </div>
  );
};

export default AddMurojaah;