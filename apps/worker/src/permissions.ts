import {
  hasTooltipText,
  isMarkupOnly,
  languages,
  isTextlessDescription,
  permissionsSchema,
  stableStringify,
  type Permissions,
  type Tooltip,
} from '@clarity/core';
import { HttpError } from './http.js';
import type { GitHub } from './github.js';
import type { Identity } from './types.js';

export type Access = Permissions['users'][string];

export async function permissions(github: GitHub, head: string): Promise<Permissions> {
  return permissionsSchema.parse(
    (await github.requiredFile('config/permissions.json', head)).value,
  );
}

export function requireAccess(
  config: Permissions,
  user: Identity,
  roles: Access['role'][],
): Access {
  const access = config.users[String(user.id)];
  if (!access || !roles.includes(access.role)) throw new HttpError(403, 'Permission denied');
  return access;
}

/** Export projects the user is a partner of (spec section 4); empty for everyone else. */
export function partnerProjects(config: Permissions, user: Identity): readonly string[] {
  return config.partners?.[String(user.id)]?.projects ?? [];
}

/**
 * The role `/me` reports. `users` decides; an account listed only in `partners` is a `partner`.
 * `partner` is never accepted by `requireAccess`, so every route that checks `users` denies it
 * by default; only the export routes read `partners`.
 */
export function roleOf(config: Permissions, user: Identity): Access['role'] | 'partner' | null {
  return (
    config.users[String(user.id)]?.role ?? (partnerProjects(config, user).length ? 'partner' : null)
  );
}

export function checkEdit(access: Access, base: Tooltip | null, next: Tooltip): void {
  if (isTextlessDescription(next) && (base === null || hasTooltipText(base))) {
    if (!['maintainer', 'editor'].includes(access.role))
      throw new HttpError(403, 'Only editors and maintainers can create link-only tooltips');
    if (base === null && !next.compendium)
      throw new HttpError(422, 'A text-less tooltip requires a Compendium link');
  }
  if (access.role === 'translator' && base === null)
    throw new HttpError(403, 'Translators may not create tooltips');
  // A link-only record is not an English source for translations. Check both the
  // submitted base and the real head (save calls checkEdit again after merging).
  if (
    next.hash > 3 &&
    base &&
    !hasTooltipText(base) &&
    hasTooltipText(next) &&
    !next.text.en?.text.trim()
  )
    throw new HttpError(422, 'Write English text before adding translations to this tooltip');
  if (
    JSON.stringify(base?.archive) !== JSON.stringify(next.archive) &&
    access.role !== 'maintainer' &&
    !(access.role === 'editor' && base?.archive && !next.archive)
  )
    throw new HttpError(403, 'Archive changes require maintainer role');
  const categoryChanged = base?.custom?.categoryId !== next.custom?.categoryId;
  const attachmentCategoryChange = [base?.custom?.categoryId, next.custom?.categoryId].some(
    (category) => category === 'weapon-attachment' || category === 'attachment-effect',
  );
  if (
    categoryChanged &&
    attachmentCategoryChange &&
    !['editor', 'maintainer'].includes(access.role)
  )
    throw new HttpError(403, 'Attachment category changes require editor role or higher');
  if (access.role !== 'translator') return;
  const withoutAllowed = (value: Tooltip) => ({
    ...value,
    text: Object.fromEntries(
      Object.entries(value.text).filter(
        ([lang]) => !access.languages?.includes(lang as keyof Tooltip['text']),
      ),
    ),
  });
  const original = base!;
  if (stableStringify(withoutAllowed(original)) !== stableStringify(withoutAllowed(next))) {
    throw new HttpError(403, 'Translators may change only text in their assigned languages');
  }
}

/**
 * The English revision rule (TR3 "No translation impact"). `head` is the stored tooltip the save
 * replaces, `next` what it commits. When the English text changes beyond markup:
 * - a kept English revision (same `updatedAt`) keeps every translation's outdated and 90-day
 *   fallback state, so it needs the save's `noTranslationImpact` flag and an editor or maintainer
 *   (never trials or translators), and must keep `updatedBy` too: returns 'kept' (the trailer);
 * - otherwise the new revision must be newer than the stored one: a backdated revision would
 *   keep translations current without the flag.
 * Saves without such an English change (translation-only, fields, markup-only) return 'none'
 * and ignore the flag. Their English must keep the stored revision exactly (the editor's
 * enricher does): otherwise a later save could move the stamps back and arrive at a kept
 * revision unflagged, or move them forward and flip translations to the English fallback.
 * English (re-)added to a stored tooltip that kept translations must be newer than the English
 * those translations were based on.
 */
export function checkEnglishRevision(
  access: Access,
  head: Tooltip | null,
  next: Tooltip,
  noTranslationImpact: boolean,
): 'none' | 'new' | 'kept' {
  const before = head?.text.en;
  const after = next.text.en;
  if (!after) return 'none';
  if (!before) {
    const sources = languages
      .map((lang) => (lang === 'en' ? undefined : head?.text[lang]?.sourceUpdatedAt))
      .filter((source): source is string => source !== undefined)
      .map((source) => Date.parse(source));
    if (sources.length && !(Date.parse(after.updatedAt) > Math.max(...sources)))
      throw new HttpError(
        422,
        `Tooltip ${next.hash}: the new English revision must be newer than its translations' source`,
      );
    return 'none';
  }
  if (after.text === before.text || isMarkupOnly(before.text, after.text)) {
    if (after.updatedAt !== before.updatedAt || after.updatedBy !== before.updatedBy)
      throw new HttpError(
        422,
        `Tooltip ${next.hash}: unchanged English must keep its stored revision`,
      );
    return 'none';
  }
  if (after.updatedAt === before.updatedAt) {
    if (!noTranslationImpact)
      throw new HttpError(
        422,
        `Tooltip ${next.hash}: English text changed without a new English revision`,
      );
    if (access.role !== 'maintainer' && access.role !== 'editor')
      throw new HttpError(
        403,
        'Only editors and maintainers can mark a save as having no translation impact',
      );
    if (after.updatedBy !== before.updatedBy)
      throw new HttpError(
        422,
        `Tooltip ${next.hash}: a change with no translation impact keeps the English revision author`,
      );
    return 'kept';
  }
  if (!(Date.parse(after.updatedAt) > Date.parse(before.updatedAt)))
    throw new HttpError(
      422,
      `Tooltip ${next.hash}: the new English revision must be newer than the stored one`,
    );
  return 'new';
}
