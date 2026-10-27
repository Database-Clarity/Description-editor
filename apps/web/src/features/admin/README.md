# Permissions administration

Only maintainers can open this page or see its workspace navigation entry.
The page loads current permissions from the worker, not the potentially stale
public bundle. GitHub login lookup resolves and stores the stable numeric user ID.
New accounts start as trial editors; role/language changes remain local until
the whole permissions document is saved with `PUT /permissions`.

The UI, pure edit helper and worker all prevent removing/demoting the last
maintainer. Saving refreshes `/me`, including when the maintainer changed their
own role. Failed lookup/load/save operations are shown explicitly; unsaved form
edits remain available after save failures. Discard resets to the last loaded or
successfully saved document.

API requests live in `services/permissions.ts`; GitHub lookup never receives the
editor's session token. Run root tests targeting `features/admin/permissions.test.ts`
and `services/permissions.test.ts`.
