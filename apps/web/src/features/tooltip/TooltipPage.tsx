import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { languages, langSchema, type Lang } from '@clarity/core';
import { apiUrl } from '../../services/api';
import { useDataStore } from '../../stores/data';
import { useDraftStore } from '../../stores/drafts';
import { useAuthStore } from '../../stores/auth';
import { canonicalHash, itemFor, tooltipFor, variantHashes } from '../navigation/catalog';
import styles from './TooltipPage.module.scss';

export function TooltipPage() {
  const { hash: parameter } = useParams();
  const data = useDataStore((state) => state.data);
  const [lang, setLang] = useState<Lang>('en');
  const drafts = useDraftStore((state) => state.drafts);
  const edit = useDraftStore((state) => state.edit);
  const discard = useDraftStore((state) => state.discard);
  const hydrated = useDraftStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  if (!data) return null;
  if (!parameter || !/^(0|[1-9]\d*)$/.test(parameter) || Number(parameter) > 0xffffffff) {
    return <h1>Invalid tooltip hash</h1>;
  }
  const hash = Number(parameter);
  const canonical = canonicalHash(hash, data);
  if (hash !== canonical) return <Navigate to={`/t/${canonical}`} replace />;
  const item = itemFor(hash, data);
  if (!item && !data.bundle.tooltips[hash]) return <h1>Tooltip {hash} not found</h1>;
  const globals = {
    variables: (drafts[2]?.next ?? data.bundle.tooltips[2])?.text[lang]?.text ?? '',
    titles: (drafts[3]?.next ?? data.bundle.tooltips[3])?.text[lang]?.text ?? '',
  };
  return (
    <article>
      <header className={styles.header}>
        {item?.icon && <img src={`https://www.bungie.net${item.icon}`} alt="" />}
        <div>
          <h1>{item?.name ?? `Tooltip ${hash}`}</h1>
          <p>
            {data.categories.find((category) => category.id === item?.categoryId)?.label ??
              item?.categoryId}{' '}
            / {hash}
          </p>
        </div>
        <label>
          Language{' '}
          <select value={lang} onChange={(event) => setLang(langSchema.parse(event.target.value))}>
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>
      </header>
      {variantHashes(hash, data).map((variant) => {
        const base = tooltipFor(variant, data);
        const tooltip = drafts[variant]?.next ?? base;
        const entry = itemFor(variant, data);
        const value = tooltip.text[lang]?.text ?? '';
        return (
          <section key={variant} className={styles.variant}>
            <header>
              <h2>
                {entry?.name ?? `Tooltip ${variant}`} {variant !== hash && '(enhanced variant)'}
              </h2>
              <small>{variant}</small>
              {drafts[variant] && (
                <button type="button" onClick={() => discard(variant)}>
                  Discard this tooltip's draft
                </button>
              )}
            </header>
            <div className={styles.columns}>
              <label>
                Clarity text ({lang})
                <textarea
                  value={value}
                  lang={lang}
                  spellCheck
                  readOnly={!apiUrl || !hydrated}
                  onChange={(event) =>
                    edit(base, lang, event.target.value, user?.login ?? 'local draft')
                  }
                  aria-label={`${entry?.name ?? variant} text (${lang})`}
                />
              </label>
              <section aria-label={`${entry?.name ?? variant} preview`}>
                <h3>Preview</h3>
                <pre>{value}</pre>
                <small>
                  Plain preview until the markup renderer is integrated.
                  {globals.variables || globals.titles ? ' Globals loaded.' : ''}
                </small>
              </section>
            </div>
          </section>
        );
      })}
    </article>
  );
}
