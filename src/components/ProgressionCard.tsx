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
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
      <div className="flex flex-col gap-1">
        <button
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Move up"
        >
          &#9650;
        </button>
        <button
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Move down"
        >
          &#9660;
        </button>
      </div>

      <div className="flex-1 min-w-0">
        {progression.name && (
          <div className="text-sm text-gray-400 mb-1">{progression.name}</div>
        )}
        <div className="text-lg font-semibold text-white truncate">
          {progression.chords}
        </div>
        {progression.instrument && (
          <div className="text-sm text-blue-400">{progression.instrument}</div>
        )}
        {progression.audio_path && (
          <div className="text-xs text-green-400 mt-1">Has audio</div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
