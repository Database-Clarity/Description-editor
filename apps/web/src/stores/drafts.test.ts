import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
import type { Tooltip } from '@clarity/core';
import { createDraftStore } from './drafts';
import {
  createIndexedDbStorage,
  draftStorage,
  draftsSchema,
  type Drafts,
  type DraftStorage,
} from '../services/draftStorage';

const base: Tooltip = {
  hash: 10,
  text: { en: { text: 'Original', updatedAt: '2026-10-01T00:00:00Z', updatedBy: 'owner' } },
  associated: [],
};
function memory(): DraftStorage {
  let value: Drafts = {};
  return {
    async read() {
      return structuredClone(value);
    },
    async write(drafts) {
      value = structuredClone(drafts);
    },
  };
}

describe('local drafts', () => {
  it('persists association-only drafts, preserves the base and retains them when text is undone', async () => {
    const storage = memory();
    const store = createDraftStore(storage);
    expect(() => store.getState().updateDraft(base, (next) => next)).toThrow('recovery');
    await store.getState().hydrate();
    store.getState().updateDraft(base, (next) => ({ ...next, associated: [30, 20] }));
    store.getState().edit(base, 'en', 'Changed', 'alice');
    store.getState().edit(base, 'en', 'Original', 'alice');
    await store.getState().flush();
    const recovered = createDraftStore(storage);
    await recovered.getState().hydrate();
    expect(recovered.getState().drafts[10]).toEqual({
      base,
      next: { ...base, associated: [30, 20] },
    });
    store
      .getState()
      .updateDraft({ ...base, associated: [99] }, (next) => ({ ...next, associated: [] }));
    expect(store.getState().drafts).toEqual({});
    expect(() => store.getState().updateDraft(base, (next) => ({ ...next, hash: 11 }))).toThrow(
      'hash',
    );
    await store.getState().flush();
  });
  it('recovers drafts from IndexedDB after recreating the store and supports discard', async () => {
    const first = createDraftStore(draftStorage);
    await first.getState().hydrate();
    first.getState().edit(base, 'en', 'Local edit', 'alice');
    await first.getState().flush();
    const second = createDraftStore(draftStorage);
    await second.getState().hydrate();
    expect(second.getState().drafts[10]).toMatchObject({
      base,
      next: { text: { en: { text: 'Local edit' } } },
    });
    second.getState().discard(10);
    await second.getState().flush();
    const third = createDraftStore(draftStorage);
    await third.getState().hydrate();
    expect(third.getState().drafts).toEqual({});
  });
  it('keeps the original base when server data changes and serializes rapid writes', async () => {
    const storage = memory();
    const store = createDraftStore(storage);
    await store.getState().hydrate();
    store.getState().edit(base, 'en', 'one', 'alice');
    store.getState().edit({ ...base, associated: [30] }, 'en', 'two', 'alice');
    await store.getState().flush();
    const saved = await storage.read();
    expect(saved[10].base).toEqual(base);
    expect(saved[10].next.text.en?.text).toBe('two');
    expect(store.getState().pending).toBe(0);
  });
  it('blocks editing before recovery and never overwrites unread drafts after a read failure', async () => {
    const write = vi.fn();
    const store = createDraftStore({ read: () => Promise.reject(new Error('blocked')), write });
    expect(() => store.getState().edit(base, 'en', 'oops', '')).toThrow('recovery');
    await store.getState().hydrate();
    expect(store.getState().hydrated).toBe(false);
    expect(store.getState().error).toContain('blocked');
    expect(write).not.toHaveBeenCalled();
  });
  it('retains memory and visibly reports write failure, then retries', async () => {
    const write = vi.fn().mockRejectedValueOnce(new Error('quota')).mockResolvedValue(undefined);
    const store = createDraftStore({ read: async () => ({}), write });
    await store.getState().hydrate();
    store.getState().edit(base, 'en', 'Do not lose this', '');
    await store.getState().flush();
    expect(store.getState().error).toContain('quota');
    expect(store.getState().drafts[10].next.text.en?.text).toBe('Do not lose this');
    store.getState().retry();
    await store.getState().flush();
    expect(store.getState().error).toBeNull();
  });
  it('restores base metadata when reverting a language while retaining other language edits', async () => {
    const store = createDraftStore(memory());
    await store.getState().hydrate();
    store.getState().edit(base, 'en', 'Changed', 'alice');
    store.getState().edit(base, 'de', 'Deutsch', 'alice');
    store.getState().edit(base, 'en', 'Original', 'alice');
    expect(store.getState().drafts[10].next.text.en).toEqual(base.text.en);
    store.getState().edit(base, 'de', '', 'alice');
    expect(store.getState().drafts).toEqual({});
    await store.getState().flush();
  });
  it('rejects corrupt/mismatched stored drafts with the core schema', () => {
    expect(draftsSchema.safeParse({ 11: { base, next: base } }).success).toBe(false);
    expect(
      draftsSchema.safeParse({ 10: { base, next: { ...base, text: { xx: {} } } } }).success,
    ).toBe(false);
  });
  it('refuses to overwrite drafts changed by another tab', async () => {
    const first = createIndexedDbStorage();
    const second = createIndexedDbStorage();
    await first.read();
    await second.read();
    await first.write({ 10: { base, next: base } });
    await expect(second.write({})).rejects.toThrow('Another tab');
    expect(await first.read()).toEqual({ 10: { base, next: base } });
    await first.write({});
  });
});
