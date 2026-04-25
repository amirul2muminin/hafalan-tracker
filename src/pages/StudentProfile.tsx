import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { students, updateStudent, removeStudent } = useAppStore();

  const student = students.find(s => s.id === studentId);
  
  const [name, setName] = useState(student?.name || '');
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!student) {
    return <div className="p-4">Murid tidak ditemukan</div>;
  }

  const handleUpdate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await updateStudent(student.id, { name: name.trim() });
      toast.success('Profil murid berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui profil murid');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await removeStudent(student.id);
      toast.success('Murid berhasil dihapus');
      navigate('/students', { replace: true });
    } catch (error) {
      toast.error('Gagal menghapus murid');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Profil Murid" back />

      <div className="px-4 pt-6 space-y-6">
        <div className="space-y-4 bg-card p-4 rounded-xl border border-border">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Lengkap</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Masukkan nama murid"
              className="bg-background"
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleUpdate} 
            disabled={loading || name.trim() === student.name || !name.trim()}
          >
            Simpan Perubahan
          </Button>
        </div>

        <div className="space-y-4 bg-destructive/5 p-4 rounded-xl border border-destructive/20">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-destructive">Area Berbahaya</h3>
            <p className="text-xs text-muted-foreground">Tindakan ini akan menghapus data murid dari sistem.</p>
          </div>
          
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={() => setDeleteDialogOpen(true)}
          >
            Hapus Murid
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Murid</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{student.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 mt-4 justify-end">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={loading}>
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfile;
