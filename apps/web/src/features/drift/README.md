# Bungie drift

The page compares saved canonical tooltips against the current generator manifest.
Only tooltips with a manifest item and an existing Bungie snapshot can drift.
Manifest-backed tooltips without snapshots are counted separately; custom tooltips
without manifest facts and aliases are excluded.

Maintainers, editors and trial editors can mark a description reviewed. The save
contains the saved tooltip with only `bungieSnapshot` replaced, never a local
draft or new language timestamps. Conflicts are reported explicitly and require
reloading/reviewing before retrying. Snapshot-only changes are not publishable.

Pure selectors are in `packages/core/src/status`. Run the root test command with
`packages/core/src/status/status.test.ts` and this folder's `review.test.ts`.
