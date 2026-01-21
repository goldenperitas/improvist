import { useState } from 'react';
import { addToLibrary } from '../lib/db';
import { ChevronUp, ChevronDown, Star, Pencil, Trash2 } from 'lucide-react';
import type { Progression } from '../types';

interface ProgressionCardProps {
  progression: Progression;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function ProgressionCard({
  progression,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ProgressionCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveToLibrary = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await addToLibrary({
        name: progression.name,
        chords: progression.chords,
        instrument: progression.instrument,
        notes: progression.notes,
        audio_path: progression.audio_path,
      });
      setSaveMessage('Saved!');
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err) {
      console.error('Failed to save to library:', err);
      setSaveMessage('Failed');
      setTimeout(() => setSaveMessage(null), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
      <div className="flex flex-col gap-1">
        <button
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="p-1 border border-white/50 hover:border-white text-white/70 hover:text-white rounded transition-colors disabled:border-white/20 disabled:text-white/30 disabled:cursor-not-allowed"
          aria-label="Move up"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="p-1 border border-white/50 hover:border-white text-white/70 hover:text-white rounded transition-colors disabled:border-white/20 disabled:text-white/30 disabled:cursor-not-allowed"
          aria-label="Move down"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        {progression.name && (
          <div className="text-sm text-gray-400 mb-1">{progression.name}</div>
        )}
        <div className="text-lg font-light text-white truncate">
          {progression.chords}
        </div>
        {progression.instrument && (
          <div className="text-sm text-blue-400">{progression.instrument}</div>
        )}
        {progression.audio_path && (
          <div className="text-xs text-green-400 mt-1">Has audio</div>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={handleSaveToLibrary}
          disabled={isSaving}
          className="p-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded transition-colors disabled:border-white/20 disabled:text-white/30 disabled:cursor-not-allowed"
          title="Save to Library"
        >
          {isSaving ? '...' : saveMessage || <Star size={14} />}
        </button>
        <button
          onClick={onEdit}
          className="p-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded transition-colors"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 border border-red-400/50 hover:border-red-400 text-red-400/70 hover:text-red-400 rounded transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
