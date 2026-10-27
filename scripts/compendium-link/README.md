# Compendium baseline linking

Dry-run and reporting tool for existing `editor-data` tooltips. It fetches that
branch into Git's object store without checking it out or changing the editor
index/worktree. Manifest aliases resolve to canonical tooltips. Configured
category tabs are preferred; all tabs are searched if no name matches there.
Full names and individual identifiers in multiline name cells are considered,
including base names for enhanced variants and weapon names for catalysts.
Only one exact or normalized name match is auto-linked. Ambiguous and
similarity-only matches remain unlinked with candidates in the CSV report.

From the editor repository root:

```powershell
npm exec esbuild -- scripts\compendium-link\cli.ts --bundle --platform=node --format=esm --outfile=scripts\compendium-link\dist\cli.mjs
node scripts\compendium-link\dist\cli.mjs path\to\compendium.json path\to\report
```

Outputs: `coverage.json` with the immutable source data HEAD and per-category
totals, `compendium-unlinked.csv` with every unresolved hash and reason, and
`baseline.json` containing only proposed changed tooltip files. Every proposal
must preserve its core `publishableHash`; otherwise the entire run fails.
Existing identical snapshots retain their timestamp, making reruns no-ops.

**Publication is a separate, owner-approved operation.** After reviewing the
coverage and receiving approval for the exact data HEAD, rerun with
`--commit-approved-head=<40-character data HEAD>`. This preserves every untouched
file, creates one metadata-only commit on top of that exact HEAD, and performs a
normal non-forced push to `editor-data`. If the branch moved, it stops: repeat
the dry run and obtain fresh approval. It never writes production branches or
changes pushed markers.
