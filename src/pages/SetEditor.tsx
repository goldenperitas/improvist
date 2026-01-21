import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getSetWithProgressions,
  updateSet,
  createProgression,
  updateProgression,
  deleteProgression,
  reorderProgressions,
  copyFromLibrary,
} from '../lib/db';
import { exportSetToJson } from '../lib/export';
import { ProgressionCard } from '../components/ProgressionCard';
import { ProgressionForm } from '../components/ProgressionForm';
import { LibrarySelector } from '../components/LibrarySelector';
import { ArrowLeft, Download, Play, Plus, BookPlus } from 'lucide-react';
import type { Set, Progression, LibraryProgression } from '../types';

export function SetEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [set, setSet] = useState<Set | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setName, setSetName] = useState('');
  const [editingProgression, setEditingProgression] = useState<Progression | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadSet(id);
    }
  }, [id]);

  const loadSet = async (setId: string) => {
    try {
      const data = await getSetWithProgressions(setId);
      if (data) {
        setSet(data);
        setSetName(data.name);
      }
    } catch (err) {
      console.error('Failed to load set:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSetName = async () => {
    if (!set || !setName.trim() || setName === set.name) return;

    try {
      await updateSet(set.id, setName.trim());
      setSet({ ...set, name: setName.trim() });
    } catch (err) {
      console.error('Failed to update set name:', err);
    }
  };

  const handleSaveProgression = async (
    data: Omit<Progression, 'id' | 'set_id' | 'created_at'>
  ) => {
    if (!set) return;

    try {
      if (editingProgression) {
        const updated = await updateProgression(editingProgression.id, data);
        setSet({
          ...set,
          progressions: set.progressions?.map((p) =>
            p.id === updated.id ? updated : p
          ),
        });
        setEditingProgression(null);
      } else {
        const position = set.progressions?.length || 0;
        const created = await createProgression(set.id, { ...data, position });
        setSet({
          ...set,
          progressions: [...(set.progressions || []), created],
        });
        setIsAddingNew(false);
      }
    } catch (err) {
      console.error('Failed to save progression:', err);
    }
  };

  const handleDeleteProgression = async (progression: Progression) => {
    if (!set || !confirm('Delete this progression?')) return;

    try {
      await deleteProgression(progression.id);
      const remaining = set.progressions?.filter((p) => p.id !== progression.id) || [];
      setSet({ ...set, progressions: remaining });
    } catch (err) {
      console.error('Failed to delete progression:', err);
    }
  };

  const handleMoveProgression = async (index: number, direction: 'up' | 'down') => {
    if (!set?.progressions) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= set.progressions.length) return;

    const reordered = [...set.progressions];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

    const updates = reordered.map((p, i) => ({ id: p.id, position: i }));

    setSet({
      ...set,
      progressions: reordered.map((p, i) => ({ ...p, position: i })),
    });

    try {
      await reorderProgressions(updates);
    } catch (err) {
      console.error('Failed to reorder progressions:', err);
      loadSet(set.id);
    }
  };

  const handleExport = () => {
    if (set) {
      exportSetToJson(set);
    }
  };

  const handleSelectFromLibrary = async (libraryProgression: LibraryProgression) => {
    if (!set) return;

    try {
      const position = set.progressions?.length || 0;
      const newProgression = await copyFromLibrary(libraryProgression.id, set.id, position);
      setSet({
        ...set,
        progressions: [...(set.progressions || []), newProgression],
      });
      setIsLibraryOpen(false);
    } catch (err) {
      console.error('Failed to add from library:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">Set not found</div>
          <Link to="/" className="text-white/70 hover:text-white">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <input
            type="text"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            onBlur={handleUpdateSetName}
            className="flex-1 text-2xl font-extralight bg-transparent text-white border-b border-transparent focus:border-gray-600 focus:outline-none"
          />
          <button
            onClick={handleExport}
            className="p-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded transition-colors"
            title="Export"
          >
            <Download size={18} />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <Link
            to={`/set/${set.id}/perform`}
            className="px-4 py-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Play size={18} />
            Start Performance
          </Link>
          {!isAddingNew && !editingProgression && (
            <>
              <button
                onClick={() => setIsAddingNew(true)}
                className="px-4 py-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add Progression
              </button>
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="px-4 py-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <BookPlus size={18} />
                Add from Library
              </button>
            </>
          )}
        </div>

        {isAddingNew && (
          <div className="mb-6">
            <ProgressionForm
              onSave={handleSaveProgression}
              onCancel={() => setIsAddingNew(false)}
            />
          </div>
        )}

        {editingProgression && (
          <div className="mb-6">
            <ProgressionForm
              progression={editingProgression}
              onSave={handleSaveProgression}
              onCancel={() => setEditingProgression(null)}
            />
          </div>
        )}

        {set.progressions && set.progressions.length > 0 ? (
          <div className="space-y-3">
            {set.progressions.map((progression, index) => (
              <ProgressionCard
                key={progression.id}
                progression={progression}
                onEdit={() => setEditingProgression(progression)}
                onDelete={() => handleDeleteProgression(progression)}
                onMoveUp={() => handleMoveProgression(index, 'up')}
                onMoveDown={() => handleMoveProgression(index, 'down')}
                canMoveUp={index > 0}
                canMoveDown={index < (set.progressions?.length || 0) - 1}
              />
            ))}
          </div>
        ) : (
          !isAddingNew && (
            <div className="text-gray-400 text-center py-8">
              No progressions yet. Add your first one above!
            </div>
          )
        )}
      </div>

      <LibrarySelector
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleSelectFromLibrary}
      />
    </div>
  );
}
