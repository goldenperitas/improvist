import { useState } from 'react';
import type { Progression } from '../types';
import { AudioRecorder } from './AudioRecorder';
import { AudioPlayer } from './AudioPlayer';
import { uploadAudio } from '../lib/storage';
import { Upload, X, Plus, Check } from 'lucide-react';

interface ProgressionFormProps {
  progression?: Progression;
  onSave: (data: Omit<Progression, 'id' | 'set_id' | 'created_at'>) => void;
  onCancel: () => void;
}

const INSTRUMENTS = ['Piano', 'Guitar', 'Bass', 'Synth', 'Drums', 'Vocals', 'Other'];

export function ProgressionForm({ progression, onSave, onCancel }: ProgressionFormProps) {
  const [name, setName] = useState(progression?.name || '');
  const [chords, setChords] = useState(progression?.chords || '');
  const [instrument, setInstrument] = useState(progression?.instrument || '');
  const [notes, setNotes] = useState(progression?.notes || '');
  const [audioPath, setAudioPath] = useState(progression?.audio_path || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chords.trim()) return;

    onSave({
      name: name.trim() || undefined,
      chords: chords.trim(),
      instrument: instrument || undefined,
      notes: notes.trim() || undefined,
      audio_path: audioPath || undefined,
      position: progression?.position || 0,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `upload_${Date.now()}_${file.name}`;
      const path = await uploadAudio(file, fileName);
      setAudioPath(path);
    } catch (err) {
      console.error('Failed to upload file:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Intro, Verse, Chorus"
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-white/50 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Chords *</label>
        <input
          type="text"
          value={chords}
          onChange={(e) => setChords(e.target.value)}
          placeholder="e.g., Dm7 - G7 - Cmaj7 - Am7"
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-white/50 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Instrument</label>
        <select
          value={instrument}
          onChange={(e) => setInstrument(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-white/50 focus:outline-none"
        >
          <option value="">Select instrument...</option>
          {INSTRUMENTS.map((inst) => (
            <option key={inst} value={inst}>{inst}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          rows={3}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-white/50 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Audio</label>
        <div className="flex flex-wrap gap-3 items-center">
          <AudioRecorder onRecorded={setAudioPath} />
          <span className="text-gray-500">or</span>
          <label className="px-4 py-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2">
            <Upload size={18} />
            {isUploading ? 'Uploading...' : 'Upload File'}
            <input
              type="file"
              accept=".mp3,.wav,.m4a,.ogg,.webm"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
        {audioPath && (
          <div className="mt-3 flex items-center gap-3">
            <AudioPlayer audioPath={audioPath} />
            <button
              type="button"
              onClick={() => setAudioPath('')}
              className="p-2 border border-red-400/50 hover:border-red-400 text-red-400/70 hover:text-red-400 rounded transition-colors"
              title="Remove audio"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-4 py-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {progression ? <Check size={18} /> : <Plus size={18} />}
          {progression ? 'Update' : 'Add'} Progression
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
