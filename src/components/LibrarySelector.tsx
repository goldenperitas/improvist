import { useState, useEffect } from 'react';
import { getLibraryProgressions } from '../lib/db';
import { X } from 'lucide-react';
import type { LibraryProgression } from '../types';

interface LibrarySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (progression: LibraryProgression) => void;
}

export function LibrarySelector({ isOpen, onClose, onSelect }: LibrarySelectorProps) {
  const [progressions, setProgressions] = useState<LibraryProgression[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadLibrary();
    }
  }, [isOpen]);

  const loadLibrary = async () => {
    setIsLoading(true);
    try {
      const data = await getLibraryProgressions();
      setProgressions(data);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProgressions = progressions.filter((p) => {
    const search = searchTerm.toLowerCase();
    return (
      p.chords.toLowerCase().includes(search) ||
      (p.name && p.name.toLowerCase().includes(search)) ||
      (p.instrument && p.instrument.toLowerCase().includes(search))
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-extralight text-white">Add from Library</h2>
            <button
              onClick={onClose}
              className="p-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, chords, or instrument..."
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-white/50 focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-gray-400 text-center py-8">Loading...</div>
          ) : filteredProgressions.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              {progressions.length === 0
                ? 'Your library is empty'
                : 'No matching progressions'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProgressions.map((progression) => (
                <button
                  key={progression.id}
                  onClick={() => onSelect(progression)}
                  className="w-full text-left bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition-colors border border-transparent hover:border-white/30"
                >
                  {progression.name && (
                    <div className="text-sm text-gray-400">{progression.name}</div>
                  )}
                  <div className="text-white font-light truncate">
                    {progression.chords}
                  </div>
                  {progression.instrument && (
                    <div className="text-sm text-blue-400">{progression.instrument}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
