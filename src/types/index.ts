export interface Student {
  id: string;
  name: string;
}

export type LogCategory = 'hafalan_baru' | 'murojaah';
export type LogType = 'setoran' | 'persiapan_ujian' | 'ujian';

export interface DailyLog {
  id: string;
  student_id: string;
  date: string;
  category: LogCategory;
  type: LogType;
  juz_id: number;
  from_ayah: number;
  to_ayah: number;
  total_ayah: number;
  pages: number;
  note: string;
}

export type ExamType = 'quarter_juz' | 'half_juz' | 'one_juz' | 'five_juz';
export type ExamStatus = 'pending' | 'passed' | 'failed';

export interface ExamSession {
  id: string;
  student_id: string;
  exam_type: ExamType;
  status: ExamStatus;
  exam_date: string;
  juz_range?: string;
}

export type TargetType = 'juz' | 'ayah';

export interface TargetHafalan {
  id: string;
  student_id: string;
  target_type: TargetType;
  target_value: number;
  deadline: string;
  current_value?: number;
}

export interface MurojaahCycle {
  student_id: string;
  current_day: number;
  current_pages: number;
}

export interface StudentProgress {
  total_ayah: number;
  total_juz: number;
}
