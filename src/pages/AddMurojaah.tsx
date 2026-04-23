import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { calculateTotalLines, getJuzPageRange, LINES_PER_PAGE } from '@/lib/juz-mapping';

const AddMurojaah = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { students, addLog, updateMurojaahCycle, murojaahCycles } = useAppStore();
  const preselected = params.get('student') || '';
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    student_id: preselected,
    juz_id: 30,
    from_page: 582,
    from_line: 1,
    to_page: 582,
    to_line: 15,
    note: '',
  });

  const cycle = form.student_id ? murojaahCycles[form.student_id] : null;
  const nextPages = cycle?.current_pages || 3;
  const juzRange = getJuzPageRange(form.juz_id);
  const totalLines = calculateTotalLines(form.from_page, form.from_line, form.to_page, form.to_line);

  const handleJuzChange = (juz: number) => {
    const range = getJuzPageRange(juz);
    if (range) {
      setForm({ ...form, juz_id: juz, from_page: range.start, to_page: range.start, from_line: 1, to_line: 15 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) { toast({ title: 'Pilih murid', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const updatedCycle = await updateMurojaahCycle(form.student_id);
      await addLog({
        student_id: form.student_id,
        category: 'murojaah',
        type: 'setoran',
        juz_id: form.juz_id,
        from_page: form.from_page,
        from_line: form.from_line,
        to_page: form.to_page,
        to_line: form.to_line,
        total_lines: totalLines,
        pages: Math.round((totalLines / LINES_PER_PAGE) * 10) / 10,
        note: form.note,
      });
      toast({ title: `Murojaah ${updatedCycle.current_pages} halaman berhasil ✅` });
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

        <div className="bg-murojaah-light rounded-xl p-4 text-center">
          <p className="text-xs font-semibold text-murojaah-foreground mb-1">Target Halaman Hari Ini</p>
          <span className="text-3xl font-bold text-foreground">{nextPages}</span>
          <p className="text-xs text-muted-foreground mt-1">Siklus: 3 → 6 → 9 → ... → 20 → reset</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Juz</label>
          <input type="number" min={1} max={30} value={form.juz_id} onChange={(e) => handleJuzChange(+e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          {juzRange && <p className="text-[10px] text-muted-foreground mt-1">Halaman {juzRange.start} – {juzRange.end}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Dari Halaman</label>
            <input type="number" value={form.from_page} onChange={(e) => setForm({ ...form, from_page: +e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Dari Baris</label>
            <input type="number" min={1} max={15} value={form.from_line} onChange={(e) => setForm({ ...form, from_line: +e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Sampai Halaman</label>
            <input type="number" value={form.to_page} onChange={(e) => setForm({ ...form, to_page: +e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Sampai Baris</label>
            <input type="number" min={1} max={15} value={form.to_line} onChange={(e) => setForm({ ...form, to_line: +e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
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
