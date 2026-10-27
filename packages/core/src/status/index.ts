import { resolveAlias, type Aliases } from '../aliases.js';
import { translationMaxAge } from '../exportLegacy.js';
import { languages, type Lang } from '../languages.js';
import type { Tooltip } from '../schemas.js';

export interface DriftEntry {
  tooltip: Tooltip;
  description: string;
}

export function bungieDrift(
  tooltips: readonly Tooltip[],
  items: Readonly<Record<string, { inGameDescription: string }>>,
  aliases: Aliases = {},
): { changed: DriftEntry[]; missingSnapshots: number } {
  const changed: DriftEntry[] = [];
  let missingSnapshots = 0;
  for (const tooltip of tooltips) {
    if (resolveAlias(tooltip.hash, aliases) !== tooltip.hash) continue;
    const item = items[tooltip.hash];
    if (!item) continue;
    if (!tooltip.bungieSnapshot) missingSnapshots++;
    else if (tooltip.bungieSnapshot.description !== item.inGameDescription) {
      changed.push({ tooltip, description: item.inGameDescription });
    }
  }
  changed.sort((a, b) => a.tooltip.hash - b.tooltip.hash);
  return { changed, missingSnapshots };
}

export interface OutdatedTranslation {
  tooltip: Tooltip;
  language: Lang;
  sourceUpdatedAt: string;
  ageMs: number;
  exportedInEnglish: boolean;
}

export function outdatedTranslations(
  tooltips: readonly Tooltip[],
  selectedLanguages: readonly Lang[] = languages,
  aliases: Aliases = {},
): OutdatedTranslation[] {
  const selected = new Set(selectedLanguages);
  const entries: OutdatedTranslation[] = [];
  for (const tooltip of tooltips) {
    if (resolveAlias(tooltip.hash, aliases) !== tooltip.hash || !tooltip.text.en) continue;
    for (const language of languages) {
      if (language === 'en' || !selected.has(language)) continue;
      const sourceUpdatedAt = tooltip.text[language]?.sourceUpdatedAt;
      if (!sourceUpdatedAt) continue;
      const ageMs = Date.parse(tooltip.text.en.updatedAt) - Date.parse(sourceUpdatedAt);
      if (ageMs > 0) {
        entries.push({
          tooltip,
          language,
          sourceUpdatedAt,
          ageMs,
          exportedInEnglish: ageMs > translationMaxAge,
        });
      }
    }
  }
  return entries.sort(
    (a, b) =>
      b.ageMs - a.ageMs || a.tooltip.hash - b.tooltip.hash || a.language.localeCompare(b.language),
  );
}
