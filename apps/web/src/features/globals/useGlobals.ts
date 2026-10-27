import { useMemo } from 'react';
import { buildGlobalUsageIndex } from '@clarity/core';
import { useDataStore } from '../../stores/data';
import { useDraftStore } from '../../stores/drafts';

export function useGlobals() {
  const data = useDataStore((state) => state.data);
  const drafts = useDraftStore((state) => state.drafts);
  return useMemo(
    () =>
      buildGlobalUsageIndex({
        ...data?.bundle.tooltips,
        ...Object.fromEntries(Object.entries(drafts).map(([hash, draft]) => [hash, draft.next])),
      }),
    [data, drafts],
  );
}
