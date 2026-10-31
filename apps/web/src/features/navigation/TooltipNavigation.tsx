import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resolveAlias } from '@clarity/core';
import type { EditorData } from '../../stores/data';
import { useDraftStore } from '../../stores/drafts';
import {
  frameGroupSize,
  itemFor,
  navigationGroups,
  sharedPerkLabel,
  variantHashes,
} from './catalog';
import { createStepping, shiftScrollDirection, stepWithinCategory } from './stepping';
import styles from './Layout.module.scss';

export function TooltipNavigation({ data }: { data: EditorData }) {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => navigationGroups(data, query), [data, query]);
  const drafts = useDraftStore((state) => state.drafts);
  const discard = useDraftStore((state) => state.discard);
  const staleDrafts = Object.entries(drafts).filter(
    ([hash]) => resolveAlias(Number(hash), data.aliases) !== Number(hash),
  );
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const location = useLocation();
  const hash = Number(location.pathname.split('/')[2]);
  const sections = groups.flatMap((group) => group.sections);
  const selectedCategory =
    sections.find((category) => category.id === itemFor(hash, data)?.categoryId) ?? sections[0];
  const items = selectedCategory?.items ?? [];
  const hashes = items.map((item) => item.hash);
  const path = useRef(location.pathname);
  path.current = location.pathname;
  const select = useRef<HTMLSelectElement>(null);
  const [stepping] = useState(() =>
    createStepping((target, options) => navigateRef.current(target, options)),
  );
  const step = useRef<(direction: number) => boolean>(() => false);
  step.current = (direction) => {
    const next = stepWithinCategory(Number(path.current.split('/')[2]), direction, hashes);
    if (next !== undefined) {
      const target = `/t/${next}`;
      stepping.step(path.current, target);
      path.current = target;
      return true;
    }
    return false;
  };
  useEffect(() => {
    const element = select.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      if (!event.deltaY || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      step.current(Math.sign(event.deltaY));
    };
    const shiftWheel = (event: WheelEvent) => {
      const direction = shiftScrollDirection(event);
      if (!direction) return;
      if (step.current(direction)) event.preventDefault();
    };
    const pop = () => stepping.cancel();
    const change = (event: Event) => {
      if (event.target instanceof HTMLSelectElement && event.target !== element) stepping.commit();
    };
    const explicit = (event: MouseEvent) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      if (event.target instanceof Element && event.target.closest('a[href]')) stepping.commit();
    };
    element.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('wheel', shiftWheel, { passive: false, capture: true });
    window.addEventListener('popstate', pop);
    document.addEventListener('click', explicit, true);
    document.addEventListener('change', change, true);
    return () => {
      element.removeEventListener('wheel', wheel);
      window.removeEventListener('wheel', shiftWheel, true);
      window.removeEventListener('popstate', pop);
      document.removeEventListener('click', explicit, true);
      document.removeEventListener('change', change, true);
      stepping.cancel();
    };
  }, [stepping]);
  function choose(hash: number) {
    stepping.commit();
    navigate(`/t/${hash}`);
  }
  return (
    <section aria-label="Tooltip navigation" className={styles.tooltipNavigation}>
      {staleDrafts.map(([hash, draft]) => {
        const canonical = resolveAlias(Number(hash), data.aliases);
        return (
          <details key={hash}>
            <summary role="alert">
              Recovered draft conflict: {hash} now shares tooltip {canonical}
            </summary>
            <p>
              This draft is preserved, but cannot be saved separately. Copy any text you want to
              keep into the shared tooltip before discarding it.
            </p>
            <button type="button" onClick={() => choose(canonical)}>
              Open shared tooltip {canonical}
            </button>
            {Object.entries(draft.next.text).map(([language, value]) => (
              <div key={language}>
                <strong>{language}</strong>
                <pre className={styles.recoveredText}>{value.text}</pre>
              </div>
            ))}
            <button type="button" onClick={() => discard(Number(hash))}>
              Discard recovered draft {hash}
            </button>
          </details>
        );
      })}
      <label>
        Search name or hash
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <label>
        Category
        <select
          value={selectedCategory?.id ?? ''}
          disabled={!sections.length}
          onChange={(event) => {
            const first = sections.find((category) => category.id === event.target.value)?.items[0];
            if (first) choose(first.hash);
          }}
        >
          {!sections.length && <option value="">No matching categories</option>}
          {groups.map((group) => (
            <optgroup key={group.name} label={group.name}>
              {group.sections.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label} ({category.items.length})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <label>
        Tooltip
        <select
          ref={select}
          value={items.some((item) => item.hash === hash) ? String(hash) : ''}
          disabled={!items.length}
          aria-describedby="tooltip-stepping-help"
          onChange={(event) => choose(Number(event.target.value))}
          onKeyDown={(event) => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              step.current(event.key === 'ArrowDown' ? 1 : -1);
            }
          }}
        >
          <option value="" disabled>
            {items.length ? 'Choose tooltip' : 'No matching tooltips'}
          </option>
          {items.map((item) => {
            const dirty = variantHashes(item.hash, data).some((variant) => drafts[variant]);
            return (
              <option key={item.hash} value={item.hash} title={sharedPerkLabel(item.hash, data)}>
                {dirty ? '* ' : ''}
                {item.name} ({item.hash}){sharedPerkLabel(item.hash, data) && ' · shared perk'}
                {frameGroupSize(item.hash, data) > 1 && ` ×${frameGroupSize(item.hash, data)}`}
              </option>
            );
          })}
        </select>
      </label>
      {sharedPerkLabel(hash, data) && <small role="note">{sharedPerkLabel(hash, data)}</small>}
      <small id="tooltip-stepping-help">
        Shift+Scroll anywhere steps within this category and stops at its ends. Arrow keys on
        Tooltip also work. * = unsaved draft.
      </small>
    </section>
  );
}
