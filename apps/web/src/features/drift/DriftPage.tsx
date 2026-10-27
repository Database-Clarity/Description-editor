import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { bungieDrift, type Tooltip } from '@clarity/core';
import { apiUrl, save } from '../../services/api';
import { errorMessage } from '../../services/http';
import { useAuthStore } from '../../stores/auth';
import { useDataStore } from '../../stores/data';
import { WordDiff } from './WordDiff';
import { reviewedSnapshot } from './review';
import styles from './Status.module.scss';

export function DriftPage() {
  const data = useDataStore((state) => state.data);
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const result = useMemo(
    () => data && bungieDrift(Object.values(data.bundle.tooltips), data.items, data.aliases),
    [data],
  );
  const canReview = Boolean(
    apiUrl && user && ['maintainer', 'editor', 'trial'].includes(user.role ?? ''),
  );
  if (!data || !result) return null;
  const search = query.trim().toLocaleLowerCase();
  const entries = result.changed.filter(
    ({ tooltip }) =>
      String(tooltip.hash).includes(search) ||
      data.items[tooltip.hash]?.name.toLocaleLowerCase().includes(search),
  );

  async function markReviewed(base: Tooltip, description: string) {
    setBusy(base.hash);
    setError(null);
    setNotice(null);
    try {
      const next = reviewedSnapshot(base, description, new Date().toISOString());
      const response = await save(
        [{ hash: base.hash, base, next }],
        'Review Bungie description drift',
      );
      if (response.kind !== 'saved') {
        throw new Error(
          response.kind === 'retry'
            ? response.error
            : 'This tooltip changed on the server. Reload editor data and review the new description before retrying.',
        );
      }
      useDataStore.setState((state) =>
        state.data
          ? {
              data: {
                ...state.data,
                bundle: {
                  ...state.data.bundle,
                  sourceCommit: response.commit,
                  tooltips: {
                    ...state.data.bundle.tooltips,
                    ...Object.fromEntries(
                      response.tooltips.map((tooltip) => [tooltip.hash, tooltip]),
                    ),
                  },
                },
              },
            }
          : {},
      );
      setNotice(
        `Marked ${base.hash} reviewed. Only the Bungie snapshot was submitted; local drafts were not saved.`,
      );
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className={styles.page}>
      <h1>Bungie drift</h1>
      <p>{result.changed.length} tooltips have changed in-game descriptions.</p>
      <p className={styles.muted}>
        {result.missingSnapshots} manifest tooltips have no snapshot yet and are not listed. Saves
        create a snapshot for future comparisons. This view uses saved tooltips, not local drafts.
      </p>
      <p>Removed words are struck through; added words are underlined.</p>
      {!canReview && (
        <p className={styles.muted}>
          Sign in as a maintainer, editor or trial editor to mark descriptions reviewed.
        </p>
      )}
      <div className={styles.filters}>
        <label>
          Filter by name or hash
          <input value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>
      {error && (
        <p role="alert">
          {error}{' '}
          <button type="button" onClick={() => void useDataStore.getState().load()}>
            Reload editor data
          </button>
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {!entries.length && <p>No changed descriptions{query ? ' match this filter' : ''}.</p>}
      {entries.map(({ tooltip, description }) => (
        <section key={tooltip.hash} className={styles.card}>
          <h2>
            <Link to={`/t/${tooltip.hash}`}>{data.items[tooltip.hash]?.name ?? tooltip.hash}</Link>{' '}
            <small>({tooltip.hash})</small>
          </h2>
          <p className={styles.muted}>Snapshot: {tooltip.bungieSnapshot?.snapshotAt}</p>
          <WordDiff before={tooltip.bungieSnapshot?.description ?? ''} after={description} />
          <button
            type="button"
            disabled={!canReview || busy !== null}
            onClick={() => void markReviewed(tooltip, description)}
          >
            {busy === tooltip.hash ? 'Saving snapshot...' : 'Mark reviewed'}
          </button>
        </section>
      ))}
    </article>
  );
}
