import type { SaveEnricher } from './index';

export const bungie: SaveEnricher = async ({ before, next, item, user }) => {
  if (!item || user.role === 'translator') return next;
  const englishChanged = before?.text.en?.text !== next.text.en?.text;
  const explicitlyReviewed =
    JSON.stringify(before?.bungieSnapshot) !== JSON.stringify(next.bungieSnapshot);
  if (!englishChanged && !explicitlyReviewed) return next;
  return {
    ...next,
    bungieSnapshot: {
      description: item.inGameDescription,
      snapshotAt: new Date().toISOString(),
    },
  };
};
