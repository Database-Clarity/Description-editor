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
test('key order does not affect hash, association order does; authored changes do', async () => {
  const a = { ...tooltip(), associated: [9, 2] };
  const b = { associated: [9, 2], text: a.text, hash: a.hash };
  expect(await contentHash(a)).toBe(await contentHash(b));
  expect(await contentHash({ ...a, associated: [2, 9] })).not.toBe(await contentHash(a));
  expect(await contentHash({ ...a, custom: { name: 'Verb', categoryId: 'verbs' } })).not.toBe(await contentHash(a));
  expect(a.associated).toEqual([9, 2]);
});
test('empty and single-element associations hash as before order became meaningful', async () => {
  expect(await contentHash({ ...tooltip(), associated: [] })).toBe(
    'd67dfe37b2c03f4560f17b2b0278018b0a373f08189dba8fddbd0f1dd43791e3',
  );
  expect(await contentHash({ ...tooltip(), associated: [7] })).toBe(
    'b1deab1a7b2c51698c0c09dee337eebf9368ad9dbf4e1c576dbba720aece3969',
  );
});
