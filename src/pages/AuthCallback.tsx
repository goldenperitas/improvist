import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Handles the OAuth callback from Supabase magic link authentication
 * Extracts the session from URL hash/query params and redirects to home
 */
export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase puts tokens in the hash fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        // Also check query params as fallback
        const queryParams = new URLSearchParams(window.location.search);
        const queryError = queryParams.get('error');
        const queryErrorDescription = queryParams.get('error_description');

        if (error || queryError) {
          const errorMsg = errorDescription || queryErrorDescription || error || queryError || 'Authentication failed';
          console.error('Auth error:', errorMsg);
          navigate('/login?error=' + encodeURIComponent(errorMsg));
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session using the tokens from the URL
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
            return;
          }
        }

        // Fallback: Check if we already have a session (might have been set automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          navigate('/login?error=' + encodeURIComponent(sessionError.message));
          return;
        }

        if (session) {
          navigate('/', { replace: true });
        } else {
          navigate('/login?error=invalid_session');
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
