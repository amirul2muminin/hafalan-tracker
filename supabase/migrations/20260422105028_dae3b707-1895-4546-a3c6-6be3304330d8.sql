
-- Create enums
CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'examiner');
CREATE TYPE public.log_category AS ENUM ('hafalan_baru', 'murojaah');
CREATE TYPE public.log_type AS ENUM ('setoran', 'persiapan_ujian', 'ujian');
CREATE TYPE public.exam_type AS ENUM ('quarter_juz', 'half_juz', 'one_juz', 'five_juz');
CREATE TYPE public.exam_status AS ENUM ('pending', 'passed', 'failed');
CREATE TYPE public.target_type AS ENUM ('juz', 'page', 'line');

-- Students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
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
  UNIQUE(student_id)
);

-- Daily logs (core table)
CREATE TABLE public.daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category log_category NOT NULL,
  type log_type NOT NULL,
  juz_id INT NOT NULL,
  from_page INT NOT NULL,
  from_line INT NOT NULL,
  to_page INT NOT NULL,
  to_line INT NOT NULL,
  total_lines INT NOT NULL,
  pages DECIMAL NOT NULL DEFAULT 0,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exam sessions
CREATE TABLE public.exam_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_type exam_type NOT NULL,
  juz_start INT,
  juz_end INT,
  status exam_status NOT NULL DEFAULT 'pending',
  exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Murojaah cycles
CREATE TABLE public.murojaah_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  current_day INT NOT NULL DEFAULT 0,
  current_pages INT NOT NULL DEFAULT 3,
  last_completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Target hafalan
CREATE TABLE public.target_hafalan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  target_type target_type NOT NULL,
  target_value INT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murojaah_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_hafalan ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (no auth required for teacher app)
CREATE POLICY "Allow all access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to student_progress" ON public.student_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to daily_logs" ON public.daily_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to exam_sessions" ON public.exam_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to murojaah_cycles" ON public.murojaah_cycles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to target_hafalan" ON public.target_hafalan FOR ALL USING (true) WITH CHECK (true);

-- Seed sample students
INSERT INTO public.students (id, name) VALUES 
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Ahmad Fauzi'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Fatimah Zahra'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Muhammad Rizki'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Aisyah Putri');
