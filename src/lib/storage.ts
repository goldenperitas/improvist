import { supabase } from './supabase';

const AUDIO_BUCKET = 'audio';

export async function uploadAudio(file: Blob, fileName: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const path = `${user.id}/${fileName}`;

  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;
  return path;
}

export async function getAudioUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteAudio(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .remove([path]);

  if (error) throw error;
}
