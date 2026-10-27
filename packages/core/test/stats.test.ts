import { expect, test } from 'vitest';
import { statsSchema } from '../src/stats.js';
import { database } from './helpers.js';

test('precisely preserves the real legacy stat shape', () => {
  const stats = Object.values(database('live').perks).find((perk) => perk.stats)?.stats;
  expect(statsSchema.parse(stats)).toEqual({
    Ready: [{ passive: { multiplier: [0.9] } }],
    Stow: [{ passive: { multiplier: [0.9] } }],
  });
});
test('accepts all modifier fields and rejects unknown stats/weapon types', () => {
  expect(statsSchema.parse({
    Reload: [{ weaponTypes: ['AR'], active: { stat: [5], multiplier: [0.9] } }],
  }).Reload).toHaveLength(1);
  expect(statsSchema.safeParse({ Unknown: [] }).success).toBe(false);
  expect(statsSchema.safeParse({ Reload: [{ weaponTypes: ['invalid'] }] }).success).toBe(false);
  expect(statsSchema.safeParse({ Reload: [{ active: { stat: [Infinity] } }] }).success).toBe(false);
});
