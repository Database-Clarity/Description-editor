import { expect, it, vi } from 'vitest';
import type { Tooltip } from '@clarity/core';
import { findTranslationSource } from './source';

function version(updatedAt: string, text = 'original English'): { tooltip: Tooltip } {
  return {
    tooltip: { hash: 1, associated: [], text: { en: { text, updatedAt, updatedBy: 'e' } } },
  };
}
const source = '2026-01-01T00:00:00.000Z';

it('searches paginated versions by English revision, not commit date or translation update date', async () => {
  const getHistory = vi
    .fn()
    .mockResolvedValueOnce({ commits: [{ commit: 'a' }] })
    .mockResolvedValueOnce({ commits: [{ commit: 'b' }] });
  const getVersion = vi
    .fn()
    .mockResolvedValueOnce(version('2026-02-01T00:00:00Z'))
    .mockResolvedValueOnce(version('2026-01-01T01:00:00+01:00'));
  expect(await findTranslationSource(1, source, { getHistory, getVersion })).toEqual({
    kind: 'found',
    text: 'original English',
  });
  expect(getHistory).toHaveBeenNthCalledWith(2, 1, 2, undefined);
});

it('reports missing revisions explicitly, including the bounded search limit', async () => {
  const getVersion = vi.fn();
  expect(
    await findTranslationSource(1, source, {
      getHistory: vi.fn().mockResolvedValue({ commits: [] }),
      getVersion,
    }),
  ).toMatchObject({ kind: 'missing', reason: expect.stringContaining('not found') });
  expect(getVersion).not.toHaveBeenCalled();
  const getHistory = vi.fn().mockResolvedValue({ commits: [{ commit: 'a' }] });
  getVersion.mockResolvedValue(version('2026-02-01T00:00:00Z'));
  expect(await findTranslationSource(1, source, { getHistory, getVersion })).toMatchObject({
    kind: 'missing',
    reason: expect.stringContaining('600'),
  });
  expect(getHistory).toHaveBeenCalledTimes(20);
  expect(getVersion).toHaveBeenCalledTimes(1);
});

it('propagates unavailable history instead of silently claiming no source exists', async () => {
  await expect(
    findTranslationSource(1, source, {
      getHistory: vi.fn().mockRejectedValue(new Error('HTTP 403')),
      getVersion: vi.fn(),
    }),
  ).rejects.toThrow('HTTP 403');
});
