import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminPage } from './features/admin/AdminPage';
import { CompendiumPage } from './features/compendium/CompendiumPage';
import { TooltipPage } from './features/editor/TooltipPage';
import { GlobalDetailPage, GlobalsPage } from './features/globals/GlobalsPage';
import { Layout } from './features/navigation/Layout';
import { ReviewPage } from './features/review/ReviewPage';
import { DriftPage } from './features/drift/DriftPage';
import { TranslationsPage } from './features/translations/TranslationsPage';
import { PlaceholderPage } from './ui/PlaceholderPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/t/123" replace />} />
        <Route path="t/:hash" element={<TooltipPage />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="compendium" element={<CompendiumPage />} />
        <Route path="drift" element={<DriftPage />} />
        <Route path="translations" element={<TranslationsPage />} />
        <Route path="globals" element={<GlobalsPage />} />
        <Route path="globals/:kind/:name" element={<GlobalDetailPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route
          path="*"
          element={
            <PlaceholderPage title="Page not found">
              Choose a page from the navigation to continue.
            </PlaceholderPage>
          }
        />
      </Route>
    </Routes>
  );
}
