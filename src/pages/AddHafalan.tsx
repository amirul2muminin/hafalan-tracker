import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { calculateTotalLines, getJuzPageRange, isPageInJuz, LINES_PER_PAGE } from '@/lib/juz-mapping';
import type { Database } from '@/integrations/supabase/types';
import { Constants } from '@/integrations/supabase/types';

type ExamType = Database['public']['Enums']['exam_type'];
type ExamResult = Database['public']['Enums']['exam_result'];

const examTypes = Constants.public.Enums.exam_type.map(value => ({
  value,
  label: value === 'quarter_juz' ? '¼ Juz' : value === 'half_juz' ? '½ Juz' : value === 'one_juz' ? '1 Juz' : '5 Juz',
}));

const examResults = Constants.public.Enums.exam_result.map(value => ({
  value,
  label: value === 'mumtaz' ? 'Mumtaz' : value === 'jayyid_jiddan_plus' ? 'Jayyid Jiddan +' : value === 'jayyid_jiddan' ? 'Jayyid Jiddan' : value === 'jayyid_plus' ? 'Jayyid +' : value === 'jayyid' ? 'Jayyid' : value === 'maqbul' ? 'Maqbul' : 'Rosib',
}));

const AddHafalan = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { students, addHafalanBaruLog, addPersiapanUjianLog, addUjianLog } = useAppStore();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    student_id: params.get('student') || '',
    juz_id: 30,
    from_page: 582,
    from_line: 1,
    to_page: 582,
    to_line: 15,
    type: 'setoran' as 'setoran' | 'persiapan_ujian' | 'ujian',
    exam_type: 'quarter_juz' as ExamType,
    juz_part: 1,
    result: 'mumtaz' as ExamResult,
    note: '',
  });

  const juzRange = getJuzPageRange(form.juz_id);
  const totalLines = calculateTotalLines(form.from_page, form.from_line, form.to_page, form.to_line);
  const totalPages = Math.round((totalLines / LINES_PER_PAGE) * 10) / 10;

  const handleJuzChange = (juz: number) => {
    const range = getJuzPageRange(juz);
    if (range) {
      setForm({ ...form, juz_id: juz, from_page: range.start, to_page: range.start, from_line: 1, to_line: 15 });
    } else {
      setForm({ ...form, juz_id: juz });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) { toast({ title: 'Pilih murid', variant: 'destructive' }); return; }

    setSubmitting(true);
    try {
      if (form.type === 'setoran') {
        if (!isPageInJuz(form.from_page, form.juz_id) || !isPageInJuz(form.to_page, form.juz_id)) {
          toast({ title: 'Halaman di luar range juz', variant: 'destructive' }); return;
        }
        if (form.from_page > form.to_page) { toast({ title: 'Halaman awal > akhir', variant: 'destructive' }); return; }
        if (form.from_page === form.to_page && form.from_line > form.to_line) {
          toast({ title: 'Baris awal > akhir pada halaman yang sama', variant: 'destructive' }); return;
        }
        if (form.from_line > 15 || form.to_line > 15) {
          toast({ title: 'Baris maks 15', variant: 'destructive' }); return;
        }
        await addHafalanBaruLog({
          student_id: form.student_id,
          juz_id: form.juz_id,
          from_page: form.from_page,
          from_line: form.from_line,
          to_page: form.to_page,
          to_line: form.to_line,
          total_lines: totalLines,
          pages: totalPages,
          note: form.note,
        });
      } else if (form.type === 'persiapan_ujian') {
        await addPersiapanUjianLog({
          student_id: form.student_id,
          juz_id: form.juz_id,
          exam_type: form.exam_type,
          juz_part: form.juz_part,
          note: form.note,
        });
      } else if (form.type === 'ujian') {
        await addUjianLog({
          student_id: form.student_id,
          juz_id: form.juz_id,
          exam_type: form.exam_type,
          juz_part: form.juz_part,
          result: form.result,
          note: form.note,
        });
      }
      
      toast({ title: 'Data berhasil ditambahkan ✅' });
      navigate(-1);
    } catch {
      toast({ title: 'Gagal menyimpan', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <PageHeader title="Tambah Hafalan" back />
      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-5">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Murid</label>
          <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Pilih murid</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Tipe Flow</label>
          <div className="flex gap-2">
            {(['setoran', 'persiapan_ujian', 'ujian'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${form.type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {t === 'setoran' ? 'Setoran' : t === 'persiapan_ujian' ? 'Persiapan' : 'Ujian'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Juz</label>
          <select value={form.juz_id} onChange={(e) => handleJuzChange(+e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
          {form.type === 'setoran' && juzRange && <p className="text-[10px] text-muted-foreground mt-1">Halaman {juzRange.start} – {juzRange.end}</p>}
        </div>

        {form.type === 'setoran' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Dari Halaman</label>
                <select value={form.from_page} onChange={(e) => setForm({ ...form, from_page: +e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {juzRange && Array.from({ length: juzRange.end - juzRange.start + 1 }, (_, i) => juzRange.start + i).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Dari Baris</label>
                <select value={form.from_line} onChange={(e) => setForm({ ...form, from_line: +e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Sampai Halaman</label>
                <select value={form.to_page} onChange={(e) => setForm({ ...form, to_page: +e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {juzRange && Array.from({ length: juzRange.end - juzRange.start + 1 }, (_, i) => juzRange.start + i).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Sampai Baris</label>
                <select value={form.to_line} onChange={(e) => setForm({ ...form, to_line: +e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-hafalan-light rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-hafalan-foreground">{totalLines}</span>
              <span className="text-xs text-hafalan-foreground ml-1">baris</span>
              <span className="text-xs text-muted-foreground ml-2">({totalPages} halaman)</span>
            </div>
          </>
        )}

        {(form.type === 'persiapan_ujian' || form.type === 'ujian') && (
          <>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Tipe Ujian</label>
              <select value={form.exam_type} onChange={(e) => setForm({ ...form, exam_type: e.target.value as ExamType })}
                className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {examTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Juz Part (ke-)</label>
              <select value={form.juz_part} onChange={(e) => setForm({ ...form, juz_part: +e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {Array.from({ length: 4 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {form.type === 'ujian' && (
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Hasil Ujian</label>
            <select value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value as ExamResult })}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
              {examResults.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Catatan</label>
          <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} placeholder="Catatan opsional..."
            className="w-full py-2.5 px-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        <Button type="submit" className="w-full py-3 text-sm font-semibold" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </div>
  );
};

export default AddHafalan;
