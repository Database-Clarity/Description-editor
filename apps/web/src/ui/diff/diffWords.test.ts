import { describe, expect, it } from 'vitest';
import { diffWords } from './diffWords';

describe('word diff', () => {
  it('marks individual added/deleted words and preserves whitespace', () => {
    expect(diffWords('A slow perk.\n', 'A fast perk.\n')).toEqual([
      { kind: 'equal', text: 'A ' },
      { kind: 'delete', text: 'slow' },
      { kind: 'insert', text: 'fast' },
      { kind: 'equal', text: ' perk.\n' },
    ]);
  });
  it.each([
    ['', 'New text'],
    ['Removed', ''],
    ['Same', 'Same'],
    ['a b a', 'b a b'],
    ['日本語\n説明', '日本語\n新しい説明'],
    [
      Array.from({ length: 1500 }, (_, i) => `old${i}`).join(' '),
      Array.from({ length: 1500 }, (_, i) => `new${i}`).join(' '),
    ],
  ])('reconstructs both original documents exactly', (before, after) => {
    const result = diffWords(before, after);
    expect(
      result
        .filter((part) => part.kind !== 'insert')
        .map((part) => part.text)
        .join(''),
    ).toBe(before);
    expect(
      result
        .filter((part) => part.kind !== 'delete')
        .map((part) => part.text)
        .join(''),
    ).toBe(after);
  });
});
