import { expect, test } from 'vitest';
import { merge3 } from '../src/merge3.js';
import { tooltip } from './helpers.js';

test('independent language and atomic-field edits merge without mutating input', () => {
  const base = tooltip();
  const head = structuredClone(base);
  const next = structuredClone(base);
  head.text.de = { ...head.text.en!, text: 'Deutsch' };
  next.text.en!.text = 'Changed';
  next.importStatsFrom = 100;
  const original = structuredClone([base, head, next]);
  expect(merge3(base, head, next)).toEqual({
    ok: true, merged: { ...next, text: { ...next.text, de: head.text.de } },
  });
  expect([base, head, next]).toEqual(original);
});
test('identical edits and unchanged branches merge', () => {
  const base = tooltip();
  const head = { ...tooltip(), duration: [5] };
  expect(merge3(base, head, head)).toEqual({ ok: true, merged: head });
  expect(merge3(base, head, base)).toEqual({ ok: true, merged: head });
  expect(merge3(base, base, head)).toEqual({ ok: true, merged: head });
});
test('reports all same-language and atomic conflicts, not partial success', () => {
  const base = tooltip();
  const head = structuredClone(base);
  const next = structuredClone(base);
  head.text.en!.text = 'Theirs';
  next.text.en!.text = 'Mine';
  head.stats = { Damage: [{ active: { stat: [1] } }] };
  next.stats = { Damage: [{ active: { stat: [2] } }] };
  const result = merge3(base, head, next);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.conflicts.map((conflict) => conflict.field).sort()).toEqual(['stats', 'text.en']);
  expect(result).not.toHaveProperty('merged');
});
test('association additions union and removals win for existing members', () => {
  const base = { ...tooltip(), associated: [1, 2] };
  const head = { ...base, associated: [2, 3] };
  const next = { ...base, associated: [1, 4] };
  expect(merge3(base, head, next)).toEqual({
    ok: true, merged: { ...base, associated: [3, 4] },
  });
});
test('deletion merges with unchanged but conflicts with editing the deleted field', () => {
  const base = { ...tooltip(), duration: [5] };
  const head = tooltip();
  expect(merge3(base, head, base)).toEqual({ ok: true, merged: head });
  expect(merge3(base, head, { ...base, duration: [10] }).ok).toBe(false);
  const removedLanguage = { ...base, text: {} };
  expect(merge3(base, removedLanguage, base).ok).toBe(true);
  const edited = structuredClone(base);
  edited.text.en!.text = 'new';
  expect(merge3(base, removedLanguage, edited).ok).toBe(false);
});
test('rejects cross-tooltip merges', () => {
  expect(() => merge3(tooltip(), tooltip(), { ...tooltip(), hash: 99 })).toThrow('different tooltip');
});
