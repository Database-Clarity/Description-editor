import type { Tooltip } from '@clarity/core';

export function reviewedSnapshot(base: Tooltip, description: string, snapshotAt: string): Tooltip {
  return { ...base, bungieSnapshot: { description, snapshotAt } };
}
