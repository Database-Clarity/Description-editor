# Web app

The v2 browser app uses React 18, strict TypeScript, Vite, HashRouter, Zustand, and SCSS modules.
It is a shell only: no remote data, authentication, or saving is connected yet.

From the repository root, run `npm ci`, then `npm run dev`.
Open http://localhost:5173/#/t/123. Run `npm run build` for a production build.
The web output is `apps/web/dist`. Vite uses relative asset URLs (`base: './'`) so it can
be hosted below a GitHub Pages repository path.

- `src/App.tsx`: routes; use router links to preserve browser back/forward history.
- `src/features/`: one folder for each feature. Empty folders reserve later work.
- `src/features/navigation/`: sidebar, layout, and an example Zustand store. The
  "Compact navigation" button demonstrates a real store update without writing to storage.
- `src/ui/`: shared components and base styles.
- `src/services/`: future data access; put network calls here, not inside components.
- `src/data/`: original SCSS theme variables and mixins, copied from legacy.
- `src/assets/`: the original DestinySymbols font.

Put component styles in `*.module.scss`. Keep pure domain logic in `packages/core`,
not in UI components. When keyboard/wheel tooltip stepping is implemented, replace
the route immediately and push a history entry after one second idle; explicit links
already push entries normally.

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
