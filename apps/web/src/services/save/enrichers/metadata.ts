import { languages, type Tooltip } from '@clarity/core';
import type { SaveEnricher } from './index';

export const metadata: SaveEnricher = async ({ before, next, user }) => {
  const text: Tooltip['text'] = { ...next.text };
  const now = new Date().toISOString();
  for (const lang of languages) {
    const entry = text[lang];
    if (!entry) continue;
    if (entry.text === before?.text[lang]?.text) {
      text[lang] = before?.text[lang];
      continue;
    }
    text[lang] = {
      ...entry,
      updatedAt: now,
      updatedBy: user.login,
    };
  }
  for (const lang of languages) {
    const entry = text[lang];
    if (lang === 'en' || !entry || entry.text === before?.text[lang]?.text) continue;
    if (text.en) text[lang] = { ...entry, sourceUpdatedAt: text.en.updatedAt };
    else throw new Error(`Cannot stamp ${lang} without an English source revision.`);
  }
  return { ...next, text };
};
