-- Step 1: Schema sync. Drop tabel lama Cloud, apply schema dari migration repo (split logs).

-- Drop tabel lama
DROP TABLE IF EXISTS public.daily_logs CASCADE;
DROP TABLE IF EXISTS public.exam_sessions CASCADE;
DROP TABLE IF EXISTS public.murojaah_cycles CASCADE;
DROP TABLE IF EXISTS public.target_hafalan CASCADE;
DROP TABLE IF EXISTS public.student_progress CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;

-- Drop enums lama
DROP TYPE IF EXISTS public.log_category CASCADE;
DROP TYPE IF EXISTS public.log_type CASCADE;
DROP TYPE IF EXISTS public.exam_status CASCADE;
DROP TYPE IF EXISTS public.exam_type CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.target_type CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Enums
CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'examiner');
CREATE TYPE public.exam_type AS ENUM ('quarter_juz', 'half_juz', 'one_juz', 'five_juz');
CREATE TYPE public.exam_result AS ENUM ('mumtaz', 'jayyid_jiddan_plus', 'jayyid_jiddan', 'jayyid_plus', 'jayyid', 'maqbul', 'rosib');

-- Students
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

-- Hafalan baru logs
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

-- Persiapan ujian logs
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

-- Triggers updated_at
CREATE TRIGGER set_updated_at_students BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_student_progress BEFORE UPDATE ON public.student_progress FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_hafalan_baru_logs BEFORE UPDATE ON public.hafalan_baru_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_persiapan_ujian_logs BEFORE UPDATE ON public.persiapan_ujian_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_ujian_logs BEFORE UPDATE ON public.ujian_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_murojaah_logs BEFORE UPDATE ON public.murojaah_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hafalan_baru_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persiapan_ujian_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ujian_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murojaah_logs ENABLE ROW LEVEL SECURITY;

-- Open policies sementara (sebelum auth multi-tenant di Step 2)
CREATE POLICY "Allow all access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to student_progress" ON public.student_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to hafalan_baru_logs" ON public.hafalan_baru_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to persiapan_ujian_logs" ON public.persiapan_ujian_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to ujian_logs" ON public.ujian_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to murojaah_logs" ON public.murojaah_logs FOR ALL USING (true) WITH CHECK (true);

-- Indexes
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

CREATE INDEX idx_hafalan_baru_logs_student ON public.hafalan_baru_logs(student_id);
CREATE INDEX idx_persiapan_ujian_logs_student ON public.persiapan_ujian_logs(student_id);
CREATE INDEX idx_ujian_logs_student ON public.ujian_logs(student_id);
CREATE INDEX idx_murojaah_logs_student ON public.murojaah_logs(student_id);

-- Seed
INSERT INTO public.students (id, name) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Ahmad Fauzi'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Fatimah Zahra'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Muhammad Rizki'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Aisyah Putri');
