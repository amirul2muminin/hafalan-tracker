-- flow pembelajaran murid: murid membaca dua kategori di kelas: hafalan baru dan murojaah.

-- flow hafalan baru: setiap hari murid setoran hafalan baru dan di track perbaris dan halaman, jika sudah mencapai 5 halaman(1/4 juz) murid melakukan persiapan ujian dan jika sudah siap murid melakukan ujian. semua flow tersebut termasuk hafalan baru. ada 4 tipe ujian: 1/4(ke-1,2,3,4), 1/2 (ke-1, ke-2), 1 dan 5 juz

-- flow murojaah: murid membaca halaman dengan jumlah kelipatan 3 incremental sampai 1 juz (20 halaman): hari pertama baca 3 halaman, ke-2 6 halaman dan seterusnya

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create enums
CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'examiner');
CREATE TYPE public.exam_type AS ENUM ('quarter_juz', 'half_juz', 'one_juz', 'five_juz');
CREATE TYPE public.exam_result AS ENUM ('mumtaz', 'jayyid_jiddan_plus', 'jayyid_jiddan', 'jayyid_plus', 'jayyid', 'maqbul', 'rosib');

-- Students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Student progress
CREATE TABLE public.student_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  total_lines INT NOT NULL DEFAULT 0,
  total_pages INT NOT NULL DEFAULT 0,
  total_juz DECIMAL NOT NULL DEFAULT 0,
  last_juz_id INT,
  last_page INT,
  last_line INT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id)
);

-- Hafalan Baru logs
CREATE TABLE public.hafalan_baru_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  juz_id INT NOT NULL,
  from_page INT NOT NULL,
  from_line INT NOT NULL,
  to_page INT NOT NULL,
  to_line INT NOT NULL,
  total_lines INT NOT NULL,
  pages DECIMAL NOT NULL DEFAULT 0,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Persiapan Ujian logs
CREATE TABLE public.persiapan_ujian_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  juz_id INT NOT NULL,
  exam_type exam_type NOT NULL,
  juz_part INT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Ujian logs
CREATE TABLE public.ujian_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  juz_id INT NOT NULL,
  exam_type exam_type NOT NULL,
  juz_part INT NOT NULL,
  result exam_result NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Murojaah logs
CREATE TABLE public.murojaah_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  juz_id INT NOT NULL,
  total_pages INT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_students BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_student_progress BEFORE UPDATE ON public.student_progress FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_hafalan_baru_logs BEFORE UPDATE ON public.hafalan_baru_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_persiapan_ujian_logs BEFORE UPDATE ON public.persiapan_ujian_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_ujian_logs BEFORE UPDATE ON public.ujian_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_murojaah_logs BEFORE UPDATE ON public.murojaah_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hafalan_baru_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persiapan_ujian_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ujian_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murojaah_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (no auth required for teacher app)
CREATE POLICY "Allow all access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to student_progress" ON public.student_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to hafalan_baru_logs" ON public.hafalan_baru_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to persiapan_ujian_logs" ON public.persiapan_ujian_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to ujian_logs" ON public.ujian_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to murojaah_logs" ON public.murojaah_logs FOR ALL USING (true) WITH CHECK (true);

-- Index updated_at and deleted_at cuz it's involved alot
CREATE INDEX idx_students_updated_at ON public.students(updated_at);
CREATE INDEX idx_hafalan_baru_logs_updated_at ON public.hafalan_baru_logs(updated_at);
CREATE INDEX idx_persiapan_ujian_logs_updated_at ON public.persiapan_ujian_logs(updated_at);
CREATE INDEX idx_ujian_logs_updated_at ON public.ujian_logs(updated_at);
CREATE INDEX idx_murojaah_logs_updated_at ON public.murojaah_logs(updated_at);

CREATE INDEX idx_students_not_deleted ON public.students(deleted_at);
CREATE INDEX idx_hafalan_baru_logs_not_deleted ON public.hafalan_baru_logs(deleted_at);
CREATE INDEX idx_persiapan_ujian_logs_not_deleted ON public.persiapan_ujian_logs(deleted_at);
CREATE INDEX idx_ujian_logs_not_deleted ON public.ujian_logs(deleted_at);
CREATE INDEX idx_murojaah_logs_not_deleted ON public.murojaah_logs(deleted_at);

-- Seed sample students
INSERT INTO public.students (id, name) VALUES 
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Ahmad Fauzi'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Fatimah Zahra'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Muhammad Rizki'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Aisyah Putri');
