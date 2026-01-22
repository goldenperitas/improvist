import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Send } from 'lucide-react';

export function Login() {
  const { signInWithEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check for error in URL query params
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setMessage({ type: 'error', text: decodeURIComponent(error) });
      // Clean up URL
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await signInWithEmail(email);
      setMessage({ type: 'success', text: 'Check your email for the login link!' });
      setEmail('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send login link. Please try again.' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-extralight text-white text-center mb-2">Improvist</h1>
        <p className="text-gray-400 text-center mb-8">Chord progressions for live performance</p>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-white/50 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 border border-white/50 hover:border-white text-white/70 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:border-white/20 disabled:text-white/30 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </button>

          {message && (
            <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
