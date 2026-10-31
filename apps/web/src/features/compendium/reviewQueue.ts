import { resolveAlias, resolveCompendiumLink, type CompendiumData } from '@clarity/core';
import type { EditorData } from '../../stores/data';
import type { Drafts } from '../../services/draftStorage';
import { itemFor, tooltipFor } from '../navigation/catalog';
import { localDecision, sourceFingerprint, type ReviewProgress } from './reviewProgress';

export function reviewQueue(
  editor: EditorData,
  source: CompendiumData,
  drafts: Drafts,
  progress: ReviewProgress,
  fingerprint: string,
) {
  const hashes = new Set(
    [...Object.values(editor.items), ...Object.values(editor.bundle.tooltips)].map(
      (entry) => entry.hash,
    ),
  );
  return [...hashes]
    .flatMap((hash) => {
      // Enhanced tooltips can own distinct text; aliases never own a link.
      if (hash <= 3 || resolveAlias(hash, editor.aliases) !== hash) return [];
      const base = tooltipFor(hash, editor);
      const item = itemFor(hash, editor);
      const next = drafts[hash]?.next ?? base;
      const resolution = next.compendium && resolveCompendiumLink(next.compendium, source);
      const valid = resolution && !['missing', 'candidates'].includes(resolution.status);
      const changed = JSON.stringify(base.compendium) !== JSON.stringify(next.compendium);
      const evidence = sourceFingerprint([
        fingerprint,
        item?.name,
        item?.categoryId,
        base.text.en,
        base.compendium,
      ]);
      const decision = localDecision(progress, hash, evidence);
      const status: 'drafted' | 'saved' | 'open' | 'skipped' | 'no-equivalent' = valid
        ? changed
          ? 'drafted'
          : 'saved'
        : decision;
      if (status === 'saved' && !progress.decisions[hash] && !changed) return [];
      return [
        {
          hash,
          base,
          next,
          name: item?.name ?? String(hash),
          category: item?.categoryId ?? 'other',
          status,
          evidence,
          stale:
            !valid &&
            !!progress.decisions[hash] &&
            progress.decisions[hash].fingerprint !== evidence,
          reason: !next.compendium ? 'Unlinked' : valid ? 'Linked' : 'Needs repair',
        },
      ];
    })
    .sort((a, b) => a.name.localeCompare(b.name) || a.hash - b.hash);
}

export function mayDraftLink(
  role: string | null | undefined,
  api: boolean,
  hydrated: boolean,
  locked: boolean,
) {
  return api && hydrated && !locked && !!role && ['maintainer', 'editor', 'trial'].includes(role);
}
