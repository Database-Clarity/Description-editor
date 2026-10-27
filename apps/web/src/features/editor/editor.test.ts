import { describe, expect, test } from 'vitest';
import { EditorState } from '@codemirror/state';
import { CompletionContext } from '@codemirror/autocomplete';
import { markupLanguage, type MarkupGlobals } from '@clarity/core';
import { clarityCompletions } from './completion';
import { formatMarkupTables } from './formatTable';

const globals: MarkupGlobals = {
  variables: 'var damage = 25\nvar duration = 10',
  titles: 'title Details (\nMore details\n)',
  imports: { '1': 'export hidden Shared (\nShared text\n)', '42': 'export Other (\nOther text\n)' },
};

function complete(text: string) {
  const state = EditorState.create({ doc: text });
  return clarityCompletions(globals)(new CompletionContext(state, text.length, true));
}

describe('shared parser symbols drive completion', () => {
  test.each([
    ['#da', '#damage'],
    ['var local = hello\n#lo', '#local'],
    ['<title More [De', 'Details'],
    ['import ', 'Shared'],
    ['import Shared from ', 'global'],
    ['import main from 4', '42'],
    ['<so', '<solar/>'],
    ['< weapon type (Sn', 'Sniper'],
  ])('%s offers %s', (text, label) => {
    expect(complete(text)?.options.map((option) => option.label)).toContain(label);
  });
  test('completion replaces only the active reference', () => {
    expect(complete('<title More [De')?.from).toBe('<title More ['.length);
    expect(complete('import main from 4')?.from).toBe('import main from '.length);
  });
});

test('table formatting is stable and preserves content and row flags', () => {
  const input = '< table background_1 >\n|b2 A | Long text\n| Z |c Q <background/>\n<$>';
  const formatted = formatMarkupTables(input);
  expect(formatted).toContain('|b2 A |  Long text');
  expect(formatted).toContain('<background/>');
  expect(formatMarkupTables(formatted)).toBe(formatted);
  expect(formatMarkupTables('Plain text')).toBe('Plain text');
});

test('legacy language keys map to native browser BCP-47 tags', () => {
  expect(markupLanguage('zh-chs')).toBe('zh-Hans');
  expect(markupLanguage('zh-cht')).toBe('zh-Hant');
  expect(markupLanguage('es-mx')).toBe('es-mx');
});
