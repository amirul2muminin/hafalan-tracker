export interface Student {
  id: string;
  name: string;
  role?: 'student' | 'teacher' | 'examiner';
  created_at?: string;
  updated_at?: string;
}

export type ExamType = 'quarter_juz' | 'half_juz' | 'one_juz' | 'five_juz';
export type ExamResult = 'mumtaz' | 'jayyid_jiddan_plus' | 'jayyid_jiddan' | 'jayyid_plus' | 'jayyid' | 'maqbul' | 'rosib';

export interface HafalanBaruLog {
  id: string;
  student_id: string;
  juz_id: number;
  from_page: number;
  from_line: number;
  to_page: number;
  to_line: number;
  total_lines: number;
  pages: number;
  note: string;
  created_at: string;
  updated_at?: string;
}

export interface PersiapanUjianLog {
  id: string;
  student_id: string;
  juz_id: number;
  exam_type: ExamType;
  juz_part: number;
  note: string;
  created_at: string;
  updated_at?: string;
}

export interface UjianLog {
  id: string;
  student_id: string;
  juz_id: number;
  exam_type: ExamType;
  juz_part: number;
  result: ExamResult;
  note: string;
  created_at: string;
  updated_at?: string;
}

export interface MurojaahLog {
  id: string;
  student_id: string;
  juz_id: number;
  total_pages: number;
  note: string;
  created_at: string;
  updated_at?: string;
}

export type TargetType = 'juz' | 'page' | 'line';

export interface TargetHafalan {
  id: string;
  student_id: string;
  target_type: TargetType;
  target_value: number;
  deadline: string;
  current_value?: number;
  created_at: string;
  updated_at?: string;
}

export interface MurojaahCycle {
  id?: string;
  student_id: string;
  current_day: number;
  current_pages: number;
  created_at?: string;
  updated_at?: string;
}

export interface StudentProgress {
  total_lines: number;
  total_pages: number;
  total_juz: number;
}
