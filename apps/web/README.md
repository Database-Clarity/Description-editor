# Web app

The v2 browser app uses React 18, strict TypeScript, Vite, HashRouter, Zustand, and SCSS modules.
It loads the generator's `v2/templates/v2` catalog and the authored
`Live-Clarity-Database/editor-data-bundle/bundle.json`, validating all responses.

From the repository root, run `npm ci`, then `npm run dev`.
Open http://localhost:5173/. Run `npm run build` for a production build.
The web output is `apps/web/dist`. Vite uses relative asset URLs (`base: './'`) so it can
be hosted below a GitHub Pages repository path.

- `src/App.tsx`: routes; use router links to preserve browser back/forward history.
- `src/features/`: one folder for each feature. Empty folders reserve later work.
- `src/features/navigation/`: one compact layout with category/tooltip dropdowns at the
  top of the sidebar, name/hash search, alias resolution, and history-aware navigation.
  Categories are grouped by their registry group and order. Workspace navigation
  is a secondary dropdown. Wheel/arrow stepping is scoped to the Tooltip dropdown,
  never an editor or normal page scrolling. Explicit selections push history;
  stepping replaces immediately and commits one entry after a second idle.
- `src/ui/`: shared components and base styles.
- `src/services/`: generator, authored bundle, worker API, and native IndexedDB access.
- `src/stores/`: loaded data and per-tooltip `{base,next}` drafts. Draft recovery
  completes before editing. Failed recovery blocks editing; failed writes keep
  edits in memory and show a persistent retry warning. Wait for "Saving local
  drafts" to disappear before closing. Discard removes only the chosen tooltip's draft.
  Atomic compare-before-write prevents a second tab from silently overwriting
  drafts changed elsewhere; retain both tabs if that warning appears.
- `src/features/tooltip/`: selected language, base and all enhanced variants,
  editor/preview composition. Enhanced and sandbox URLs replace to the base route.
- `src/data/`: original SCSS theme variables and mixins, copied from legacy.
- `src/assets/`: the original DestinySymbols font.

## Editor and preview

`features/editor` exports `<ClarityEditor value lang onChange globals readOnly? />`.
`features/preview` exports `<TooltipPreview text lang name icon? categoryLabel? globals />`.
Both accept raw `text[lang].text` and the core `MarkupGlobals` shape:
`{ variables, titles, imports?, type? }`. Provide selected-language raw text for
all tooltips in `imports` (keyed by hash; hash 1 contains global exports) and
the category's `legacyType` as `type`. No component fetches data.
The core parser drives validation and rendering; title popovers work by hover
and keyboard focus, and weapon-specific sections have a preview selector.

CodeMirror has native `spellcheck="true"` and a BCP-47 `lang` on its editable
content (Chinese `zh-chs`/`zh-cht` map to `zh-Hans`/`zh-Hant`). Native underlines
require spelling enabled and the corresponding browser dictionary installed;
the application cannot install or force a dictionary. Right-click a misspelling
for native suggestions. Ctrl/Cmd+Space completes variables, title references,
import names/targets and formatting; Ctrl/Cmd+Z undoes; Ctrl/Cmd+/ toggles comments.
Scroll Lock and Ctrl/Cmd+Shift+F align table columns in one undoable transaction.
Changing to an externally supplied document clears undo history, preventing
undo from restoring a different tooltip or language.

## Worker connection

Set `VITE_API_URL` in `apps/web/.env.local` to the worker origin before starting Vite.
Without it, the app is explicitly read-only (existing drafts remain recoverable).
The worker client redirects login to `/auth/login`; the worker returns to
`#/auth/callback?session=…`. The callback immediately removes the token from the URL,
keeps it in tab-scoped sessionStorage (survives reload, not tab closure), and sends
it as `Authorization: Bearer …` on `/me` and `/save`. Sign out clears that session.
A 409 save result carries typed field-conflict data or a distinct retryable race error;
the conflict/save UI is a later batch. No client role replaces server authorization.

Run root `npm test` for catalog/history/draft/API tests, including actual IndexedDB
transactions via fake-indexeddb. Put component styles in `*.module.scss` and shared
domain logic in `packages/core`.
