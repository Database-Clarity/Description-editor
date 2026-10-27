import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { exportLegacy } from '../src/exportLegacy.js';
import { migrateLegacy } from '../src/migrateLegacy.js';
import { stableStringify } from '../src/contentHash.js';
import type { LegacyCatalog, LegacyPerk } from '../src/legacy.js';
import { database, fixture } from './helpers.js';

function catalog(perks: Record<string, LegacyPerk>): LegacyCatalog {
  return Object.fromEntries(Object.entries(perks).map(([hash, perk]) => [hash, {
    name: perk.name, type: perk.type,
    ...(perk.itemHash !== undefined ? { itemHash: perk.itemHash } : {}),
    ...(perk.itemName !== undefined ? { itemName: perk.itemName } : {}),
  }]));
}
function mainOnly(perks: Record<string, LegacyPerk>) {
  const normalized = structuredClone(perks);
  for (const perk of Object.values(normalized)) {
    for (const text of Object.values(perk.editor)) {
      if (text) text.secondary = text.main;
    }
  }
  return normalized;
}
test('every live hash roundtrips exactly except the intentional secondary replacement', () => {
  const live = database('live');
  expect(exportLegacy(migrateLegacy(live), 0, catalog(live.perks))).toEqual(mainOnly(live.perks));
});
test('every intermediate field survives independently of the documented live-branch drift', () => {
  const intermediate = database('intermediate');
  const live = database('live');
  const exported = exportLegacy(migrateLegacy(intermediate), 0, catalog(intermediate.perks));
  const expectedIntermediate = mainOnly(intermediate.perks);
  const expectedLive = mainOnly(live.perks);
  expect(exported).toEqual(expectedIntermediate);
  expect(Object.keys(exported).sort()).toEqual(Object.keys(expectedLive).sort());
  const authoredFields = ['editor', 'stats', 'importStatsFrom', 'duration', 'activationCondition'] as const;
  const differences = [];
  for (const hash of Object.keys(expectedLive)) {
    const source = expectedIntermediate[hash];
    const target = expectedLive[hash];
    const fields = authoredFields.filter((field) =>
      stableStringify({ value: source[field] }) !== stableStringify({ value: target[field] }),
    );
    if (fields.length === 0) continue;
    const select = (perk: LegacyPerk) =>
      Object.fromEntries(fields.map((field) => [field, perk[field] ?? null]));
    differences.push({
      hash: Number(hash),
      reason: `Existing source-branch differences in ${fields.join(', ')}; preserve intermediate authored values.`,
      intermediate: select(source),
      live: select(target),
    });
  }
  expect(differences).toEqual(fixture('branch-drift'));
});
test('generator confirms exactly four non-manifest tooltips and English-only stored content', () => {
  const generator = fixture('generator') as { perks: Record<string, unknown> };
  const intermediate = database('intermediate');
  expect(Object.keys(intermediate.perks).filter((hash) => !generator.perks[hash])).toEqual(['0', '1', '2', '3']);
  expect([...new Set(Object.values(intermediate.perks).flatMap((perk) => Object.keys(perk.editor)))]).toEqual(['en']);
  expect([...new Set(Object.values(generator.perks).flatMap((perk) =>
    Object.keys(perk as Record<string, unknown>),
  ))].sort()).toEqual(['hash', 'itemHash', 'itemName', 'name', 'type']);
});
test('downloaded fixtures match their recorded checksums and immutable source commits', () => {
  const provenance = fixture('provenance') as {
    sources: Record<string, { bytes: number; sha256: string; commit: string; url: string }>;
  };
  expect(Object.keys(provenance.sources).sort()).toEqual(['generator', 'intermediate', 'live']);
  for (const [name, source] of Object.entries(provenance.sources)) {
    const bytes = readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url));
    expect(bytes.length).toBe(source.bytes);
    expect(source.bytes).toBeLessThanOrEqual(5_000_000);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(source.sha256);
    expect(source.commit).toMatch(/^[a-f0-9]{40}$/);
    expect(source.url).toContain(`/${source.commit}/`);
  }
});
