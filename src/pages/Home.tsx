import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getSets, createSet, deleteSet } from '../lib/db';
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
          <h1 className="text-3xl font-bold text-white">Improvist</h1>
          <button
            onClick={signOut}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>

        <form onSubmit={handleCreateSet} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newSetName}
            onChange={(e) => setNewSetName(e.target.value)}
            placeholder="New set name..."
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isCreating || !newSetName.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
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
                  <h2 className="text-lg font-semibold text-white">{set.name}</h2>
                  <p className="text-sm text-gray-400">
                    {new Date(set.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/set/${set.id}/perform`}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    Start
                  </Link>
                  <Link
                    to={`/set/${set.id}/edit`}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteSet(set.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
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
