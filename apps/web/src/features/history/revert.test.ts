import { describe, expect, it } from 'vitest';
import { type Tooltip } from '@clarity/core';
import { revertDraft } from './revert';

const current: Tooltip = {
  hash: 123,
  text: {
    en: { text: 'Current', updatedAt: '2026-10-01T00:00:00Z', updatedBy: 'alice' },
    de: { text: 'Aktuell', updatedAt: '2026-10-01T00:00:00Z', updatedBy: 'bob' },
    fr: { text: 'Courant', updatedAt: '2026-10-01T00:00:00Z', updatedBy: 'carol' },
  },
  associated: [456],
};
const version: Tooltip = {
  hash: 123,
  text: { en: { text: 'Old', updatedAt: '2025-01-01T00:00:00Z', updatedBy: 'dan' } },
  associated: [],
};
describe('history draft restoration', () => {
  it('restores a full version for editors without mutating either input', () => {
    const result = revertDraft(current, version, { id: 1, login: 'alice', role: 'editor' });
    expect(result).toEqual(version);
    expect(result).not.toBe(version);
    expect(current.associated).toEqual([456]);
  });
  it('restores only assigned translator languages, including absent historical text', () => {
    const result = revertDraft(current, version, {
      id: 2,
      login: 'bob',
      role: 'translator',
      languages: ['de'],
    });
    expect(result.text.de).toBeUndefined();
    expect(result.text.en).toEqual(current.text.en);
    expect(result.text.fr).toEqual(current.text.fr);
    expect(result.associated).toEqual(current.associated);
  });
  it('rejects users without permissions and versions for another hash', () => {
    expect(() => revertDraft(current, version, { id: 1, login: 'x', role: null })).toThrow(
      'permission',
    );
    expect(() =>
      revertDraft(current, { ...version, hash: 456 }, { id: 1, login: 'x', role: 'editor' }),
    ).toThrow('different tooltip');
  });
});
