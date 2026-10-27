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
