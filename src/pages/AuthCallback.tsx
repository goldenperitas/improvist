import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Handles the OAuth callback from Supabase magic link authentication
 * Extracts the session from URL hash and redirects to home
 */
export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL (Supabase puts tokens in the hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          console.error('Auth error:', error, errorDescription);
          navigate('/login?error=' + encodeURIComponent(errorDescription || error));
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            navigate('/login?error=' + encodeURIComponent(sessionError.message));
            return;
          }

          if (data.session) {
            // Successfully authenticated, redirect to home
            navigate('/', { replace: true });
          }
        } else {
          // Try to get session from current URL (fallback)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            navigate('/login?error=invalid_session');
            return;
          }

          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/login?error=authentication_failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-gray-400">Completing sign in...</div>
    </div>
  );
}
