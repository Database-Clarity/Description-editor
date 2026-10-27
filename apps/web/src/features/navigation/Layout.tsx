import { NavLink, Outlet, useMatch } from 'react-router-dom';
import { useNavigationStore } from './navigationStore';
import styles from './Layout.module.scss';

const links = [
  { to: '/t/123', label: 'Tooltip editor' },
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
  const tooltipMatch = useMatch('/t/:hash');

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
        <button
          className={styles.toggle}
          type="button"
          aria-pressed={compact}
          onClick={toggleCompact}
        >
          {compact ? 'Comfortable navigation' : 'Compact navigation'}
        </button>
        <nav aria-label="Main navigation">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to === '/t/123' && tooltipMatch ? tooltipMatch.pathname : to}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <p className={styles.status}>Foundation preview - no live data</p>
      </aside>
      <main className={styles.main} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
