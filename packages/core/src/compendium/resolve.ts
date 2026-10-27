import {
  sameCell,
  type CompendiumData,
  type CompendiumLink,
  type CompendiumRow,
  type CompendiumSheet,
} from './types.js';
import { isTrackedCompendiumTab } from './config.js';

export function normaliseCompendiumName(name: string): string {
  return name
    .replace(/(?:\s*[(\u005b][^()[\]]*[)\u005d])+\s*$/gu, '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}
function grams(text: string): Set<string> {
  const value = normaliseCompendiumName(text);
  return new Set(
    value.length < 3
      ? [value]
      : Array.from({ length: value.length - 2 }, (_, index) => value.slice(index, index + 3)),
  );
}
export function compendiumSimilarity(left: string, right: string): number {
  if (!left.trim() || !right.trim()) return left === right ? 1 : 0;
  const a = grams(left);
  const b = grams(right);
  const common = [...a].filter((gram) => b.has(gram)).length;
  return (2 * common) / (a.size + b.size);
}
export interface CompendiumMatch {
  tab: CompendiumSheet;
  row: CompendiumRow;
}
export interface CompendiumCandidate extends CompendiumMatch {
  similarity: number;
}
export type CompendiumResolution =
  | ({ status: 'ok' | 'changed' | 'moved'; changed: boolean } & CompendiumMatch)
  | { status: 'candidates'; candidates: CompendiumCandidate[] }
  | { status: 'missing' };

export function resolveCompendiumLink(
  link: CompendiumLink,
  data: CompendiumData,
): CompendiumResolution {
  const all = data.tabs
    .filter((tab) => isTrackedCompendiumTab(tab.name))
    .flatMap((tab) => tab.rows.map((row) => ({ tab, row })));
  let exact = all.filter(({ tab, row }) => tab.gid === link.gid && row.name === link.rowKey);
  if (exact.length > 1 && link.section) {
    const section = exact.filter(({ row }) => row.section === link.section);
    if (section.length) exact = section;
  }
  if (exact.length > 1) {
    const ranked = exact
      .map((match) => ({
        ...match,
        similarity: compendiumSimilarity(link.snapshot.plain, match.row.cell.plain),
      }))
      .sort((a, b) => b.similarity - a.similarity);
    if (ranked[0].similarity === ranked[1].similarity) {
      return { status: 'candidates', candidates: ranked.slice(0, 3) };
    }
    exact = [ranked[0]];
  }
  if (exact.length === 1) {
    const match = exact[0];
    const changed = !sameCell(link.snapshot, match.row.cell);
    return { ...match, changed, status: changed ? 'changed' : 'ok' };
  }
  const normalized = all.filter(({ row }) => row.nameNorm === normaliseCompendiumName(link.rowKey));
  if (normalized.length === 1) {
    const match = normalized[0];
    return { ...match, status: 'moved', changed: !sameCell(link.snapshot, match.row.cell) };
  }
  const candidates = all
    .map((match) => ({
      ...match,
      similarity: compendiumSimilarity(link.snapshot.plain, match.row.cell.plain),
    }))
    .filter((candidate) => candidate.similarity >= 0.6)
    .sort(
      (a, b) =>
        b.similarity - a.similarity ||
        a.tab.gid.localeCompare(b.tab.gid) ||
        a.row.rowIndex - b.row.rowIndex,
    )
    .slice(0, 3);
  return candidates.length ? { status: 'candidates', candidates } : { status: 'missing' };
}
export function snapshotCompendium(
  match: CompendiumMatch,
  now = new Date().toISOString(),
): CompendiumLink {
  return {
    gid: match.tab.gid,
    rowKey: match.row.name,
    ...(match.row.section ? { section: match.row.section } : {}),
    snapshot: match.row.cell,
    snapshotAt: now,
  };
}
