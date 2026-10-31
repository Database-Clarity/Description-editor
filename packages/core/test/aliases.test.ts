import { expect, test } from 'vitest';
import { aliasesSchema, exportLegacy, resolveAlias, type Aliases } from '../src/index.js';
import { tooltip } from './helpers.js';

const aliases: Aliases = {
  43: { to: 42, kind: 'frame' },
  44: { to: 43, kind: 'sandbox' },
};
test('generic aliases validate and resolve transitively without changing unrelated hashes', () => {
  expect(aliasesSchema.parse(aliases)).toEqual(aliases);
  expect(resolveAlias(44, aliases)).toBe(42);
  expect(resolveAlias(123, aliases)).toBe(123);
  expect(() => aliasesSchema.parse({ 1: { to: 2, kind: 'unknown' } })).toThrow();
  expect(() =>
    resolveAlias(1, { 1: { to: 2, kind: 'frame' }, 2: { to: 1, kind: 'frame' } }),
  ).toThrow('Cyclic');
});
test('export emits reference stubs for every alias, keeping only the alias own manifest facts', () => {
  const entries = exportLegacy(
    [tooltip()],
    0,
    {
      42: { name: 'Base', type: 'Weapon Frame' },
      43: { name: 'Enhanced', type: 'Weapon Frame Enhanced', itemHash: 100 },
    },
    aliases,
  );
  expect(Object.keys(entries)).toEqual(['42', '43', '44']);
  expect(entries[43]).toEqual({
    hash: 43,
    aliasOf: 42,
    aliasKind: 'frame',
    name: 'Enhanced',
    type: 'Weapon Frame Enhanced',
    itemHash: 100,
  });
  // 44 -> 43 -> 42: stubs always point at the final canonical tooltip, and a sandbox alias
  // without catalog facts is a bare stub.
  expect(entries[44]).toEqual({ hash: 44, aliasOf: 42, aliasKind: 'sandbox' });
  expect(entries[42]).toHaveProperty('editor');
  expect(entries[42]).not.toHaveProperty('aliasOf');
  const withoutOwner = exportLegacy(
    [tooltip()],
    0,
    {
      42: { name: 'Base', type: 'Weapon Frame Exotic', itemHash: 100, itemName: 'Exotic weapon' },
      43: { name: 'Shared', type: 'Weapon Frame' },
    },
    aliases,
  );
  expect(withoutOwner[43]).toEqual({
    hash: 43,
    aliasOf: 42,
    aliasKind: 'frame',
    name: 'Shared',
    type: 'Weapon Frame',
  });
  expect(() => exportLegacy([{ ...tooltip(), hash: 43 }], 0, undefined, aliases)).toThrow(
    'own tooltip',
  );
  expect(() =>
    exportLegacy([tooltip()], 0, { 42: { name: 'Base', type: 'Weapon Frame' } }, aliases),
  ).toThrow('Missing manifest facts for frame alias');
});
test('sandbox alias stubs carry their own catalog facts when the catalog has them', () => {
  const entries = exportLegacy(
    [tooltip()],
    0,
    {
      42: { name: 'Base', type: 'Weapon Frame' },
      43: { name: 'Enhanced', type: 'Weapon Frame' },
      44: { name: 'Sandbox', type: 'Sandbox Perk', itemHash: 5, itemName: 'Item' },
    },
    aliases,
  );
  expect(entries[44]).toEqual({
    hash: 44,
    aliasOf: 42,
    aliasKind: 'sandbox',
    name: 'Sandbox',
    type: 'Sandbox Perk',
    itemHash: 5,
    itemName: 'Item',
  });
});
test('stubs omit editor text and every other canonical field; the canonical keeps the associated list', () => {
  const value = { ...tooltip(), associated: [300, 200, 43] };
  const entries = exportLegacy(
    [value],
    0,
    { 42: { name: 'Base', type: 'Weapon Frame' }, 43: { name: 'Enhanced', type: 'Weapon Frame' } },
    aliases,
  );
  expect(entries[42]).toHaveProperty('associated', [300, 200]);
  for (const hash of [43, 44]) {
    for (const field of ['editor', 'associated', 'updateTracker', 'lastUpload', 'uploadedBy']) {
      expect(entries[hash]).not.toHaveProperty(field);
    }
  }
});
test('canonical entries are unaffected by aliases', () => {
  const catalog = { 42: { name: 'Base', type: 'Weapon Frame' }, 43: { name: 'E', type: 'Weapon Frame' } };
  expect(exportLegacy([tooltip()], 7, catalog, aliases)[42]).toEqual(
    exportLegacy([tooltip()], 7, catalog)[42],
  );
});
