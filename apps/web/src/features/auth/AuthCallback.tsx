import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { setSession } from '../../services/api';
import { errorMessage } from '../../services/http';
import { useAuthStore } from '../../stores/auth';

export function AuthCallback() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const load = useAuthStore((state) => state.load);
  const consumed = useRef(false);
  useEffect(() => {
    if (consumed.current) return;
    consumed.current = true;
    const parameters = new URLSearchParams(search);
    const session = parameters.get('session');
    // Remove the token from the visible URL and browser history before rendering data.
    navigate('/auth/callback', { replace: true });
    if (!session) {
      setError(parameters.get('error') ?? 'Login callback contains no session. Sign in again.');
      return;
    }
    try {
      setSession(session);
    } catch (reason) {
      setError(`Cannot retain login session: ${errorMessage(reason)}`);
      return;
    }
    void load();
    navigate('/', { replace: true });
  }, [search, navigate, load]);
  return error ? (
    <p role="alert">
      {error} <Link to="/">Return to editor</Link>
    </p>
  ) : (
    <p role="status">Completing GitHub login...</p>
  );
}
