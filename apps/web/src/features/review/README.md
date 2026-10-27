# Review saved changes

`#/review` compares each canonical saved tooltip's core `publishableHash` with
the bundle's pushed marker. Local drafts and metadata-only edits do not count.
Categories follow registry order; enhanced tooltips with their own authored text
remain separate review items. Lists are paged in groups of 15 to bound history requests.
Up/Down (outside controls) and Previous/Next walk the list without wrapping.

Selection survives navigation, but only still-pending hashes are submitted.
Editors and maintainers may push at most 100 at once. The request includes the
reviewed content digests; a newer saved version causes a 409 rather than silently
publishing unreviewed content. Successful responses update the local marker view
and refresh the bundle; bundle generation can lag behind a push.

`GET /history/:hash?live=1` supplies the exact last pushed authored snapshot.
The worker commits `live/tooltips/<hash>.json` with `live/pushed.json`, using the
same immutable data version exported to the target branch. A save between export
and marker recording cannot contaminate the diff. Pre-snapshot markers are recovered
by finding a historical tooltip with the same publishable digest (up to 300 commits);
failure is explicit, never a comparison against guessed text.

The comparison is authored pushed text, before export-time translation fallback.
No live marker means no recorded live baseline, not proof that the legacy database
never contained that hash. Partial live-write failures retain the worker's explicit
error details and must not be interpreted as "nothing was published."
