import { expect, test } from 'vitest';
import { migrateLegacy } from '../src/migrateLegacy.js';
import { tooltipSchema } from '../src/schemas.js';
import { database } from './helpers.js';

test('migrates every real record; drops secondary and manifest facts', () => {
  const source = database('intermediate');
  const migrated = migrateLegacy(source);
  expect(migrated).toHaveLength(2761);
  for (const entry of migrated) {
    expect(tooltipSchema.safeParse(entry).success).toBe(true);
    expect(entry.text.en?.text).toBe(source.perks[entry.hash].editor.en?.main);
    expect(entry).not.toHaveProperty('name');
    expect(entry).not.toHaveProperty('itemHash');
    expect(entry).not.toHaveProperty('type');
    expect(JSON.stringify(entry)).not.toContain('"secondary":');
  }
  expect(migrated.find((entry) => entry.hash === 2)?.custom?.name).toBe('Global variables');
});
test('preserves authored optional fields and tracker authors without inventing provenance', () => {
  const source = database('intermediate');
  const perk = source.perks['42'] = { ...source.perks['0'], hash: 42 };
  perk.duration = [2, 5];
  perk.activationCondition = 'On hit';
  perk.stats = { Damage: [{ active: { stat: [10] } }] };
  perk.editor.de = { main: 'Deutsch', secondary: 'discard' };
  perk.updateTracker = {
    descriptions: {
      en: { lastUpdate: 1000, updatedBy: 'alice' },
      de: { lastUpdate: 2000, updatedBy: 'bob' },
    },
    stats: { lastUpdate: 3000, updatedBy: 'carol' },
  };
  const result = migrateLegacy(source).find((entry) => entry.hash === 42)!;
  expect(result).toMatchObject({
    duration: [2, 5], activationCondition: 'On hit', stats: perk.stats,
    text: {
      en: { updatedAt: '1970-01-01T00:00:01.000Z', updatedBy: 'alice' },
      de: { text: 'Deutsch', updatedAt: '1970-01-01T00:00:02.000Z', updatedBy: 'bob' },
    },
  });
  expect(result.text.de).not.toHaveProperty('sourceUpdatedAt');
  expect(result.legacy?.updateTracker?.stats).toEqual(perk.updateTracker.stats);
});
test('missing tracker dates use explicit epoch/empty author, not upload dates', () => {
  const source = database('intermediate');
  delete source.perks['0'].updateTracker;
  const result = migrateLegacy(source)[0];
  expect(result.text.en?.updatedAt).toBe('1970-01-01T00:00:00.000Z');
  expect(result.text.en?.updatedBy).toBe('');
});
