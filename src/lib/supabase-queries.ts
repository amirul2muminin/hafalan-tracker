import { supabase } from '@/integrations/supabase/client';
import type { Student, DailyLog, ExamSession, TargetHafalan, MurojaahCycle } from '@/types';

// Students
export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase.from('students').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function insertStudent(student: { name: string }): Promise<Student> {
  const { data, error } = await supabase.from('students').insert(student).select().single();
  if (error) throw error;
  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}

// Daily Logs
export async function fetchDailyLogs(studentId?: string): Promise<DailyLog[]> {
  let query = supabase.from('daily_logs').select('*').order('date', { ascending: false });
  if (studentId) query = query.eq('student_id', studentId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function insertDailyLog(log: Omit<DailyLog, 'id' | 'created_at'>): Promise<DailyLog> {
  const { data, error } = await supabase.from('daily_logs').insert(log).select().single();
  if (error) throw error;
  return data;
}

// Exam Sessions
export async function fetchExams(studentId?: string): Promise<ExamSession[]> {
  let query = supabase.from('exam_sessions').select('*').order('exam_date', { ascending: false });
  if (studentId) query = query.eq('student_id', studentId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function insertExam(exam: Omit<ExamSession, 'id' | 'created_at'>): Promise<ExamSession> {
  const { data, error } = await supabase.from('exam_sessions').insert(exam).select().single();
  if (error) throw error;
  return data;
}

export async function updateExamStatus(id: string, status: ExamSession['status']): Promise<void> {
  const { error } = await supabase.from('exam_sessions').update({ status }).eq('id', id);
  if (error) throw error;
}

// Target Hafalan
export async function fetchTargets(studentId?: string): Promise<TargetHafalan[]> {
  let query = supabase.from('target_hafalan').select('*').order('deadline');
  if (studentId) query = query.eq('student_id', studentId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function insertTarget(target: Omit<TargetHafalan, 'id' | 'created_at'>): Promise<TargetHafalan> {
  const { data, error } = await supabase.from('target_hafalan').insert(target).select().single();
  if (error) throw error;
  return data;
}

// Murojaah Cycles
export async function fetchMurojaahCycle(studentId: string): Promise<MurojaahCycle | null> {
  const { data, error } = await supabase.from('murojaah_cycles').select('*').eq('student_id', studentId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertMurojaahCycle(cycle: Omit<MurojaahCycle, 'id'>): Promise<MurojaahCycle> {
  const { data, error } = await supabase.from('murojaah_cycles')
    .upsert(cycle, { onConflict: 'student_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
