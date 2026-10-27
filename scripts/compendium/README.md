# Compendium data publisher

Source for the separate public `Database-Clarity/Compendium-data` repository.
That repository's default `main` branch holds `runner.mjs`, bundled `parser.mjs`,
this README, `parser-source.txt`, `compendium.json`, and
`.github/workflows/compendium.yml`. It does not touch the live description database.

The Action runs daily at 05:17 UTC and on demand. GitHub schedules can be delayed.
The runner fetches the Landing htmlview to discover all tabs, then parses each
tab using the editor core parser. A failed fetch, invalid schema, unknown layout
or empty non-Landing tab fails the entire run without replacing the old data.
Landing is a navigation-only tab. Other tabs support ordinary/parallel tables,
row-spanned names/descriptions, and artifact cards with their descriptions on
the following row. Config overrides are in the editor core's Compendium config.

Only content changes produce a commit; `fetchedAt` is the last changed dataset's
fetch time, not proof of the most recent unchanged run. The editor polls the
Actions status as well as this timestamp so an unchanged refresh can complete.
No class names, raw HTML, scripts or arbitrary CSS are stored in the dataset.
The bundled parser's MIT third-party notices must remain in `parser.mjs`.

## Updating the parser

From a reviewed, committed editor checkout, with dependencies restored:

```powershell
npm exec esbuild -- scripts\compendium\parser-entry.ts --bundle --platform=node --format=esm --legal-comments=inline --outfile=scripts\compendium\dist\parser.mjs
```

Copy the result and `runner.mjs` into the data repository; record the exact editor
commit in `parser-source.txt`. Copy this workflow to
`.github/workflows/compendium.yml`. Review, test and explicitly approve publishing
that commit separately from editor integration. The published runner needs only
Node 24: no install, npm credentials or runtime dependencies.

```powershell
node runner.mjs compendium.json
```

The repository must allow Actions to write contents. Install the editor GitHub
App on **both** the authored database and this repository, with Actions read/write
and Contents read/write permissions. Never grant the web client an installation
token. Refresh requests are checked against the authored database's current
editor/maintainer roles by the Worker.
