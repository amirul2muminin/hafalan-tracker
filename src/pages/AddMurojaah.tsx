import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const AddMurojaah = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { students, addLog, updateMurojaahCycle, murojaahCycles } = useAppStore();
  const preselected = params.get('student') || '';
  const [form, setForm] = useState({
    student_id: preselected,
    juz_id: 30,
    from_ayah: 1,
    to_ayah: 20,
    note: '',
  });

  const cycle = form.student_id ? murojaahCycles[form.student_id] : null;
  const nextPages = cycle?.current_pages || 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) { toast({ title: 'Pilih murid', variant: 'destructive' }); return; }
    const updatedCycle = updateMurojaahCycle(form.student_id);
    addLog({
      id: Date.now().toString(),
      student_id: form.student_id,
      date: new Date().toISOString().split('T')[0],
      category: 'murojaah',
      type: 'setoran',
      juz_id: form.juz_id,
      from_ayah: form.from_ayah,
      to_ayah: form.to_ayah,
      total_ayah: Math.max(0, form.to_ayah - form.from_ayah + 1),
      pages: updatedCycle.current_pages,
      note: form.note,
    });
    toast({ title: `Murojaah ${updatedCycle.current_pages} halaman berhasil ✅` });
    navigate(-1);
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

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Juz</label>
            <input type="number" min={1} max={30} value={form.juz_id} onChange={(e) => setForm({ ...form, juz_id: +e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Dari Ayah</label>
            <input type="number" min={1} value={form.from_ayah} onChange={(e) => setForm({ ...form, from_ayah: +e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Sampai Ayah</label>
            <input type="number" min={1} value={form.to_ayah} onChange={(e) => setForm({ ...form, to_ayah: +e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Catatan</label>
          <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} placeholder="Catatan opsional..."
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        <Button type="submit" className="w-full py-3 text-sm font-semibold">Simpan Murojaah</Button>
      </form>
    </div>
  );
};

export default AddMurojaah;
