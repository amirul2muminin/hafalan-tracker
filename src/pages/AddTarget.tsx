import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { TargetType } from '@/types';

const AddTarget = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { students, addTarget } = useAppStore();
  const [form, setForm] = useState({
    student_id: params.get('student') || '',
    target_type: 'juz' as TargetType,
    target_value: 5,
    deadline: '2026-12-31',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) { toast({ title: 'Pilih murid', variant: 'destructive' }); return; }
    addTarget({
      id: Date.now().toString(),
      student_id: form.student_id,
      target_type: form.target_type,
      target_value: form.target_value,
      deadline: form.deadline,
    });
    toast({ title: 'Target berhasil ditambahkan ✅' });
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Tambah Target" back />
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
          <label className="text-xs font-semibold text-foreground mb-1 block">Tipe Target</label>
          <div className="flex gap-2">
            {(['juz', 'ayah'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, target_type: t })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${form.target_type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {t === 'juz' ? 'Juz' : 'Ayah'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Nilai Target</label>
          <input type="number" min={1} value={form.target_value} onChange={(e) => setForm({ ...form, target_value: +e.target.value })}
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Deadline</label>
          <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <Button type="submit" className="w-full py-3 text-sm font-semibold">Simpan Target</Button>
      </form>
    </div>
  );
};

export default AddTarget;
