import { legacyDatabaseSchema } from './legacy.js';
import { languages } from './languages.js';
import { tooltipSchema, type Tooltip } from './schemas.js';

export function migrateLegacy(intermediate: unknown): Tooltip[] {
  const database = legacyDatabaseSchema.parse(intermediate);
  return Object.values(database.perks).map((perk) => {
    const {
      hash, name, type, editor, stats, importStatsFrom, duration, activationCondition,
      itemHash: _itemHash, itemName: _itemName, ...legacy
    } = perk;
    const text: Tooltip['text'] = {};
    for (const language of languages) {
      const entry = editor[language];
      if (!entry) continue;
      const tracker = legacy.updateTracker?.descriptions[language];
      text[language] = {
        text: entry.main,
        updatedAt: new Date(tracker?.lastUpdate ?? 0).toISOString(),
        updatedBy: tracker?.updatedBy ?? '',
      };
      // Old data has no reliable English-source revision; do not invent one.
    }
    return tooltipSchema.parse({
      hash, text, associated: [], stats, importStatsFrom, duration, activationCondition,
      ...(hash <= 3 ? { custom: { name, categoryId: type } } : {}),
      legacy,
    });
  });
}
