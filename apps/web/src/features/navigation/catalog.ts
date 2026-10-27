import type { Tooltip } from '@clarity/core';
import type { EditorData } from '../../stores/data';
import type { Category, Item } from '../../services/generator';

export function canonicalHash(hash: number, data: EditorData): number {
  const seen = new Set<number>();
  while (!seen.has(hash)) {
    seen.add(hash);
    // A real item/trait wins if a sandbox hash happens to collide with it.
    const item = data.items[hash];
    const target = item?.baseHash ?? (item ? undefined : data.sandboxAliases[hash]);
    if (target === undefined) return hash;
    hash = target;
  }
  throw new Error(`Cyclic tooltip alias at ${hash}`);
}

export function tooltipFor(hash: number, data: EditorData): Tooltip {
  return data.bundle.tooltips[hash] ?? { hash, text: {}, associated: [] };
}

export function itemFor(hash: number, data: EditorData): Item | undefined {
  const item = data.items[hash];
  if (item) return item;
  const custom = data.bundle.tooltips[hash]?.custom;
  if (!custom) return undefined;
  return { hash, ...custom, icon: '', inGameDescription: '' };
}

const variants = new WeakMap<EditorData, Map<number, number[]>>();
export function variantHashes(hash: number, data: EditorData): number[] {
  let index = variants.get(data);
  if (!index) {
    index = new Map<number, number[]>();
    for (const item of Object.values(data.items)) {
      const base = item.baseHash ?? item.hash;
      const hashes = index.get(base) ?? [base];
      hashes.push(
        item.hash,
        ...(item.enhancedHashes ?? []),
        ...(item.enhancedHash === undefined ? [] : [item.enhancedHash]),
      );
      index.set(base, hashes);
    }
    for (const [base, hashes] of index) index.set(base, [...new Set(hashes)]);
    variants.set(data, index);
  }
  return index.get(hash) ?? [hash];
}

export interface CategorySection extends Category {
  items: Item[];
}
export interface CategoryGroup {
  name: string;
  sections: CategorySection[];
}

export function navigationGroups(data: EditorData, query: string): CategoryGroup[] {
  const search = query.trim().toLocaleLowerCase();
  const matchingAliases = new Set<number>();
  if (search) {
    for (const [alias, target] of Object.entries(data.sandboxAliases)) {
      if (alias.includes(search)) matchingAliases.add(canonicalHash(target, data));
    }
  }
  const items = Object.values(data.items)
    .concat(
      Object.values(data.bundle.tooltips)
        .filter((tooltip) => !data.items[tooltip.hash] && tooltip.custom)
        .map((tooltip) => itemFor(tooltip.hash, data)!),
    )
    .filter(
      (item) =>
        item.baseHash === undefined &&
        (!search ||
          item.name.toLocaleLowerCase().includes(search) ||
          variantHashes(item.hash, data).some(
            (hash) =>
              String(hash).includes(search) ||
              data.items[hash]?.name.toLocaleLowerCase().includes(search),
          ) ||
          matchingAliases.has(item.hash)),
    );
  const categories = [...data.categories];
  for (const item of items) {
    if (!categories.some((category) => category.id === item.categoryId)) {
      categories.push({ id: item.categoryId, label: item.categoryId, group: 'Other', order: 9999 });
    }
  }
  const groups = new Map<string, CategoryGroup>();
  for (const category of categories.sort((a, b) => a.order - b.order)) {
    const entries = items
      .filter((item) => item.categoryId === category.id)
      .sort((a, b) => a.name.localeCompare(b.name) || a.hash - b.hash);
    if (!entries.length) continue;
    const group = groups.get(category.group) ?? { name: category.group, sections: [] };
    group.sections.push({ ...category, items: entries });
    groups.set(category.group, group);
  }
  return [...groups.values()];
}
