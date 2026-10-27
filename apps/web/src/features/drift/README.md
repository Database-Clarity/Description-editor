# Bungie drift

The page compares saved canonical tooltips against the current generator manifest.
Only tooltips with a manifest item and an existing Bungie snapshot can drift.
Manifest-backed tooltips without snapshots are counted separately; custom tooltips
without manifest facts and aliases are excluded.

Maintainers, editors and trial editors can mark a description reviewed. The save
opens the shared save review with only `bungieSnapshot` replaced, never a local
draft or new language timestamps. Shared validation and conflict resolution apply.
Unrelated local drafts are neither submitted nor cleared. Snapshot-only changes
are not publishable. Normal English edits also create snapshots; translation-only
saves do not.

Pure selectors are in `packages/core/src/status`. Run the root test command with
`packages/core/src/status/status.test.ts` and this folder's `review.test.ts`.
