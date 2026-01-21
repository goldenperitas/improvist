import { useState, useRef, useEffect } from 'react';
import { getAudioUrl } from '../lib/storage';

interface AudioPlayerProps {
  audioPath: string;
}

export function AudioPlayer({ audioPath }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAudio() {
      setIsLoading(true);
      setError(null);
      try {
        const url = await getAudioUrl(audioPath);
        if (!cancelled) {
          setAudioUrl(url);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load audio');
          console.error(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAudio();

    return () => {
      cancelled = true;
    };
  }, [audioPath]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);

    return () => audio.removeEventListener('ended', handleEnded);
  }, [audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg"
      >
        Loading...
      </button>
    );
  }

  if (error) {
    return (
      <span className="text-red-400 text-sm">{error}</span>
    );
  }

  return (
    <>
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}
      <button
        onClick={togglePlayback}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </>
  );
}
