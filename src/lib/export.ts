import type { Set } from '../types';

export function exportSetToJson(set: Set): void {
  const data = JSON.stringify(set, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${set.name.replace(/[^a-z0-9]/gi, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportedSet(jsonString: string): Omit<Set, 'id' | 'user_id' | 'created_at'> & { progressions?: Array<Omit<import('../types').Progression, 'id' | 'set_id' | 'created_at'>> } {
  const parsed = JSON.parse(jsonString);

  if (!parsed.name || typeof parsed.name !== 'string') {
    throw new Error('Invalid set: missing name');
  }

  return {
    name: parsed.name,
    progressions: parsed.progressions?.map((p: Record<string, unknown>) => ({
      chords: p.chords || '',
      name: p.name,
      instrument: p.instrument,
      notes: p.notes,
      position: p.position || 0,
    })),
  };
}
