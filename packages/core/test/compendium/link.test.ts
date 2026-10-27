import { expect, it } from 'vitest';
import { autoLinkCompendium } from '../../src/compendium/link.js';
import { normaliseCompendiumName } from '../../src/compendium/resolve.js';
import { publishableHash } from '../../src/publishableHash.js';
import type { CompendiumData } from '../../src/compendium/types.js';
const tooltip = {
  hash: 123,
  text: {
    en: {
      text: 'English',
      updatedAt: '2026-10-01T00:00:00Z',
      updatedBy: 'alice',
    },
  },
  associated: [],
};
const now = '2026-10-27T00:00:00Z';
const cell = {
  plain: 'Compendium styled cell',
  runs: [{ text: 'Compendium styled cell', color: '#6fa8dc' }],
};
const row = (name: string) => ({
  name,
  nameNorm: normaliseCompendiumName(name),
  rowIndex: 6,
  cell,
});
const data: CompendiumData = {
  fetchedAt: now,
  tabs: [
    {
      gid: '441434520',
      name: 'Exotic Weapons',
      rows: [row('Weapon name\nIntrinsic name\n↑Catalyst name')],
    },
  ],
};
it('links identifiers anywhere in a multiline name cell with metadata-only baselines', async () => {
  const result = autoLinkCompendium(
    tooltip,
    { 123: { hash: 123, name: 'Intrinsic name', categoryId: 'weapon-trait-exotic' } },
    {},
    data,
    now,
  );
  expect(result.reason).toBe('linked');
  expect(result.next?.compendium?.rowKey).toBe('Weapon name\nIntrinsic name\n↑Catalyst name');
  expect(await publishableHash(result.next!)).toBe(await publishableHash(tooltip));
});
it('uses aliases and base names without creating authored tooltips for alias hashes', () => {
  const items = {
    123: { hash: 123, name: 'Unknown', categoryId: 'weapon-trait-exotic' },
    999: { hash: 999, name: 'Intrinsic name', categoryId: 'weapon-trait-exotic' },
  };
  const aliases = { 999: { to: 123, kind: 'sandbox' as const } };
  expect(autoLinkCompendium(tooltip, items, aliases, data, now).reason).toBe('linked');
  expect(autoLinkCompendium({ ...tooltip, hash: 999 }, items, aliases, data, now).reason).toBe(
    'alias',
  );
});
it('never auto-links ambiguous or similarity-only matches and explains global/ghost exclusions', () => {
  const items = { 123: { hash: 123, name: 'Intrinsic name', categoryId: 'weapon-trait-exotic' } };
  expect(
    autoLinkCompendium(
      tooltip,
      items,
      {},
      { ...data, tabs: [{ ...data.tabs[0], rows: [...data.tabs[0].rows, ...data.tabs[0].rows] }] },
      now,
    ).reason,
  ).toBe('ambiguous');
  expect(
    autoLinkCompendium(tooltip, { 123: { ...items[123], name: 'Renamed' } }, {}, data, now).reason,
  ).toBe('unmatched');
  expect(autoLinkCompendium({ ...tooltip, hash: 2 }, {}, {}, data, now).reason).toBe(
    'no-equivalent',
  );
  expect(
    autoLinkCompendium(
      tooltip,
      { 123: { ...items[123], name: 'Other', categoryId: 'ghost-mod' } },
      {},
      data,
      now,
    ).reason,
  ).toBe('no-equivalent');
});
