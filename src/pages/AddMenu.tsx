import { useNavigate } from 'react-router-dom';
import { BookOpen, RefreshCw, ClipboardCheck, Target } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const actions = [
  { label: 'Hafalan Baru', desc: 'Catat setoran hafalan baru', icon: BookOpen, path: '/add/hafalan', color: 'bg-hafalan text-primary-foreground' },
  { label: 'Murojaah', desc: 'Catat muraja\'ah harian', icon: RefreshCw, path: '/add/murojaah', color: 'bg-murojaah text-primary-foreground' },
  { label: 'Ujian', desc: 'Jadwalkan atau catat ujian', icon: ClipboardCheck, path: '/add/exam', color: 'bg-ujian text-primary-foreground' },
  { label: 'Target', desc: 'Tetapkan target hafalan murid', icon: Target, path: '/add/target', color: 'bg-primary text-primary-foreground' },
];

const AddMenu = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Tambah" subtitle="Pilih jenis catatan" />
      <div className="px-4 pt-4 space-y-3">
        {actions.map((a) => (
          <button key={a.path} onClick={() => navigate(a.path)}
            className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4 transition-colors active:bg-muted text-left">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.color}`}>
              <a.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{a.label}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default AddMenu;
