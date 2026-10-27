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
test('export emits shared text under every alias while preserving each frame manifest identity', () => {
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
  expect(entries[43]).toMatchObject({
    hash: 43,
    name: 'Enhanced',
    type: 'Weapon Frame Enhanced',
    itemHash: 100,
  });
  expect(entries[44].editor).toEqual(entries[42].editor);
  expect(entries[43].editor).toEqual(entries[42].editor);
  const withoutOwner = exportLegacy(
    [tooltip()],
    0,
    {
      42: { name: 'Base', type: 'Weapon Frame Exotic', itemHash: 100, itemName: 'Exotic weapon' },
      43: { name: 'Shared', type: 'Weapon Frame' },
    },
    aliases,
  );
  expect(withoutOwner[43]).not.toHaveProperty('itemHash');
  expect(withoutOwner[43]).not.toHaveProperty('itemName');
  expect(() => exportLegacy([{ ...tooltip(), hash: 43 }], 0, undefined, aliases)).toThrow(
    'own tooltip',
  );
  expect(() =>
    exportLegacy([tooltip()], 0, { 42: { name: 'Base', type: 'Weapon Frame' } }, aliases),
  ).toThrow('Missing manifest facts for frame alias');
});
