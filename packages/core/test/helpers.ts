import { readFileSync } from 'node:fs';
import { legacyDatabaseSchema } from '../src/legacy.js';
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
