import { describe, expect, it } from 'vitest';
import { validateText, validateTooltip } from './index.js';

const globals = {
  variables: 'var damage = 10',
  titles: 'title Known (\nA title\n)',
  imports: { '123': 'Imported text', '456': 'Imported text' },
};

describe('save validation', () => {
  it('blocks empty English, but not an empty translation or declaration library', () => {
    expect(validateText('  ', 'en')[0].severity).toBe('error');
    expect(validateText('', 'fr')).toEqual([]);
    expect(validateTooltip({ hash: 2, text: {}, associated: [] }, () => globals)).toEqual([]);
    expect(validateTooltip({ hash: 10, text: {}, associated: [] }, () => globals)).toMatchObject([
      { hash: 10, lang: 'en', severity: 'error' },
    ]);
  });
  it('warns about unknown variables/titles and supplies source ranges', () => {
    const text = '#damage #missing <title label [Unknown] />';
    const issues = validateText(text, 'en', globals);
    expect(issues).toHaveLength(2);
    expect(issues[0]).toMatchObject({
      severity: 'warning',
      from: 8,
      to: 16,
      message: 'Unknown variable #missing.',
    });
    expect(issues[1].message).toContain('Unknown title');
    expect(validateText('#damage <title label [Known] />', 'en', globals)).toEqual([]);
  });
  it('blocks unknown imports but accepts aliases projected in the imports catalog', () => {
    expect(validateText('import main from 999', 'en', globals)).toMatchObject([
      { severity: 'error', message: 'Unresolved import "main" from 999.' },
    ]);
    expect(validateText('import main from 456', 'en', globals)).toEqual([]);
  });
  it('preserves parser errors and ignores commented-out unknown references', () => {
    expect(validateText('import self', 'en', globals)[0].severity).toBe('error');
    expect(validateText('// #missing <title label [Unknown] />\nText', 'en', globals)).toEqual([]);
  });
  it('detects errors in every stored language, not only the active editor language', () => {
    const revision = { updatedAt: '2026-01-01T00:00:00.000Z', updatedBy: 'a' };
    expect(
      validateTooltip(
        {
          hash: 20,
          associated: [],
          text: { en: { ...revision, text: 'Fine' }, fr: { ...revision, text: 'import self' } },
        },
        () => globals,
      ),
    ).toMatchObject([{ hash: 20, lang: 'fr', severity: 'error' }]);
  });
});
