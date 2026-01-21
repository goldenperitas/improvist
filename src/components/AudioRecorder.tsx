import { useState, useRef } from 'react';
import { uploadAudio } from '../lib/storage';

interface AudioRecorderProps {
  onRecorded: (audioPath: string) => void;
}

export function AudioRecorder({ onRecorded }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        setIsUploading(true);
        try {
          const fileName = `recording_${Date.now()}.webm`;
          const path = await uploadAudio(blob, fileName);
          onRecorded(path);
        } catch (err) {
          setError('Failed to upload recording');
          console.error(err);
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (isUploading) {
    return (
      <button disabled className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg">
        Uploading...
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-lg transition-colors ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isRecording ? 'Stop Recording' : 'Record'}
      </button>
      {error && <span className="text-red-400 text-sm">{error}</span>}
    </div>
  );
}
