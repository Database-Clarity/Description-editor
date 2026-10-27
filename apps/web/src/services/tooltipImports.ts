import { resolveAlias, type Aliases, type Lang, type Tooltip } from '@clarity/core';
import type { Drafts } from './draftStorage';

export function tooltipImports(
  tooltips: Record<string, Tooltip>,
  drafts: Drafts,
  lang: Lang,
  aliases: Aliases,
): Record<string, string> {
  const imports: Record<string, string> = {};
  for (const [hash, tooltip] of Object.entries(tooltips)) {
    if (resolveAlias(Number(hash), aliases) === Number(hash)) {
      imports[hash] = tooltip.text[lang]?.text ?? '';
    }
  }
  for (const [hash, draft] of Object.entries(drafts)) {
    if (resolveAlias(Number(hash), aliases) === Number(hash)) {
      imports[hash] = draft.next.text[lang]?.text ?? '';
    }
  }
  for (const hash of Object.keys(aliases)) {
    const canonical = resolveAlias(Number(hash), aliases);
    if (imports[canonical] !== undefined) imports[hash] = imports[canonical];
  }
  return imports;
}
