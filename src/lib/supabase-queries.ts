import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'];
type HafalanBaruLog = Database['public']['Tables']['hafalan_baru_logs']['Row'];
type MurojaahLog = Database['public']['Tables']['murojaah_logs']['Row'];
type PersiapanUjianLog = Database['public']['Tables']['persiapan_ujian_logs']['Row'];
type UjianLog = Database['public']['Tables']['ujian_logs']['Row'];

type StudentInsert = Database['public']['Tables']['students']['Insert'];
type HafalanBaruLogInsert = Database['public']['Tables']['hafalan_baru_logs']['Insert'];
type PersiapanUjianLogInsert = Database['public']['Tables']['persiapan_ujian_logs']['Insert'];
type UjianLogInsert = Database['public']['Tables']['ujian_logs']['Insert'];
type MurojaahLogInsert = Database['public']['Tables']['murojaah_logs']['Insert'];

// Students
export async function fetchStudents(last_updated_at?: string): Promise<Student[]> {
  let query = supabase
    .from('students')
    .select('*');

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

export async function updateStudent(
  id: string,
  updates: Partial<{ name: string }>
): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStudent(id: string): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Hafalan Baru Logs
export async function fetchHafalanBaruLogs(
  studentId?: string,
  last_updated_at?: string
): Promise<HafalanBaruLog[]> {
  let query = supabase
    .from('hafalan_baru_logs')
    .select('*');

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

export async function updateHafalanBaruLog(
  id: string,
  updates: Partial<Omit<HafalanBaruLog, 'id' | 'created_at'>>
): Promise<HafalanBaruLog> {
  const { data, error } = await supabase
    .from('hafalan_baru_logs')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHafalanBaruLog(id: string): Promise<HafalanBaruLog> {
  const { data, error } = await supabase
    .from('hafalan_baru_logs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

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
    .select('*');

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

export async function updatePersiapanUjianLog(
  id: string,
  updates: Partial<Omit<PersiapanUjianLog, 'id' | 'created_at'>>
): Promise<PersiapanUjianLog> {
  const { data, error } = await supabase
    .from('persiapan_ujian_logs')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePersiapanUjianLog(id: string): Promise<PersiapanUjianLog> {
  const { data, error } = await supabase
    .from('persiapan_ujian_logs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

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
    .select('*');

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

export async function updateUjianLog(
  id: string,
  updates: Partial<Omit<UjianLog, 'id' | 'created_at'>>
): Promise<UjianLog> {
  const { data, error } = await supabase
    .from('ujian_logs')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUjianLog(id: string): Promise<UjianLog> {
  const { data, error } = await supabase
    .from('ujian_logs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

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
    .select('*');

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

export async function updateMurojaahLog(
  id: string,
  updates: Partial<Omit<MurojaahLog, 'id' | 'created_at'>>
): Promise<MurojaahLog> {
  const { data, error } = await supabase
    .from('murojaah_logs')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMurojaahLog(id: string): Promise<MurojaahLog> {
  const { data, error } = await supabase
    .from('murojaah_logs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

