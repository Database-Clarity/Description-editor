import { expect, test } from 'vitest';
import { exportLegacy, translationMaxAge } from '../src/exportLegacy.js';
import { migrateLegacy } from '../src/migrateLegacy.js';
import { database, tooltip } from './helpers.js';

test('exports main into both editor fields, including explicitly empty text', () => {
  const value = tooltip();
  value.text.de = { ...value.text.en!, text: '' };
  const result = exportLegacy([value], 123);
  expect(result['42'].editor).toEqual({
    en: { main: 'English', secondary: 'English' }, de: { main: '', secondary: '' },
  });
  expect(result['42'].lastUpload).toBe(123);
});
test.each([
  [translationMaxAge - 1, 'Deutsch'],
  [translationMaxAge, 'Deutsch'],
  [translationMaxAge + 1, 'English'],
])('fallback compares English-source age precisely at %i ms', (age, expected) => {
  const value = tooltip();
  const englishTime = Date.parse(value.text.en!.updatedAt);
  value.text.de = {
    text: 'Deutsch', updatedBy: 'bob', updatedAt: value.text.en!.updatedAt,
    sourceUpdatedAt: new Date(englishTime - age).toISOString(),
  };
  const exported = exportLegacy([value], englishTime);
  expect(exported['42'].editor.de).toEqual({ main: expected, secondary: expected });
  if (expected === 'English') {
    expect(exported['42'].updateTracker?.descriptions.de?.updatedBy).toBe('alice');
  }
});
test('unknown source age or missing English never discards translation', () => {
  const value = tooltip();
  value.text.de = { ...value.text.en!, text: 'Deutsch' };
  expect(exportLegacy([value], 0)['42'].editor.de?.main).toBe('Deutsch');
  delete value.text.en;
  value.text.de.sourceUpdatedAt = '1970-01-01T00:00:00Z';
  expect(exportLegacy([value], 0)['42'].editor.de?.main).toBe('Deutsch');
});
test('catalog restores manifest facts without storing them in Tooltip', () => {
  expect(exportLegacy([tooltip()], 0, {
    '42': { name: 'Perk', type: 'Weapon Perk', itemHash: 12, itemName: 'Weapon' },
  })['42']).toMatchObject({ name: 'Perk', type: 'Weapon Perk', itemHash: 12, itemName: 'Weapon' });
  expect(() => exportLegacy([tooltip()], 0, {})).toThrow('Missing manifest facts');
});
test('rejects duplicate hashes and invalid export times', () => {
  expect(() => exportLegacy([tooltip(), tooltip()], 0)).toThrow('Duplicate');
  for (const now of [-1, NaN, Infinity, 1.5]) expect(() => exportLegacy([], now)).toThrow();
});
test('preserves historical tracker authorship even when that language has no editor text', () => {
  const value = tooltip();
  value.legacy = {
    updateTracker: { descriptions: { ko: { lastUpdate: 1000, updatedBy: 'translator' } } },
  };
  expect(exportLegacy([value], 0)['42'].updateTracker?.descriptions.ko).toEqual({
    lastUpdate: 1000, updatedBy: 'translator',
  });
  expect(exportLegacy([value], 0)['42'].editor.ko).toBeUndefined();
});
test('all legacy stat fields and tracker credits are omitted from export', () => {
  const source = database('live');
  const perk = source.perks['0'];
  perk.stats = { Damage: [{ active: { stat: [10] } }] };
  perk.importStatsFrom = 123;
  perk.duration = [2, 5];
  perk.activationCondition = 'On hit';
  perk.updateTracker = {
    descriptions: { en: { lastUpdate: 1000, updatedBy: 'author' } },
    stats: { lastUpdate: 2000, updatedBy: 'stat-author' },
  };
  const result = exportLegacy(migrateLegacy(source), 0);
  for (const entry of Object.values(result)) {
    for (const field of ['stats', 'importStatsFrom', 'duration', 'activationCondition']) {
      expect(entry).not.toHaveProperty(field);
    }
    expect(entry.updateTracker).not.toHaveProperty('stats');
  }
  expect(result['0'].updateTracker?.descriptions.en?.updatedBy).toBe('author');
});
