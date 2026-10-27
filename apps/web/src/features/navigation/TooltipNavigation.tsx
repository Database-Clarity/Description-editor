import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { EditorData } from '../../stores/data';
import { useDraftStore } from '../../stores/drafts';
import { itemFor, navigationGroups, variantHashes } from './catalog';
import { createStepping } from './stepping';
import styles from './Layout.module.scss';

export function TooltipNavigation({ data }: { data: EditorData }) {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => navigationGroups(data, query), [data, query]);
  const hashes = useMemo(
    () =>
      groups.flatMap((group) =>
        group.sections.flatMap((category) => category.items.map((item) => item.hash)),
      ),
    [groups],
  );
  const drafts = useDraftStore((state) => state.drafts);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const location = useLocation();
  const path = useRef(location.pathname);
  path.current = location.pathname;
  const select = useRef<HTMLSelectElement>(null);
  const [stepping] = useState(() =>
    createStepping((target, options) => navigateRef.current(target, options)),
  );
  const step = useRef<(direction: number) => void>(() => {});
  step.current = (direction) => {
    const index = hashes.indexOf(Number(path.current.split('/')[2]));
    const next = index === -1 ? hashes[0] : hashes[index + direction];
    if (next !== undefined) {
      const target = `/t/${next}`;
      stepping.step(path.current, target);
      path.current = target;
    }
  };
  useEffect(() => {
    const element = select.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      if (!event.deltaY || event.ctrlKey) return;
      event.preventDefault();
      step.current(Math.sign(event.deltaY));
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
    window.addEventListener('popstate', pop);
    document.addEventListener('click', explicit, true);
    document.addEventListener('change', change, true);
    return () => {
      element.removeEventListener('wheel', wheel);
      window.removeEventListener('popstate', pop);
      document.removeEventListener('click', explicit, true);
      document.removeEventListener('change', change, true);
      stepping.cancel();
    };
  }, [stepping]);
  const hash = Number(location.pathname.split('/')[2]);
  const sections = groups.flatMap((group) => group.sections);
  const selectedCategory =
    sections.find((category) => category.id === itemFor(hash, data)?.categoryId) ?? sections[0];
  const items = selectedCategory?.items ?? [];
  function choose(hash: number) {
    stepping.commit();
    navigate(`/t/${hash}`);
  }
  return (
    <section aria-label="Tooltip navigation" className={styles.tooltipNavigation}>
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
              <option key={item.hash} value={item.hash}>
                {dirty ? '* ' : ''}
                {item.name} ({item.hash})
              </option>
            );
          })}
        </select>
      </label>
      <small id="tooltip-stepping-help">
        Wheel / arrow keys on Tooltip to step. * = unsaved draft.
      </small>
    </section>
  );
}
