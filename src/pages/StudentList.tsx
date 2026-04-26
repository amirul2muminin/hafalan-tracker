import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStudentFilters } from '@/hooks/useStudentFilters';

const StudentList = () => {
  const navigate = useNavigate();
  const { getStudentProgress, fetchAll, addStudent } = useAppStore();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const { getFilteredStudents, activeFilter, filterLabel } = useStudentFilters();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = getFilteredStudents().filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddStudent = async () => {
    if (!newName.trim()) return;

    try {
      await addStudent(newName);
      setNewName('');
      setOpen(false);
    } catch {
      // error handling sudah di store
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Daftar Murid"
        subtitle={activeFilter ? `${filtered.length} ${filterLabel()}` : `${filtered.length} murid`}
        action={<Button size="sm" onClick={() => setOpen(true)}>
          + Murid
        </Button>}
      />

      <div className="px-4 pt-3 space-y-3">
        {activeFilter && (
          <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 border ${
            activeFilter === 'belum-hafalan'
              ? 'bg-hafalan/10 border-hafalan/20'
              : 'bg-murojaah/10 border-murojaah/20'
          }`}>
            <span className={`text-sm font-medium ${
              activeFilter === 'belum-hafalan' ? 'text-hafalan' : 'text-murojaah'
            }`}>
              Filter: {filterLabel()}
            </span>
            <button
              onClick={() => navigate('/students')}
              className={`p-1 rounded-lg hover:bg-opacity-20 transition-colors ${
                activeFilter === 'belum-hafalan' ? 'hover:bg-hafalan' : 'hover:bg-murojaah'
              }`}
            >
              <X className={`w-4 h-4 ${
                activeFilter === 'belum-hafalan' ? 'text-hafalan' : 'text-murojaah'
              }`} />
            </button>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Cari murid..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <div className="space-y-2">
          {filtered.map((student) => {
            const progress = getStudentProgress(student.id);

            return (
              <button key={student.id} onClick={() => navigate(`/students/${student.id}`)}
                className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-3 transition-colors active:bg-muted text-left">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{student.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{progress.total_lines} baris · {progress.total_pages} hal · {progress.total_juz} juz</p>

                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav />


      {/* modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Murid</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Nama murid"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button className='mb-2' onClick={handleAddStudent}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentList;
