export interface Student {
  id: string;
  name: string;
  role?: 'student' | 'teacher' | 'examiner';
  created_at?: string;
  updated_at?: string;
}

export type LogCategory = 'hafalan_baru' | 'murojaah';
export type LogType = 'setoran' | 'persiapan_ujian' | 'ujian';

export interface DailyLog {
  id: string;
  student_id: string;
  category: LogCategory;
  type: LogType;
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

export type ExamType = 'quarter_juz' | 'half_juz' | 'one_juz' | 'five_juz';
export type ExamStatus = 'pending' | 'passed' | 'failed';

export interface ExamSession {
  id: string;
  student_id: string;
  exam_type: ExamType;
  status: ExamStatus;
  juz_start?: number;
  juz_end?: number;
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
