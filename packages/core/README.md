# @clarity/core

Pure TypeScript shared by browser and Cloudflare Worker. Runtime imports use only
Zod and Web APIs (Web Crypto SHA-256); Node imports are confined to tests and the
fixture refresh utility. Source exports are intended for the web/worker bundlers.
The standalone test toolchain supports Node 20.19+, Node 22.12+, or Node 24+.
Node 20 is the batch-1 CI runtime; patched Vitest 4 retains that support.

```powershell
cd packages\core
npm ci
npm test
npx tsc --noEmit
```

## Public API

- `tooltipSchema`, `langTextSchema`, `permissionsSchema`, `pushedSchema` and
  their inferred types validate persisted data without silently stripping fields.
- `migrateLegacy(database)` accepts the complete legacy intermediate database and
  returns `Tooltip[]`. Unknown authored fields fail validation.
- `contentHash(tooltip)` returns a Promise of a lowercase SHA-256 hex string.
  Object keys and association order are canonicalized; text, metadata and array
  order elsewhere are significant. `stableStringify` accepts finite JSON data
  (optional object properties with `undefined` are omitted).
- `merge3(base, head, next)` returns `{ ok: true, merged }` or
  `{ ok: false, conflicts: [{ field, base, head, next }] }`. Each language's
  complete `LangText` is atomic, preventing text and author/timestamp mismatches.
  Associations use set merge: union additions, remove an original member if
  either side removed it. All other top-level fields are atomic, including
  stats, snapshots and legacy metadata. A hash mismatch is an error.
- `exportLegacy(tooltips, now, catalog?)` returns legacy entries keyed by hash.
  `now` is nonnegative integer epoch milliseconds, used only when no legacy upload
  timestamp exists; export does not manufacture new edit authorship. Main text
  supplies **both** legacy editor fields. A translation with known
  `sourceUpdatedAt` more than 90 days behind `en.updatedAt` exports English text
  and English edit metadata. Exactly 90 days does not fall back. This measures
  source-revision age, not time since translation or wall-clock age. Unknown source
  revision or absent English retains the translation.

### Manifest join

Tooltips do not store generated `name`, `type`, `itemHash`, `itemName`, folders,
or enhanced pairing. Provide the optional third `catalog` argument to
`exportLegacy` to restore the full converter entry shape:

```ts
const entries = exportLegacy(tooltips, Date.now(), {
  '123': { name: 'Perk', type: 'Weapon Trait', itemHash: 456, itemName: 'Weapon' },
});
```

With a catalog, any missing manifest record throws (custom tooltip facts can
supply their own name/category). Without one, export returns authored entries,
not a complete converter database. Caller owns `databaseSettings`, manifest
aliases, and selection of tooltips to publish.

## Legacy field inventory

| Legacy field | v2 destination / treatment |
| --- | --- |
| `hash` | `hash`; map key must agree, unsigned 32-bit integer |
| `editor[lang].main` | `text[lang].text` |
| `editor[lang].secondary` | deliberately discarded; export uses main |
| `updateTracker.descriptions[lang]` | `text[lang].updatedAt/updatedBy`; original also retained in `legacy.updateTracker` |
| `updateTracker.stats` | `legacy.updateTracker.stats`, including absent `updatedBy` |
| `uploadedBy`, `lastUpload`, `inLiveDatabase`, `uploadToLive` | `legacy` compatibility metadata |
| `stats` | precise stat-name/weapon-type/modifier schema; arrays preserved |
| `importStatsFrom`, `duration`, `activationCondition` | same-named optional authored fields |
| `name`, `type` | excluded manifest facts; reserved custom hashes 0-3 preserve these as `custom.name/categoryId` |
| `itemHash`, `itemName` | excluded manifest facts, supplied at export by caller |
| `databaseSettings.folders/enhancedPerks` | excluded manifest structure; caller-owned |

Migration keeps stats links and upload flags without interpreting them as v2
permissions or pushed state. Missing edit timestamps/authors become epoch/empty
author, not guessed upload metadata. Legacy has no reliable source revision:
`sourceUpdatedAt` is intentionally absent after migration. Orphan language
trackers without editor text remain in compatibility metadata, retaining credits.
The metadata copy is historical; text edits export the current `LangText` tracker.

## Languages

`en`, `de`, `es`, `es-mx`, `fr`, `it`, `ja`, `ko`, `pl`, `pt-br`, `ru`,
`zh-chs`, `zh-cht`. Confirmed against Description-converter's
[`src/data.ts`](https://github.com/Database-Clarity/Description-converter/blob/153b87bff62263b28ad6e70bd229448c383196aa/src/data.ts).
The pinned databases currently contain only English editor text, but retain some
historical Korean/Chinese tracker credits.

## Golden fixtures and intentional differences

Fixtures are full untrimmed public intermediate/live databases (~2 MB each) and
the generator template (~0.4 MB). Tests never fetch the network. The provenance
file pins source commits and SHA-256 checksums. Refresh from this directory:

```powershell
node test\refresh-fixtures.mjs
npm test
```

Review the changed fixtures and explicit branch-drift values before committing.
The refresh utility derives drift from the two raw inputs, never the mapper.
Refresh refuses a
fixture over 5 MB so gzip support must be added explicitly before larger data is
committed.

The branches are **not identical input/output**: all 2,761 hashes have different
upload timestamps, and some differ in text, authorship/tracker timestamps,
publication flags, import-stat links, stats, or generated facts. Pretending
intermediate can reproduce those live values would silently discard newer work.
The golden tests therefore:

1. Assert live -> v2 -> live equals every original field for every hash,
   changing **only secondary := main**.
2. Independently assert intermediate -> v2 -> export equals **every original
   intermediate field** for every hash, changing only secondary. No exception
   file can waive a migration/export failure, even if all metadata differs.
3. Compare authored text/stats/links against live, with explicit before/after
   values and a reason per hash in
   [branch-drift.json](test/fixtures/branch-drift.json). Upload metadata and
   generated facts are excluded only from this cross-branch comparison, never
   from the two exact full-field roundtrip assertions.
4. Confirm only reserved hashes 0-3 are absent from the generator template.

Schemas and unit tests additionally cover optional authored fields not currently
present in the intermediate fixture (`stats`, `duration`, `activationCondition`)
and synthetic translations including the exact 90-day boundary.
