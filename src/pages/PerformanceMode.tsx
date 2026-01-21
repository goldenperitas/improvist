import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSetWithProgressions } from '../lib/db';
import { useStopwatch } from '../hooks/useStopwatch';
import { Stopwatch } from '../components/Stopwatch';
import { NavigationArrows } from '../components/NavigationArrows';
import { AudioPlayer } from '../components/AudioPlayer';
import type { Set } from '../types';

export function PerformanceMode() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [set, setSet] = useState<Set | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const { formattedTime } = useStopwatch(true);

  useEffect(() => {
    if (id) {
      loadSet(id);
    }
  }, [id]);

  const loadSet = async (setId: string) => {
    try {
      const data = await getSetWithProgressions(setId);
      setSet(data);
    } catch (err) {
      console.error('Failed to load set:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const progressions = set?.progressions || [];
  const currentProgression = progressions[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < progressions.length - 1;

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      setCurrentIndex(currentIndex - 1);
      setShowNotes(false);
    }
  }, [hasPrevious, currentIndex]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1);
      setShowNotes(false);
    }
  }, [hasNext, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        navigate(`/set/${id}/edit`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, navigate, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!set || progressions.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            {!set ? 'Set not found' : 'No progressions in this set'}
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={() => navigate(`/set/${id}/edit`)}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          Exit
        </button>
        <div className="text-gray-500 text-sm">
          {currentIndex + 1} / {progressions.length}
        </div>
        <Stopwatch formattedTime={formattedTime} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {currentProgression.name && (
          <div className="text-gray-400 text-xl mb-4">
            {currentProgression.name}
          </div>
        )}

        <div className="text-white text-5xl md:text-7xl font-bold text-center mb-6 leading-tight">
          {currentProgression.chords}
        </div>

        {currentProgression.instrument && (
          <div className="text-blue-400 text-2xl mb-6">
            {currentProgression.instrument}
          </div>
        )}

        {currentProgression.notes && (
          <div className="mb-6">
            {showNotes ? (
              <div
                onClick={() => setShowNotes(false)}
                className="bg-gray-900 rounded-lg p-4 max-w-md text-gray-300 cursor-pointer"
              >
                {currentProgression.notes}
              </div>
            ) : (
              <button
                onClick={() => setShowNotes(true)}
                className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
              >
                Show notes
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 flex justify-between items-center">
        <div className="w-24">
          {currentProgression.audio_path && (
            <AudioPlayer audioPath={currentProgression.audio_path} />
          )}
        </div>

        <NavigationArrows
          onPrevious={goToPrevious}
          onNext={goToNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />

        <div className="w-24" />
      </div>
    </div>
  );
}
