import { createHash } from 'node:crypto';
import { expect, test } from 'vitest';
import { contentHash, stableStringify } from '../src/contentHash.js';
import { tooltip } from './helpers.js';

test('stable JSON sorts nested keys, preserves arrays and omits optional undefined', () => {
  expect(stableStringify({ z: [{ b: 2, a: 1 }], a: undefined })).toBe('{"z":[{"a":1,"b":2}]}');
  for (const value of [Infinity, NaN, undefined, new Date(), () => 1]) {
    expect(() => stableStringify(value)).toThrow(TypeError);
  }
});
test('Web Crypto SHA-256 matches a reference implementation', async () => {
  const value = tooltip();
  expect(await contentHash(value)).toBe(createHash('sha256').update(stableStringify(value)).digest('hex'));
  expect(await contentHash(value)).toMatch(/^[a-f0-9]{64}$/);
});
test('key order and associated set order do not affect hash; authored changes do', async () => {
  const a = { ...tooltip(), associated: [9, 2] };
  const b = { associated: [2, 9], text: a.text, hash: a.hash };
  expect(await contentHash(a)).toBe(await contentHash(b));
  expect(await contentHash({ ...a, activationCondition: 'On hit' })).not.toBe(await contentHash(a));
  expect(a.associated).toEqual([9, 2]);
});
