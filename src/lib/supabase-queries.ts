import { supabase } from '@/integrations/supabase/client';
import type { Student, HafalanBaruLog, PersiapanUjianLog, UjianLog, MurojaahLog, TargetHafalan, MurojaahCycle } from '@/types';

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

// Hafalan Baru Logs
export async function fetchHafalanBaruLogs(studentId?: string): Promise<HafalanBaruLog[]> {
  let query = supabase.from('hafalan_baru_logs').select('*').order('created_at', { ascending: false });
  if (studentId) query = query.eq('student_id', studentId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function insertHafalanBaruLog(log: Omit<HafalanBaruLog, 'id' | 'created_at'>): Promise<HafalanBaruLog> {
  const { data, error } = await supabase.from('hafalan_baru_logs').insert(log as any).select().single();
  if (error) throw error;
  return data;
}

// Persiapan Ujian Logs
export async function fetchPersiapanUjianLogs(studentId?: string): Promise<PersiapanUjianLog[]> {
  let query = supabase.from('persiapan_ujian_logs').select('*').order('created_at', { ascending: false });
  if (studentId) query = query.eq('student_id', studentId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function insertPersiapanUjianLog(log: Omit<PersiapanUjianLog, 'id' | 'created_at'>): Promise<PersiapanUjianLog> {
  const { data, error } = await supabase.from('persiapan_ujian_logs').insert(log as any).select().single();
  if (error) throw error;
  return data;
}

// Ujian Logs
export async function fetchUjianLogs(studentId?: string): Promise<UjianLog[]> {
  let query = supabase.from('ujian_logs').select('*').order('created_at', { ascending: false });
  if (studentId) query = query.eq('student_id', studentId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function insertUjianLog(log: Omit<UjianLog, 'id' | 'created_at'>): Promise<UjianLog> {
  const { data, error } = await supabase.from('ujian_logs').insert(log as any).select().single();
  if (error) throw error;
  return data;
}

// Murojaah Logs
export async function fetchMurojaahLogs(studentId?: string): Promise<MurojaahLog[]> {
  let query = supabase.from('murojaah_logs').select('*').order('created_at', { ascending: false });
  if (studentId) query = query.eq('student_id', studentId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function insertMurojaahLog(log: Omit<MurojaahLog, 'id' | 'created_at'>): Promise<MurojaahLog> {
  const { data, error } = await supabase.from('murojaah_logs').insert(log as any).select().single();
  if (error) throw error;
  return data;
}

// Target Hafalan
export async function fetchTargets(studentId?: string): Promise<TargetHafalan[]> {
  let query = supabase.from('target_hafalan').select('*').order('deadline');
  if (studentId) query = query.eq('student_id', studentId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function insertTarget(target: Omit<TargetHafalan, 'id' | 'created_at' | 'current_value'>): Promise<TargetHafalan> {
  const { data, error } = await supabase.from('target_hafalan').insert([target as any]).select().single();
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
    .upsert(cycle as any, { onConflict: 'student_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
