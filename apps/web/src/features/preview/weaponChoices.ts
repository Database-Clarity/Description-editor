import { specializeWeaponTypes, weaponTypeNames, type MarkupLine } from '@clarity/core';

/** Select value for the labelled view; no weapon type name can collide with it. */
export const allLabelled = '*';

/** True when the text has weapon-type sections, i.e. the picker is worth showing. */
export function hasWeaponSections(lines: readonly MarkupLine[]): boolean {
  return lines.some((line) => line.weaponTypes);
}

/**
 * Weapon types to preview: the item's `weaponTypes` facts when known, else every canonical
 * type; extra tags (Grenade, Melee, …) are added when a section names them explicitly.
 */
export function weaponChoices(
  lines: readonly MarkupLine[],
  facts: readonly string[] | undefined,
): string[] {
  if (facts?.length) return [...facts];
  const named = lines.flatMap((line) => (line.weaponOther ? [] : (line.weaponTypes ?? [])));
  return [
    ...weaponTypeNames,
    ...new Set(named.filter((name) => !weaponTypeNames.some((type) => type === name))),
  ];
}

/** Lines for the selected choice: one weapon type, or every section labelled. */
export function previewLines(
  lines: readonly MarkupLine[],
  choice: string,
  facts: readonly string[] | undefined,
): MarkupLine[] {
  if (!hasWeaponSections(lines)) return [...lines];
  return choice === allLabelled
    ? specializeWeaponTypes(lines, { labelled: {}, among: facts?.length ? facts : undefined })
    : specializeWeaponTypes(lines, { type: choice });
}
