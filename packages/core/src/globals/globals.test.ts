import { describe, expect, it } from 'vitest';
import { buildGlobalUsageIndex, globalTooltipCount } from './index.js';
import { migrateLegacy } from '../migrateLegacy.js';
import { database } from '../../test/helpers.js';
import type { Tooltip } from '../schemas.js';

const text = (value: string) => ({
  text: value,
  updatedAt: '2026-01-01T00:00:00Z',
  updatedBy: 'test',
});
const tooltip = (hash: number, en: string, de?: string): Tooltip => ({
  hash,
  associated: [],
  text: { en: text(en), ...(de === undefined ? {} : { de: text(de) }) },
});

it('indexes exact parser variable/title names by tooltip, language and original line', () => {
  const entries = buildGlobalUsageIndex({
    2: tooltip(2, 'var damage = 10\nvar damage2 = 20', 'var damage = 12'),
    3: tooltip(3, 'title Solar Info (\nDetails\n)', 'title Solar Info (\nDetails DE\n)'),
    10: tooltip(
      10,
      '// #damage\n/* #damage\n#damage2 */\n#damage #damage\n<title Solar [Solar Info] />',
      '#damage\n#damage',
    ),
    11: tooltip(11, '#damage2\n<title Other [Not Global] />'),
  });
  const damage = entries.find((entry) => entry.name === 'damage')!;
  expect(damage.usages.map(({ hash, lang, line }) => ({ hash, lang, line }))).toEqual([
    { hash: 10, lang: 'en', line: 4 },
    { hash: 10, lang: 'de', line: 1 },
    { hash: 10, lang: 'de', line: 2 },
  ]);
  expect(globalTooltipCount([damage])).toBe(1);
  expect(entries.find((entry) => entry.name === 'damage2')?.usages).toHaveLength(1);
  expect(entries.find((entry) => entry.name === 'Solar Info')?.usages[0].line).toBe(5);
  expect(globalTooltipCount(entries)).toBe(2);
});

it('keeps unused and empty definitions, language-local availability and reusable references', () => {
  const entries = buildGlobalUsageIndex({
    2: tooltip(2, 'var empty = empty\nvar unused = 3'),
    3: tooltip(3, 'title Info (\n#unused\n)'),
    10: tooltip(10, 'export hidden Shared (\n#empty\n)', '#unused'),
  });
  expect(entries.find((entry) => entry.name === 'empty')?.definitions.en).toBe('');
  expect(entries.find((entry) => entry.name === 'empty')?.usages[0].line).toBe(2);
  expect(
    entries.find((entry) => entry.name === 'unused')?.usages.map((usage) => usage.hash),
  ).toEqual([3]);
  expect(entries.find((entry) => entry.name === 'Info')?.usages).toEqual([]);
});

describe.each(['live', 'intermediate'])('%s real fixture usage index', (source) => {
  it('finds known global references with exact source positions and unique tooltip counts', () => {
    const raw = database(source);
    const tooltips = Object.fromEntries(migrateLegacy(raw).map((entry) => [entry.hash, entry]));
    const entries = buildGlobalUsageIndex(tooltips);
    expect(entries.filter((entry) => entry.kind === 'variables').length).toBeGreaterThan(10);
    expect(entries.filter((entry) => entry.kind === 'titles').map((entry) => entry.name)).toEqual([
      'G_conegrowth',
      'G_refill',
    ]);
    expect(globalTooltipCount(entries)).toBeGreaterThan(100);
    for (const entry of entries) {
      for (const usage of entry.usages) {
        expect(
          raw.perks[usage.hash].editor[usage.lang]?.main.replace(/\r/g, '').split('\n')[
            usage.line - 1
          ],
        ).toBe(usage.source);
        expect(usage.source).toContain(
          entry.kind === 'variables' ? `#${entry.name}` : `[${entry.name}]`,
        );
      }
    }
  });
});
