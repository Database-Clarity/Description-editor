import { describe, expect, it } from 'vitest';
import type { Tooltip } from '@clarity/core';
import type { Change, SaveConflict } from '../../services/api';
import { conflictReducer, resolveConflicts } from './reducer';

const entry = (text: string) => ({
  text,
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedBy: text,
});
const base: Tooltip = {
  hash: 10,
  text: { en: entry('base'), fr: entry('fr base') },
  associated: [20],
};
const head: Tooltip = {
  ...base,
  text: { en: entry('theirs'), fr: entry('fr theirs') },
  associated: [20, 30],
};
const next: Tooltip = { ...base, text: { ...base.text, en: entry('mine') }, associated: [20, 40] };
const change: Change = { hash: 10, base, next };
const conflict: SaveConflict = { ...change, head, fields: ['text.en'] };

describe('conflict resolution', () => {
  it('records each choice independently and permits changing it', () => {
    let state = conflictReducer({}, { hash: 10, field: 'text.en', resolution: { choice: 'mine' } });
    state = conflictReducer(state, { hash: 11, field: 'custom', resolution: { choice: 'theirs' } });
    state = conflictReducer(state, {
      hash: 10,
      field: 'text.en',
      resolution: { choice: 'theirs' },
    });
    expect(state).toEqual({
      '10:text.en': { choice: 'theirs' },
      '11:custom': { choice: 'theirs' },
    });
  });
  it.each(['mine', 'theirs'] as const)(
    'uses %s, adopts head as base, and preserves automatic merges',
    (choice) => {
      const result = resolveConflicts([change], [conflict], { '10:text.en': { choice } });
      expect(result.changes[0].base).toEqual(head);
      expect(result.changes[0].next.text.en).toEqual(
        choice === 'mine' ? next.text.en : head.text.en,
      );
      expect(result.changes[0].next.text.fr).toEqual(head.text.fr);
      expect(result.changes[0].next.associated).toEqual([20, 30, 40]);
      expect(base.text.en?.text).toBe('base');
    },
  );
  it('accepts merged text without treating it as JSON or discarding metadata', () => {
    const result = resolveConflicts([change], [conflict], {
      '10:text.en': { choice: 'edit', text: 'merged' },
    });
    expect(result.changes[0].next.text.en).toEqual({ ...next.text.en, text: 'merged' });
  });
  it('requires an explicit choice for every conflicting field', () => {
    expect(() => resolveConflicts([change], [conflict], {})).toThrow('Choose a resolution');
  });
  it('validates edited non-text fields rather than sending invalid JSON/schema', () => {
    const c = {
      ...conflict,
      head: { ...base, custom: { name: 'Theirs', categoryId: 'test' } },
      next: { ...base, custom: { name: 'Mine', categoryId: 'test' } },
      fields: ['custom'],
    };
    expect(() =>
      resolveConflicts([change], [c], { '10:custom': { choice: 'edit', text: 'no' } }),
    ).toThrow();
    expect(() =>
      resolveConflicts([change], [c], { '10:custom': { choice: 'edit', text: '{"name":3}' } }),
    ).toThrow();
    expect(
      resolveConflicts([change], [c], {
        '10:custom': { choice: 'edit', text: '{"name":"Custom","categoryId":"test"}' },
      }).changes[0].next.custom?.name,
    ).toBe('Custom');
  });
  it('handles create races and server deletion without manufacturing a save', () => {
    const create = { ...conflict, base: null, fields: ['$exists'] };
    expect(
      resolveConflicts([{ ...change, base: null }], [create], {
        '10:$exists': { choice: 'mine' },
      }).changes[0],
    ).toMatchObject({ base: head, next });
    const deleted = { ...conflict, head: null, fields: ['$exists'] };
    expect(resolveConflicts([change], [deleted], { '10:$exists': { choice: 'theirs' } })).toEqual({
      changes: [],
      deleted: [10],
    });
    expect(
      resolveConflicts([change], [deleted], { '10:$exists': { choice: 'mine' } }).changes[0],
    ).toEqual({ hash: 10, base: null, next });
  });
  it('retains unrelated changes in a multi-tooltip save', () => {
    const other = { hash: 11, base: { ...base, hash: 11 }, next: { ...next, hash: 11 } };
    expect(
      resolveConflicts([change, other], [conflict], { '10:text.en': { choice: 'mine' } })
        .changes[1],
    ).toEqual(other);
  });
});
