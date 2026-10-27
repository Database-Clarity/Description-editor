import { expect, test } from 'vitest';
import { languages, langSchema } from '../src/languages.js';

test('all 13 converter languages are supported; unknown codes are rejected', () => {
  expect(new Set(languages).size).toBe(13);
  expect(languages).toEqual([
    'en', 'de', 'es', 'es-mx', 'fr', 'it', 'ja', 'ko', 'pl', 'pt-br', 'ru', 'zh-chs', 'zh-cht',
  ]);
  expect(langSchema.safeParse('pt').success).toBe(false);
});
