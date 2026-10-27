import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '../../ui/PlaceholderPage';

export function TooltipPage() {
  const { hash } = useParams<'hash'>();

  return (
    <PlaceholderPage title={`Tooltip ${hash}`}>
      The tooltip editor and its enhanced-perk preview will live here.
    </PlaceholderPage>
  );
}
