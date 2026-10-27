import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Tooltip } from '@clarity/core';
import type { Me } from '../../api';
import type { Item } from '../../generator';
import { enrichTooltip, saveEnrichers } from './index';

const en = { text: 'English', updatedAt: '2026-01-01T00:00:00.000Z', updatedBy: 'original' };
const fr = {
  text: 'French',
  updatedAt: '2026-01-02T00:00:00.000Z',
  updatedBy: 'translator',
  sourceUpdatedAt: en.updatedAt,
};
const before: Tooltip = { hash: 10, text: { en, fr }, associated: [] };
const user: Me = { id: 1, login: 'current', role: 'editor' };
const item: Item = {
  hash: 10,
  name: 'Perk',
  icon: '',
  categoryId: 'perk',
  inGameDescription: 'Manifest',
};
const now = '2026-10-27T13:00:00.000Z';

afterEach(() => vi.useRealTimers());
describe('save enrichers', () => {
  it('stamps changed English, leaving every translation byte-for-byte unchanged', async () => {
    vi.useFakeTimers().setSystemTime(new Date(now));
    const next = { ...before, text: { ...before.text, en: { ...en, text: 'New English' } } };
    const enriched = await enrichTooltip({ before, next, user, item });
    expect(enriched.text.en).toEqual({
      ...en,
      text: 'New English',
      updatedAt: now,
      updatedBy: user.login,
    });
    expect(enriched.text.fr).toBe(fr);
    expect(enriched.bungieSnapshot).toEqual({ description: 'Manifest', snapshotAt: now });
    expect(before.text.en).toBe(en);
  });
  it('stamps changed translations against the current English revision', async () => {
    vi.useFakeTimers().setSystemTime(new Date(now));
    const next = { ...before, text: { ...before.text, fr: { ...fr, text: 'New French' } } };
    const enriched = await enrichTooltip({ before, next, user });
    expect(enriched.text.en).toBe(en);
    expect(enriched.text.fr).toEqual({
      text: 'New French',
      updatedAt: now,
      updatedBy: 'current',
      sourceUpdatedAt: en.updatedAt,
    });
  });
  it('uses the newly stamped English when both languages change in one save', async () => {
    vi.useFakeTimers().setSystemTime(new Date(now));
    const next = {
      ...before,
      text: { en: { ...en, text: 'New' }, fr: { ...fr, text: 'Nouveau' } },
    };
    expect((await enrichTooltip({ before, next, user })).text.fr?.sourceUpdatedAt).toBe(now);
  });
  it('does not stamp text metadata for snapshot-only saves', async () => {
    const result = await enrichTooltip({
      before,
      next: {
        ...before,
        bungieSnapshot: { description: 'Manifest', snapshotAt: now },
      },
      user,
      item,
    });
    expect(result.text).toEqual(before.text);
    expect(result.bungieSnapshot?.description).toBe('Manifest');
  });
  it('leaves snapshots untouched for translation-only edits, for every role', async () => {
    const snapshot = { description: 'Old manifest', snapshotAt: en.updatedAt };
    const original = { ...before, bungieSnapshot: snapshot };
    const next = { ...original, text: { ...original.text, fr: { ...fr, text: 'Nouveau' } } };
    for (const role of ['editor', 'maintainer', 'trial', 'translator'] as const) {
      const result = await enrichTooltip({ before: original, next, user: { ...user, role }, item });
      expect(result.bungieSnapshot).toBe(snapshot);
    }
  });
  it('retains current author metadata when restoring identical text from history', async () => {
    const next = { ...before, text: { ...before.text, en: { ...en, updatedBy: 'older-author' } } };
    expect((await enrichTooltip({ before, next, user })).text.en).toBe(en);
  });
  it('supports new tooltips and rejects a translation without an English revision', async () => {
    vi.useFakeTimers().setSystemTime(new Date(now));
    expect(
      (await enrichTooltip({ before: undefined, next: before, user })).text.en?.updatedAt,
    ).toBe(now);
    await expect(
      enrichTooltip({ before: undefined, next: { ...before, text: { fr } }, user }),
    ).rejects.toThrow('English source');
  });
  it('runs extensions sequentially and propagates errors rather than saving partial enrichment', async () => {
    const first = vi.fn(async ({ next }: { next: Tooltip }) => ({ ...next, associated: [20] }));
    const second = vi.fn(async ({ next }: { next: Tooltip }) => {
      expect(next.associated).toEqual([20]);
      throw new Error('snapshot unavailable');
    });
    saveEnrichers.push(first, second);
    try {
      await expect(enrichTooltip({ before, next: before, user })).rejects.toThrow(
        'snapshot unavailable',
      );
      expect(first).toHaveBeenCalledOnce();
    } finally {
      saveEnrichers.splice(-2);
    }
  });
});
