import type { Tooltip } from '@clarity/core';

export interface SourceHistory {
  getHistory(
    hash: number,
    page: number,
    signal?: AbortSignal,
  ): Promise<{
    commits: { commit: string }[];
  }>;
  getVersion(hash: number, commit: string, signal?: AbortSignal): Promise<{ tooltip: Tooltip }>;
}

export type TranslationSource =
  { kind: 'found'; text: string } | { kind: 'missing'; reason: string };

export async function findTranslationSource(
  hash: number,
  sourceUpdatedAt: string,
  history: SourceHistory,
  signal?: AbortSignal,
): Promise<TranslationSource> {
  const seen = new Set<string>();
  for (let page = 1; page <= 20; page++) {
    const { commits } = await history.getHistory(hash, page, signal);
    if (!commits.length) {
      return {
        kind: 'missing',
        reason: 'The English source revision was not found in tooltip history.',
      };
    }
    for (const { commit } of commits) {
      if (seen.has(commit)) continue;
      seen.add(commit);
      const { tooltip } = await history.getVersion(hash, commit, signal);
      const english = tooltip.text.en;
      if (english && Date.parse(english.updatedAt) === Date.parse(sourceUpdatedAt)) {
        return { kind: 'found', text: english.text };
      }
    }
  }
  return {
    kind: 'missing',
    reason: 'The English source revision was not found within the first 600 history entries.',
  };
}
