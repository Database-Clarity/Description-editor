import { languages, usesEnglishFallback, type Lang } from '@clarity/core';
import type { Change } from '../api';
import { noImpactApplies, stampRevisions } from './enrichers/metadata';

/** Per changed tooltip, the languages whose live text after this save is the English fallback. */
export type LiveFallback = Record<number, Lang[]>;

/**
 * EXPORT-FALLBACK-VALIDATION: the languages whose LIVE output this save changes to English text.
 * Live output exports a translation more than 90 days of English revisions behind as the English
 * text (core `usesEnglishFallback`), so a save that stamps a new English revision can flip a
 * language to English, and an English edit changes what an already falling-back language shows.
 * Both are listed: the language falls back after the save (stamped exactly as the save will,
 * with the same `now` and tick), and either it did not before or the English text changed.
 * Save validation checks the English text in that language's catalogue, plus its dependents.
 * Pure and cheap (no catalogue reads): run per save on the main thread to key the validation.
 */
export function liveFallback(
  changes: readonly Change[],
  now: string,
  noTranslationImpact: boolean,
): LiveFallback {
  const result: LiveFallback = {};
  for (const { hash, base, next } of changes) {
    // Only a translation with a source revision can fall back (usesEnglishFallback). A stamped
    // entry is the base's (unchanged text) or the draft's restamped to the new English (gap 0),
    // so without such an entry on either side nothing can fall back: skip the stamping work.
    if (
      !languages.some(
        (lang) =>
          lang !== 'en' &&
          (base?.text[lang]?.sourceUpdatedAt !== undefined ||
            next.text[lang]?.sourceUpdatedAt !== undefined),
      )
    )
      continue;
    let stamped;
    try {
      stamped = stampRevisions(base ?? undefined, next, '', now, noTranslationImpact);
    } catch {
      continue; // A translation without English: validation refuses the save anyway.
    }
    const englishChanged = (base?.text.en?.text ?? '') !== (next.text.en?.text ?? '');
    const flipped = languages.filter(
      (lang) =>
        lang !== 'en' &&
        usesEnglishFallback(stamped, lang) &&
        (englishChanged || !base || !usesEnglishFallback(base, lang)),
    );
    if (flipped.length) result[hash] = flipped;
  }
  return result;
}

/** Whether the "No translation impact" tick would change anything in this save. */
export function noImpactAvailable(changes: readonly Change[]): boolean {
  return changes.some(({ base, next }) => noImpactApplies(base ?? undefined, next));
}
