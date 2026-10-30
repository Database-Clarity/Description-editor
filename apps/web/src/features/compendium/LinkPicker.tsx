import { useEffect, useMemo, useState } from 'react';
import {
  compendiumIdentifiers,
  compendiumNameVariants,
  compendiumPreferredTabs,
  normaliseCompendiumName,
  snapshotCompendium,
  combineCompendiumMatches,
  type CompendiumMatch,
  type Tooltip,
} from '@clarity/core';
import { useDraftStore } from '../../stores/drafts';
import { errorMessage } from '../../services/http';
import { useCompendiumStore } from './store';
import styles from './Compendium.module.scss';
import { CellPicker } from './CellPicker';

export function LinkPicker({
  base,
  name,
  category,
  onLinked,
}: {
  base: Tooltip;
  name: string;
  category: string;
  onLinked(): void;
}) {
  const data = useCompendiumStore((state) => state.data);
  const updateDraft = useDraftStore((state) => state.updateDraft);
  const [anchorRow, setAnchorRow] = useState<CompendiumMatch['row']>();
  const [gid, setGid] = useState('');
  const [query, setQuery] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const preferenceKey = `clarity-compendium-tab:${category}`;
  useEffect(() => {
    if (!data) return;
    let remembered: string | null = null;
    try {
      remembered = localStorage.getItem(preferenceKey);
    } catch (error) {
      setError(`Cannot read remembered tab: ${errorMessage(error)}`);
    }
    const names = compendiumNameVariants(category, name).map(normaliseCompendiumName);
    const preferred = compendiumPreferredTabs(category, name);
    const suggested = [...data.tabs]
      .sort((a, b) => {
        const position = (gid: string) =>
          preferred.includes(gid) ? preferred.indexOf(gid) : preferred.length;
        return position(a.gid) - position(b.gid);
      })
      .find((tab) =>
        tab.rows.some((row) =>
          compendiumIdentifiers(row.name).some((identifier) =>
            names.includes(normaliseCompendiumName(identifier)),
          ),
        ),
      );
    setGid(
      data.tabs.find((tab) => tab.gid === remembered)?.gid ??
        suggested?.gid ??
        data.tabs.find((tab) => tab.rows.length)?.gid ??
        '',
    );
  }, [data, name, category, preferenceKey]);
  const rows = useMemo(() => {
    const searches = compendiumNameVariants(category, query).map(normaliseCompendiumName);
    const exact = (name: string) =>
      compendiumIdentifiers(name).some((identifier) =>
        searches.includes(normaliseCompendiumName(identifier)),
      );
    return (
      data?.tabs
        .find((tab) => tab.gid === gid)
        ?.rows.filter(
          (row) =>
            !query.trim() ||
            searches.some((search) =>
              normaliseCompendiumName(`${row.name} ${row.section ?? ''}`).includes(search),
            ),
        )
        .sort(
          (a, b) =>
            Number(exact(b.name)) - Number(exact(a.name)) ||
            a.name.localeCompare(b.name) ||
            a.rowIndex - b.rowIndex,
        ) ?? []
    );
  }, [data, gid, query, category]);
  function choose(match: CompendiumMatch) {
    updateDraft(base, (tooltip) => ({
      ...tooltip,
      compendium: snapshotCompendium(
        match.cells
          ? match
          : (combineCompendiumMatches(
              match.tab.rows
                .filter((row) => row.nameNorm === match.row.nameNorm)
                .map((row) => ({ tab: match.tab, row })),
            ) ?? match),
      ),
    }));
    try {
      localStorage.setItem(preferenceKey, match.tab.gid);
    } catch (error) {
      setError(`Link is drafted, but cannot remember tab: ${errorMessage(error)}`);
      return;
    }
    onLinked();
  }
  if (!data) return null;
  const tab = data.tabs.find((tab) => tab.gid === gid);
  return (
    <section aria-label="Link a Compendium row">
      <h3>Choose tab and row</h3>
      <label>
        Compendium tab{' '}
        <select
          value={gid}
          onChange={(event) => {
            setGid(event.target.value);
            setQuery('');
            setAnchorRow(undefined);
          }}
        >
          {data.tabs
            .filter((tab) => tab.rows.length)
            .map((tab) => (
              <option key={tab.gid} value={tab.gid}>
                {tab.name}
              </option>
            ))}
        </select>
      </label>
      <label>
        Find row by name <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <p>Exact name matches appear first. Linking creates a local draft; save it normally.</p>
      {error && <p role="alert">{error}</p>}
      <ul className={styles.rows}>
        {tab &&
          rows.slice(0, 100).map((row) => (
            <li key={`${row.rowIndex}:${row.name}`}>
              <button type="button" onClick={() => choose({ tab, row })}>
                {compendiumIdentifiers(row.name).some((identifier) =>
                  compendiumNameVariants(category, query)
                    .map(normaliseCompendiumName)
                    .includes(normaliseCompendiumName(identifier)),
                ) && 'Exact match: '}
                {row.name} {row.section && ` / ${row.section}`} <small>(row {row.rowIndex})</small>
              </button>
              <button type="button" onClick={() => setAnchorRow(row)}>
                Pick description cells near this name
              </button>
            </li>
          ))}
      </ul>
      {tab && (
        <CellPicker
          key={`${gid}:${anchorRow?.rowIndex}:${anchorRow?.anchor?.col}`}
          tab={tab}
          initial={anchorRow}
          onChoose={choose}
        />
      )}
      {!rows.length && <p>No matching rows. Choose another tab or search.</p>}
      {rows.length > 100 && <p>Showing 100 of {rows.length}; refine the search.</p>}
    </section>
  );
}
