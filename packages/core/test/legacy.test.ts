import { expect, test } from 'vitest';
import { legacyDatabaseSchema } from '../src/legacy.js';
import { database, fixture } from './helpers.js';

test.each(['intermediate', 'live'])('inventories every %s field without stripping data', (name) => {
  expect(database(name)).toEqual(fixture(name));
  expect(Object.keys(database(name).perks)).toHaveLength(2761);
});
test('rejects mismatched record hashes and unexpected authored fields', () => {
  const data = database('intermediate');
  data.perks['0'].hash = 10;
  expect(legacyDatabaseSchema.safeParse(data).success).toBe(false);
  expect(legacyDatabaseSchema.safeParse({
    ...data, surprise: true,
  }).success).toBe(false);
});
