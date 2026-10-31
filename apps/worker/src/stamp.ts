import { resolveAlias, type Aliases, type LegacyEntry } from '@clarity/core';

/**
 * Mirrors the legacy editor's upload stamping: perks whose publishable content changed since
 * the last push get the push time and the pushing user; unchanged perks keep whatever the
 * live entry (canonical or alias copy) already carries.
 */
export function stampUploads(
  entries: Record<string, LegacyEntry>,
  changed: ReadonlySet<number>,
  livePerks: Record<string, unknown>,
  aliases: Aliases,
  now: number,
  uploader: string,
): void {
  for (const [key, entry] of Object.entries(entries)) {
    if (changed.has(resolveAlias(Number(key), aliases))) {
      entry.lastUpload = now;
      entry.uploadedBy = uploader;
      continue;
    }
    const live = livePerks[key];
    if (typeof live !== 'object' || live === null) continue;
    const { lastUpload, uploadedBy } = live as { lastUpload?: unknown; uploadedBy?: unknown };
    if (typeof lastUpload === 'number') entry.lastUpload = lastUpload;
    if (typeof uploadedBy === 'string') entry.uploadedBy = uploadedBy;
  }
}
