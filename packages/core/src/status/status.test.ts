import { describe, expect, it } from 'vitest';
import { exportLegacy, translationMaxAge, type LegacyEntry } from '../exportLegacy.js';
import type { Tooltip } from '../schemas.js';
import { bungieDrift, outdatedTranslations } from './index.js';

const source = '2026-01-01T00:00:00.000Z';
function tooltip(hash: number, age = 1): Tooltip {
  return {
    hash,
    associated: [],
    text: {
      en: {
        text: 'English',
        updatedAt: new Date(Date.parse(source) + age).toISOString(),
        updatedBy: 'e',
      },
      de: { text: 'Deutsch', updatedAt: source, updatedBy: 'd', sourceUpdatedAt: source },
    },
  };
}

describe('Bungie drift', () => {
  it('compares exact manifest text, counts missing snapshots and ignores absent manifest records', () => {
    const same = { ...tooltip(1), bungieSnapshot: { description: '', snapshotAt: source } };
    const changed = { ...tooltip(2), bungieSnapshot: { description: 'old', snapshotAt: source } };
    expect(
      bungieDrift([same, changed, tooltip(3), tooltip(4)], {
        1: { inGameDescription: '' },
        2: { inGameDescription: 'new' },
        3: { inGameDescription: 'no snapshot' },
      }),
    ).toEqual({ changed: [{ tooltip: changed, description: 'new' }], missingSnapshots: 1 });
  });

  it('does not count frame or sandbox aliases independently', () => {
    expect(
      bungieDrift(
        [tooltip(1), tooltip(2)],
        {
          1: { inGameDescription: 'one' },
          2: { inGameDescription: 'two' },
        },
        { 2: { to: 1, kind: 'frame' } },
      ).missingSnapshots,
    ).toBe(1);
  });
});

describe('outdated translations', () => {
  it('matches export at the exact 90-day boundary and beyond, independent of wall-clock time', () => {
    const exact = tooltip(1, translationMaxAge);
    const over = tooltip(2, translationMaxAge + 1);
    const entries = outdatedTranslations([exact, over]);
    expect(entries.map((entry) => [entry.tooltip.hash, entry.exportedInEnglish])).toEqual([
      [2, true],
      [1, false],
    ]);
    const exported = exportLegacy([exact, over], Date.parse('2030-01-01T00:00:00.000Z')) as Record<string, LegacyEntry>;
    expect(exported[1].editor.de?.main).toBe('Deutsch');
    expect(exported[2].editor.de?.main).toBe('English');
  });

  it('ignores equal/newer/unknown source revisions and missing English', () => {
    const unknown = tooltip(3);
    delete unknown.text.de?.sourceUpdatedAt;
    const noEnglish = tooltip(4);
    delete noEnglish.text.en;
    expect(outdatedTranslations([tooltip(1, 0), tooltip(2, -1), unknown, noEnglish])).toEqual([]);
  });

  it('filters assigned languages, ignores aliases, and sorts oldest first with stable ties', () => {
    const values = [tooltip(4, 20), tooltip(3, 10), tooltip(2, 20), tooltip(1, 30)];
    expect(
      outdatedTranslations(values, ['de'], { 1: { to: 2, kind: 'sandbox' } }).map(
        (entry) => entry.tooltip.hash,
      ),
    ).toEqual([2, 4, 3]);
    expect(outdatedTranslations(values, ['en', 'fr'])).toEqual([]);
  });
});
