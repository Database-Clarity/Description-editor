# Legacy editor data migration

Run from this directory on Node >=20.19:

```sh
npm ci
npm run typecheck
npm test
npm run migrate -- --output <isolated-editor-data-checkout>
```

This is a standalone tooling package, not an app workspace. Root lint covers its
source; its own typecheck and tests are required in addition to the root checks.
It imports `migrateLegacy`, `contentHash` and schemas from `@clarity/core`.

By default the command fetches current public
`Live-Clarity-Database/intermediate/intermediateDescriptions.json` and
`converter/liveDescriptions.json`. To pin inputs or run fixture data, provide
both `--intermediate <file>` and `--live <file>`. The owner's numeric GitHub ID
is always resolved from `https://api.github.com/users/StardustD2`; failed fetches
or invalid data fail the command.

The output directory must be an isolated checkout of `editor-data` (or an empty
staging directory for its initial orphan commit), never a production branch.
The script writes all tooltips, permissions, pushed digests and the checked-in
bundle workflow/script/README templates. It removes stale numeric tooltip JSON
files and rejects unexpected entries in `tooltips`. Other output files are
left alone. JSON keys are stable, with 2-space indentation and a final newline.
Rerunning on the same inputs produces identical files.

**Re-run at cut-over, before accepting v2 edits.** Migration replaces v2 authored
data and permissions. Review the diff, commit as the owner, and push only to
`editor-data`; this triggers its bundle Action. It never writes to the remote
itself or touches `intermediate`, `converter`, `live` or `main`.

`live/pushed.json` hashes the migrated converter data, not the intermediate data.
Printed pending count compares each migrated intermediate tooltip against that
baseline using the full core content hash. Preserved legacy metadata (including
upload timestamps/flags) participates, so pending includes metadata-only changes.

## Initial publication

Create an orphan git repository in the output directory, add the generated
files, commit, and push `HEAD:refs/heads/editor-data` with the owner's local
credentials. Never force-push `editor-data`. The Action alone force-pushes a
single-file orphan commit to `editor-data-bundle`. Verify its run succeeded and:

```text
https://raw.githubusercontent.com/Database-Clarity/Live-Clarity-Database/editor-data-bundle/bundle.json
```

The returned `sourceCommit` must match the `editor-data` source commit.
No bot-generated commit is added to the authored branch.
