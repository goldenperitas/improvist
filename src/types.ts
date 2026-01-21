export interface Progression {
  id: string;
  set_id: string;
  name?: string;
  chords: string;
  instrument?: string;
  notes?: string;
  audio_path?: string;
  position: number;
  created_at?: string;
}

export interface Set {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  progressions?: Progression[];
}
