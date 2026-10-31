import { readFileSync } from 'node:fs';
import { legacyDatabaseSchema } from '../src/legacy.js';
import { exportLegacy, type LegacyEntry } from '../src/exportLegacy.js';
import type { Tooltip } from '../src/schemas.js';

export function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'));
}
export function database(name: string) {
  return legacyDatabaseSchema.parse(fixture(name));
}
export function tooltip(): Tooltip {
  return {
    hash: 42, associated: [],
    text: { en: { text: 'English', updatedAt: '2026-01-01T00:00:00.000Z', updatedBy: 'alice' } },
  };
}

/** exportLegacy for inputs without aliases: every entry is canonical. */
export function exportCanonical(...args: Parameters<typeof exportLegacy>): Record<string, LegacyEntry> {
  const entries = exportLegacy(...args);
  for (const entry of Object.values(entries)) if ('aliasOf' in entry) throw new Error('unexpected alias stub');
  return entries as Record<string, LegacyEntry>;
}
