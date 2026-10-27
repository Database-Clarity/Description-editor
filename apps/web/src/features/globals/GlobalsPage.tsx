import { Link, useParams } from 'react-router-dom';
import { PlaceholderPage } from '../../ui/PlaceholderPage';

export function GlobalsPage() {
  return (
    <PlaceholderPage title="Globals">
      Shared variables and titles, with links to their usages, will appear here.{' '}
      <Link to="/globals/variables/example">Preview a global detail page</Link>.
    </PlaceholderPage>
  );
}

export function GlobalDetailPage() {
  const { kind, name } = useParams<'kind' | 'name'>();

  return (
    <PlaceholderPage title={`${kind}: ${name}`}>
      Tooltips using this global will appear here. <Link to="/globals">Back to globals</Link>.
    </PlaceholderPage>
  );
}
