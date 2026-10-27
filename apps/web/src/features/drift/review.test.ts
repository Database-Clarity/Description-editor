import { expect, it } from 'vitest';
import { publishableHash, type Tooltip } from '@clarity/core';
import { reviewedSnapshot } from './review';

it('changes only the Bungie snapshot, preserving all authored fields and edit metadata', async () => {
  const base: Tooltip = {
    hash: 123,
    associated: [456],
    text: {
      en: { text: 'Authored English', updatedAt: '2026-01-01T00:00:00Z', updatedBy: 'editor' },
      de: {
        text: 'German',
        updatedAt: '2026-01-02T00:00:00Z',
        updatedBy: 'translator',
        sourceUpdatedAt: '2026-01-01T00:00:00Z',
      },
    },
    bungieSnapshot: { description: 'before', snapshotAt: '2026-01-01T00:00:00Z' },
  };
  const next = reviewedSnapshot(base, 'after', '2026-02-01T00:00:00Z');
  expect(next).toEqual({
    ...base,
    bungieSnapshot: { description: 'after', snapshotAt: '2026-02-01T00:00:00Z' },
  });
  expect(next.text).toBe(base.text);
  expect(await publishableHash(next)).toBe(await publishableHash(base));
  expect(base.bungieSnapshot?.description).toBe('before');
});
