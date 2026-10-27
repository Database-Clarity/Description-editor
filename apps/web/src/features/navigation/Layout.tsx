import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useNavigationStore } from './navigationStore';
import { useDataStore } from '../../stores/data';
import { useDraftStore } from '../../stores/drafts';
import { AuthStatus } from '../auth/AuthStatus';
import { TooltipNavigation } from './TooltipNavigation';
import styles from './Layout.module.scss';

const links = [
  { to: '/', label: 'Tooltip editor' },
  { to: '/review', label: 'Review changes' },
  { to: '/compendium', label: 'Compendium' },
  { to: '/drift', label: 'Bungie drift' },
  { to: '/translations', label: 'Translations' },
  { to: '/globals', label: 'Globals' },
  { to: '/admin', label: 'Administration' },
];

export function Layout() {
  const compact = useNavigationStore((state) => state.compact);
  const toggleCompact = useNavigationStore((state) => state.toggleCompact);
  const location = useLocation();
  const navigate = useNavigate();
  const { data, status, error, load } = useDataStore();
  const { hydrated, pending, error: draftError, hydrate, retry } = useDraftStore();
  useEffect(() => {
    void load();
    void hydrate();
  }, [load, hydrate]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (pending || draftError) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [pending, draftError]);

  return (
    <div className={`${styles.layout} ${compact ? styles.compact : ''}`}>
      <a
        className={styles.skipLink}
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Skip to content
      </a>
      <aside className={styles.sidebar}>
        <header className={styles.brand}>
          <strong>Clarity</strong>
          <span>Description editor v2</span>
        </header>
        {data && <TooltipNavigation data={data} />}
        <label className={styles.pageSelection}>
          Workspace
          <select
            value={
              links.find(({ to }) => to !== '/' && location.pathname.startsWith(to))?.to ?? '/'
            }
            onChange={(event) => navigate(event.target.value)}
          >
            {links.map(({ to, label }) => (
              <option key={to} value={to}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          className={styles.toggle}
          type="button"
          aria-pressed={compact}
          onClick={toggleCompact}
        >
          {compact ? 'Comfortable navigation' : 'Compact navigation'}
        </button>
        <AuthStatus />
        <p className={styles.status}>
          {data && `Data revision ${data.bundle.sourceCommit.slice(0, 8)}`}
        </p>
      </aside>
      <main className={styles.main} id="main-content" tabIndex={-1}>
        {draftError && (
          <p role="alert">
            {draftError}{' '}
            <button type="button" onClick={() => (hydrated ? retry() : void hydrate())}>
              Retry draft storage
            </button>
          </p>
        )}
        {pending > 0 && <p role="status">Saving local drafts...</p>}
        {status === 'loading' && <p role="status">Loading manifest and tooltip data...</p>}
        {error && (
          <p role="alert">
            Cannot load editor data: {error}{' '}
            <button type="button" onClick={() => void load()}>
              Retry data loading
            </button>
          </p>
        )}
        {!hydrated && !draftError && <p role="status">Recovering local drafts...</p>}
        {status === 'ready' && hydrated && <Outlet />}
      </main>
    </div>
  );
}
