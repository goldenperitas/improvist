import { supabase } from './supabase';
import type { Set, Progression } from '../types';

// Sets CRUD
export async function getSets(): Promise<Set[]> {
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSet(id: string): Promise<Set | null> {
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getSetWithProgressions(id: string): Promise<Set | null> {
  const { data: set, error: setError } = await supabase
    .from('sets')
    .select('*')
    .eq('id', id)
    .single();

  if (setError) throw setError;
  if (!set) return null;

  const { data: progressions, error: progError } = await supabase
    .from('progressions')
    .select('*')
    .eq('set_id', id)
    .order('position', { ascending: true });

  if (progError) throw progError;

  return { ...set, progressions: progressions || [] };
}

export async function createSet(name: string): Promise<Set> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('sets')
    .insert({ name, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSet(id: string, name: string): Promise<Set> {
  const { data, error } = await supabase
    .from('sets')
    .update({ name })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSet(id: string): Promise<void> {
  const { error } = await supabase
    .from('sets')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Progressions CRUD
export async function getProgressions(setId: string): Promise<Progression[]> {
  const { data, error } = await supabase
    .from('progressions')
    .select('*')
    .eq('set_id', setId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createProgression(
  setId: string,
  progression: Omit<Progression, 'id' | 'set_id' | 'created_at'>
): Promise<Progression> {
  const { data, error } = await supabase
    .from('progressions')
    .insert({ ...progression, set_id: setId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProgression(
  id: string,
  updates: Partial<Omit<Progression, 'id' | 'set_id' | 'created_at'>>
): Promise<Progression> {
  const { data, error } = await supabase
    .from('progressions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProgression(id: string): Promise<void> {
  const { error } = await supabase
    .from('progressions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function reorderProgressions(
  progressions: { id: string; position: number }[]
): Promise<void> {
  const updates = progressions.map(({ id, position }) =>
    supabase
      .from('progressions')
      .update({ position })
      .eq('id', id)
  );

  await Promise.all(updates);
}
