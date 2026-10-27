import { expect, test } from 'vitest';
import type { Aliases, Tooltip } from '@clarity/core';
import { conflictNotes, foldFrames } from './foldFrames.js';

const aliases: Aliases = {
  20: { to: 10, kind: 'frame' },
  30: { to: 10, kind: 'frame' },
  99: { to: 20, kind: 'sandbox' },
};
function tooltip(hash: number, text: string, day: number): Tooltip {
  return {
    hash,
    associated: [],
    text: { en: { text, updatedAt: `2026-10-${day}T00:00:00Z`, updatedBy: `author${hash}` } },
  };
}
test('equal texts keep canonical credits, remove aliases/markers, preserve other tooltips', () => {
  const source = [tooltip(10, 'same', 10), tooltip(20, 'same', 20), tooltip(40, 'other', 15)];
  source[1].associated = [99, 40];
  const result = foldFrames(source, aliases, { 10: 'a'.repeat(64), 20: 'b'.repeat(64) }, {});
  expect(result.tooltips.map((value) => value.hash)).toEqual([10, 40]);
  expect(result.tooltips[0].text.en?.updatedBy).toBe('author10');
  expect(result.tooltips[0].associated).toEqual([10, 40]);
  expect(result.pushed).toEqual({});
  expect(result.conflicts).toEqual([]);
  expect(source[1].associated).toEqual([99, 40]);
});
test('different texts choose latest per language and archive every replaced version losslessly', () => {
  const canonical = tooltip(10, 'old\n``` & text', 10);
  const newer = tooltip(20, 'new', 20);
  canonical.text.de = { ...canonical.text.en!, text: 'Deutsch', updatedAt: '2026-10-25T00:00:00Z' };
  newer.text.de = { ...newer.text.en!, text: 'alt' };
  const result = foldFrames(
    [canonical, newer, tooltip(30, 'middle', 15)],
    aliases,
    {},
    { 10: { name: 'Frame' } },
  );
  expect(result.tooltips[0].text.en).toEqual(newer.text.en);
  expect(result.tooltips[0].text.de).toEqual(canonical.text.de);
  expect(result.conflicts.map((value) => [value.hash, value.language])).toEqual([
    [30, 'en'],
    [10, 'en'],
    [20, 'de'],
  ]);
  expect(conflictNotes(result.conflicts)).toContain(JSON.stringify(canonical.text.en!.text));
  expect(conflictNotes(result.conflicts)).toContain('author10');
});
test('missing canonical is created and equal-time conflicts prefer canonical then lowest hash', () => {
  expect(foldFrames([tooltip(20, 'only', 20)], aliases, {}, {}).tooltips[0]).toMatchObject({
    hash: 10,
    text: { en: { text: 'only' } },
  });
  const result = foldFrames(
    [tooltip(20, 'other', 20), tooltip(10, 'canonical', 20)],
    aliases,
    {},
    {},
  );
  expect(result.tooltips[0].text.en?.text).toBe('canonical');
});
test('fold is idempotent and rejects cycles', () => {
  const result = foldFrames([tooltip(10, 'one', 10), tooltip(20, 'two', 20)], aliases, {}, {});
  expect(foldFrames(result.tooltips, aliases, result.pushed, {}).tooltips).toEqual(result.tooltips);
  expect(() =>
    foldFrames([], { 10: { to: 20, kind: 'frame' }, 20: { to: 10, kind: 'frame' } }, {}, {}),
  ).toThrow('Cyclic');
});
