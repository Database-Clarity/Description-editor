import { useEffect } from 'react';
import { apiUrl, loginUrl } from '../../services/api';
import { useAuthStore } from '../../stores/auth';

export function AuthStatus() {
  const { user, loading, error, load, logout } = useAuthStore();
  useEffect(() => {
    void load();
  }, [load]);
  if (!apiUrl)
    return (
      <p role="status">Read-only: VITE_API_URL is not configured. Local drafts are preserved.</p>
    );
  if (loading) return <p role="status">Checking login...</p>;
  if (error)
    return (
      <p role="alert">
        Login unavailable: {error}{' '}
        <button type="button" onClick={() => void load()}>
          Retry login status
        </button>
      </p>
    );
  if (user)
    return (
      <p>
        Signed in as {user.login} ({user.role ?? 'no editing role'}){' '}
        <button type="button" onClick={logout}>
          Sign out
        </button>
      </p>
    );
  return <a href={loginUrl()}>Sign in with GitHub</a>;
}
