import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { languages, outdatedTranslations } from '@clarity/core';
import { useAuthStore } from '../../stores/auth';
import { useDataStore } from '../../stores/data';
import { EnglishDiff } from './EnglishDiff';
import styles from '../drift/Status.module.scss';

export function TranslationsPage() {
  const data = useDataStore((state) => state.data);
  const { user, loading } = useAuthStore();
  const [params, setParams] = useSearchParams();
  const available = useMemo(
    () =>
      languages.filter(
        (lang) => lang !== 'en' && (user?.role !== 'translator' || user.languages?.includes(lang)),
      ),
    [user],
  );
  const filter = params.get('lang') ?? 'all';
  const selected = useMemo(
    () => available.filter((lang) => filter === 'all' || filter === lang),
    [available, filter],
  );
  const entries = useMemo(
    () =>
      data ? outdatedTranslations(Object.values(data.bundle.tooltips), selected, data.aliases) : [],
    [data, selected],
  );
  if (loading) return <p role="status">Loading your translation languages...</p>;
  if (!data) return null;
  return (
    <article className={styles.page}>
      <h1>Outdated translations</h1>
      <p>
        Translations based on an older English revision, oldest source-revision gap first. Red
        entries are exported in English because that gap exceeds 90 days (exactly 90 days is not
        enough). Age is the difference between English revisions, not time since today.
      </p>
      <p className={styles.muted}>
        Saved translations without a known source revision are not listed. Local drafts are not
        included.
      </p>
      {user?.role === 'translator' && (
        <p>Your assigned languages: {available.join(', ') || 'none'}.</p>
      )}
      <div className={styles.filters}>
        <label>
          Language
          <select
            value={filter}
            onChange={(event) => {
              setParams(event.target.value === 'all' ? {} : { lang: event.target.value });
            }}
          >
            <option value="all">
              {user?.role === 'translator' ? 'All assigned languages' : 'All languages'}
            </option>
            {available.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
            {filter !== 'all' && !available.some((lang) => lang === filter) && (
              <option value={filter} disabled>
                Unavailable language ({filter})
              </option>
            )}
          </select>
        </label>
      </div>
      <p>{entries.length} outdated translations in this view.</p>
      {!entries.length && (
        <p>No outdated translations{filter === 'all' ? '' : ' for this language'}.</p>
      )}
      {selected.map((lang) => {
        const group = entries.filter((entry) => entry.language === lang);
        if (!group.length) return null;
        return (
          <section key={lang} aria-label={`${lang} translations`}>
            <h2>
              {lang} ({group.length})
            </h2>
            {group.map(({ tooltip, sourceUpdatedAt, ageMs, exportedInEnglish }) => (
              <section key={tooltip.hash} className={styles.card}>
                <h2>
                  <Link to={`/t/${tooltip.hash}`}>
                    {data.items[tooltip.hash]?.name ?? tooltip.custom?.name ?? tooltip.hash}
                  </Link>{' '}
                  <small>({tooltip.hash})</small>
                </h2>
                <p className={exportedInEnglish ? styles.warning : undefined}>
                  {exportedInEnglish ? 'Over 90' : Math.ceil(ageMs / 86_400_000)} days behind
                  English
                  {exportedInEnglish ? ' — exported in English' : ''}
                </p>
                <p className={styles.muted}>
                  Based on English: {sourceUpdatedAt}
                  <br />
                  Current English: {tooltip.text.en?.updatedAt}
                </p>
                <h3>Current translation ({lang})</h3>
                <p className={styles.text}>{tooltip.text[lang]?.text}</p>
                <EnglishDiff
                  hash={tooltip.hash}
                  sourceUpdatedAt={sourceUpdatedAt}
                  current={tooltip.text.en?.text ?? ''}
                />
              </section>
            ))}
          </section>
        );
      })}
    </article>
  );
}
