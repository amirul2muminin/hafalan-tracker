import { supabase } from '@/integrations/supabase/client';
import type { Student, HafalanBaruLog, MurojaahLog, PersiapanUjianLog, UjianLog } from '@/types';

// Students
export async function fetchStudents(last_updated_at?: string): Promise<Student[]> {
  let query = supabase
    .from('students')
    .select('*')
    .order('name');

  if (last_updated_at) {
    query = query.gte('updated_at', last_updated_at);
  }

  const { data, error } = await query;
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
export async function fetchHafalanBaruLogs(
  studentId?: string,
  last_updated_at?: string
): Promise<HafalanBaruLog[]> {
  let query = supabase
    .from('hafalan_baru_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  if (last_updated_at) {
    query = query.gte('updated_at', last_updated_at);
  }

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
export async function fetchPersiapanUjianLogs(
  studentId?: string,
  last_updated_at?: string
): Promise<PersiapanUjianLog[]> {
  let query = supabase
    .from('persiapan_ujian_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  if (last_updated_at) {
    query = query.gte('updated_at', last_updated_at);
  }

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
export async function fetchUjianLogs(
  studentId?: string,
  last_updated_at?: string
): Promise<UjianLog[]> {
  let query = supabase
    .from('ujian_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  if (last_updated_at) {
    query = query.gte('updated_at', last_updated_at);
  }

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
export async function fetchMurojaahLogs(
  studentId?: string,
  last_updated_at?: string
): Promise<MurojaahLog[]> {
  let query = supabase
    .from('murojaah_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  if (last_updated_at) {
    query = query.gte('updated_at', last_updated_at);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function insertMurojaahLog(log: Omit<MurojaahLog, 'id' | 'created_at'>): Promise<MurojaahLog> {
  const { data, error } = await supabase.from('murojaah_logs').insert(log as any).select().single();
  if (error) throw error;
  return data;
}

