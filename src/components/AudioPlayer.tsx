import { useState, useRef, useEffect } from 'react';
import { getAudioUrl } from '../lib/storage';
import { Play, Pause } from 'lucide-react';

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
        className="px-4 py-2 border border-white/20 text-white/30 rounded-lg cursor-not-allowed"
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
        className="px-4 py-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded-lg transition-colors flex items-center gap-2"
      >
        {isPlaying ? (
          <>
            <Pause size={18} />
            Pause
          </>
        ) : (
          <>
            <Play size={18} />
            Play
          </>
        )}
      </button>
    </>
  );
}
