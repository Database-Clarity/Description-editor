import { languages } from './languages.js';
import type { LegacyCatalog, LegacyMetadata, LegacyPerk } from './legacy.js';
import { tooltipSchema, type Tooltip } from './schemas.js';
import { resolveAlias, type Aliases } from './aliases.js';

export const translationMaxAge = 90 * 24 * 60 * 60 * 1000;
export type LegacyEntry = LegacyMetadata &
  Pick<LegacyPerk, 'hash' | 'editor'> &
  Partial<Pick<LegacyPerk, 'name' | 'type' | 'itemHash' | 'itemName'>>;

export function exportLegacy(
  tooltips: readonly Tooltip[],
  now: number,
  catalog?: LegacyCatalog,
  aliases: Aliases = {},
): Record<string, LegacyEntry> {
  if (!Number.isFinite(now) || now < 0 || !Number.isInteger(now)) {
    throw new TypeError('now must be nonnegative integer epoch milliseconds');
  }
  const entries: Record<string, LegacyEntry> = {};
  for (const input of tooltips) {
    const tooltip = tooltipSchema.parse(input);
    if (resolveAlias(tooltip.hash, aliases) !== tooltip.hash) {
      throw new Error(`Alias ${tooltip.hash} cannot have its own tooltip`);
    }
    if (entries[tooltip.hash]) throw new Error(`Duplicate tooltip hash: ${tooltip.hash}`);
    const english = tooltip.text.en;
    const editor: LegacyEntry['editor'] = {};
    const descriptions: NonNullable<LegacyEntry['updateTracker']>['descriptions'] = {
      ...tooltip.legacy?.updateTracker?.descriptions,
    };
    for (const language of languages) {
      const translation = tooltip.text[language];
      if (!translation) continue;
      const outdated =
        language !== 'en' &&
        english &&
        translation.sourceUpdatedAt !== undefined &&
        Date.parse(english.updatedAt) - Date.parse(translation.sourceUpdatedAt) > translationMaxAge;
      const exported = outdated && english ? english : translation;
      editor[language] = { main: exported.text, secondary: exported.text };
      const old = tooltip.legacy?.updateTracker?.descriptions[language];
      descriptions[language] = {
        lastUpdate: Date.parse(exported.updatedAt),
        ...(exported.updatedBy !== '' || old?.updatedBy !== undefined
          ? { updatedBy: exported.updatedBy }
          : {}),
      };
    }
    const facts =
      catalog?.[tooltip.hash] ??
      (tooltip.custom ? { name: tooltip.custom.name, type: tooltip.custom.categoryId } : undefined);
    if (catalog && !facts) throw new Error(`Missing manifest facts for tooltip ${tooltip.hash}`);
    entries[tooltip.hash] = {
      ...tooltip.legacy,
      ...facts,
      hash: tooltip.hash,
      editor,
      uploadedBy: tooltip.legacy?.uploadedBy ?? '',
      lastUpload: tooltip.legacy?.lastUpload ?? now,
      inLiveDatabase: tooltip.legacy?.inLiveDatabase ?? false,
      uploadToLive: tooltip.legacy?.uploadToLive ?? false,
      updateTracker: { ...tooltip.legacy?.updateTracker, descriptions },
    };
  }
  for (const alias of Object.keys(aliases)) {
    const target = resolveAlias(Number(alias), aliases);
    const entry = entries[target];
    if (!entry) continue;
    const facts = catalog?.[alias];
    if (catalog && aliases[alias].kind === 'frame' && !facts) {
      throw new Error(`Missing manifest facts for frame alias ${alias}`);
    }
    const aliased: LegacyEntry = { ...entry, hash: Number(alias) };
    if (facts) {
      delete aliased.name;
      delete aliased.type;
      delete aliased.itemHash;
      delete aliased.itemName;
      Object.assign(aliased, facts);
    }
    entries[alias] = aliased;
  }
  return entries;
}
