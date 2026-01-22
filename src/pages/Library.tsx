import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLibraryProgressions, deleteFromLibrary, addToLibrary } from '../lib/db';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import type { LibraryProgression, Progression } from '../types';
import { ProgressionForm } from '../components/ProgressionForm';

export function Library() {
  const [progressions, setProgressions] = useState<LibraryProgression[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const data = await getLibraryProgressions();
      setProgressions(data);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this progression from your library?')) return;

    try {
      await deleteFromLibrary(id);
      setProgressions(progressions.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete from library:', err);
    }
  };

  const handleSaveProgression = async (
    data: Omit<LibraryProgression, 'id' | 'user_id' | 'created_at'> | Omit<Progression, 'id' | 'set_id' | 'created_at'>
  ) => {
    try {
      // Extract only the fields needed for library (exclude position if present)
      const libraryData: Omit<LibraryProgression, 'id' | 'user_id' | 'created_at'> = {
        name: data.name,
        chords: data.chords,
        instrument: data.instrument,
        notes: data.notes,
        audio_path: data.audio_path,
      };
      const created = await addToLibrary(libraryData);
      setProgressions([created, ...progressions]);
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to save progression:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
            <h1 className="text-3xl font-extralight text-white">My Library</h1>
          </div>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              New Progression
            </button>
          )}
        </div>

        {isCreating && (
          <div className="mb-6">
            <ProgressionForm
              onSave={handleSaveProgression}
              onCancel={() => setIsCreating(false)}
              isLibrary={true}
            />
          </div>
        )}

        {isLoading ? (
          <div className="text-gray-400 text-center py-8">Loading library...</div>
        ) : progressions.length === 0 && !isCreating ? (
          <div className="text-gray-400 text-center py-8">
            Your library is empty. Create a new progression or save progressions from your sets to build your library!
          </div>
        ) : (
          <div className="space-y-3">
            {progressions.map((progression) => (
              <div
                key={progression.id}
                className="bg-gray-800 rounded-lg p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  {progression.name && (
                    <div className="text-sm text-gray-400 mb-1">
                      {progression.name}
                    </div>
                  )}
                  <div className="text-lg font-light text-white truncate">
                    {progression.chords}
                  </div>
                  {progression.instrument && (
                    <div className="text-sm text-blue-400">
                      {progression.instrument}
                    </div>
                  )}
                  {progression.audio_path && (
                    <div className="text-xs text-green-400 mt-1">Has audio</div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(progression.id)}
                  className="px-3 py-1 border border-red-400/50 hover:border-red-400 text-red-400/70 hover:text-red-400 rounded text-sm transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
