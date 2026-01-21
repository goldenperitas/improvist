import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getSets, createSet, deleteSet } from '../lib/db';
import { BookMarked, LogOut, Plus, Play, Pencil, Trash2 } from 'lucide-react';
import type { Set } from '../types';

export function Home() {
  const { signOut } = useAuth();
  const [sets, setSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSetName, setNewSetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadSets();
  }, []);

  const loadSets = async () => {
    try {
      const data = await getSets();
      setSets(data);
    } catch (err) {
      console.error('Failed to load sets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetName.trim()) return;

    setIsCreating(true);
    try {
      const newSet = await createSet(newSetName.trim());
      setSets([newSet, ...sets]);
      setNewSetName('');
    } catch (err) {
      console.error('Failed to create set:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this set?')) return;

    try {
      await deleteSet(id);
      setSets(sets.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete set:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extralight text-white">Improvist</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/library"
              className="p-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded transition-colors"
              title="Library"
            >
              <BookMarked size={18} />
            </Link>
            <button
              onClick={signOut}
              className="p-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleCreateSet} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newSetName}
            onChange={(e) => setNewSetName(e.target.value)}
            placeholder="New set name..."
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-white/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isCreating || !newSetName.trim()}
            className="px-4 py-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded transition-colors flex items-center gap-2 disabled:border-white/20 disabled:text-white/30 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </form>

        {isLoading ? (
          <div className="text-gray-400 text-center py-8">Loading sets...</div>
        ) : sets.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No sets yet. Create your first set above!
          </div>
        ) : (
          <div className="space-y-3">
            {sets.map((set) => (
              <div
                key={set.id}
                className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-lg font-light text-white">{set.name}</h2>
                  <p className="text-sm text-gray-400">
                    {new Date(set.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/set/${set.id}/perform`}
                    className="px-3 py-1 border border-white/50 hover:border-white text-white/70 hover:text-white rounded text-sm transition-colors flex items-center gap-2"
                  >
                    <Play size={14} />
                    Start
                  </Link>
                  <Link
                    to={`/set/${set.id}/edit`}
                    className="px-3 py-1 border border-white/50 hover:border-white text-white/70 hover:text-white rounded text-sm transition-colors flex items-center gap-2"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteSet(set.id)}
                    className="px-3 py-1 border border-red-400/50 hover:border-red-400 text-red-400/70 hover:text-red-400 rounded text-sm transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
