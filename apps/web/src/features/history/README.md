# Tooltip history

Each tooltip and enhanced variant has a lazy-loaded history panel. The worker lists
30 commits per page for `tooltips/<hash>.json`, including GitHub login/avatar when
available and git author/date/message as fallbacks. Selecting a commit loads its
immutable full JSON, shows all language differences against the current local draft
(or saved tooltip), and exposes the complete historical record.

Revert requires confirmation and only loads a local draft through the normal
save service. It never directly saves or publishes. Existing local edits are replaced
only after confirmation; normal validation, metadata enrichment, merge handling and
persistent draft storage still apply. Translators restore only assigned languages
and cannot replace associations or other tooltip fields.

`services/history.ts` is the worker client shared with review and translations:
`getHistory(hash, page?, signal?)`, `getVersion(hash, commit, signal?)`,
`getPushedVersion(hash, signal?)`, and `pushSelected(hashes, expected)`.
