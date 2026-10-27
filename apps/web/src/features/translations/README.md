# Outdated translations

The page groups saved translations by language and sorts each group by descending
English source-revision gap. A known `sourceUpdatedAt` must precede the current
English `updatedAt`; missing source metadata is deliberately not guessed.
Translators start on this page and can filter only their assigned languages.

Red "exported in English" flags use the same strict greater-than-90-day revision
gap as core export, not wall-clock elapsed time. Exactly 90 days remains translated.

Expand English changes to load tooltip history lazily. Match the English revision
timestamp, not the commit date. Search up to 20 pages (600 commits); if unavailable
or not found, show a labeled current-English fallback, with explicit errors and
retry for request failures. Collapse or navigation aborts outstanding requests.

Run root tests targeting this folder and `packages/core/src/status/status.test.ts`.
