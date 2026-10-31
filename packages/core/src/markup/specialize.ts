import type { MarkupCell, MarkupLine, MarkupSpan } from './types.js';

/** Plural English labels used when a tooltip shows every weapon type's section at once. */
export const englishWeaponTypeLabels: Readonly<Record<string, string>> = {
  'Auto Rifle': 'Auto Rifles',
  'Combat Bow': 'Combat Bows',
  'Fusion Rifle': 'Fusion Rifles',
  Glaive: 'Glaives',
  'Grenade Launcher': 'Grenade Launchers',
  'Hand Cannon': 'Hand Cannons',
  'Linear Fusion Rifle': 'Linear Fusion Rifles',
  'Machine Gun': 'Machine Guns',
  'Pulse Rifle': 'Pulse Rifles',
  'Rocket Launcher': 'Rocket Launchers',
  'Scout Rifle': 'Scout Rifles',
  Shotgun: 'Shotguns',
  Sidearm: 'Sidearms',
  'Sniper Rifle': 'Sniper Rifles',
  'Submachine Gun': 'Submachine Guns',
  Sword: 'Swords',
  'Trace Rifle': 'Trace Rifles',
  Grenade: 'Grenades',
  Melee: 'Melee',
  Super: 'Supers',
  'Heavy Grenade Launcher': 'Heavy Grenade Launchers',
  other: 'Other',
};

export type WeaponTypeChoice =
  /** One weapon type: shared lines plus that type's sections, all untagged. */
  | { type: string }
  | {
      /** Display label per canonical name (merged over the English defaults). */
      labelled: Readonly<Record<string, string>>;
      /**
       * Weapon types the tooltip actually applies to. A block's label then names only the
       * types it covers among these (so an `other` block lists the remaining ones).
       */
      among?: readonly string[];
    };

function strip(line: MarkupLine): MarkupLine {
  const { weaponTypes: _types, weaponBlock: _block, weaponOther: _other, ...rest } = line;
  return rest;
}

type Apply = (lines: MarkupLine[]) => MarkupLine[];

function mapSpans(spans: MarkupSpan[] | undefined, apply: Apply) {
  return spans?.map((span) => (span.title ? { ...span, title: apply(span.title) } : span));
}

/** Applies `apply` to the lines of every title nested in the line's spans and table cells. */
function mapNested(line: MarkupLine, apply: Apply): MarkupLine {
  const result: MarkupLine = { ...line };
  if (line.linesContent) result.linesContent = mapSpans(line.linesContent, apply);
  if (line.table) {
    result.table = line.table.map((row) => ({
      ...row,
      ...(row.rowContent && {
        rowContent: row.rowContent.map((cell): MarkupCell => ({
          ...cell,
          cellContent: mapSpans(cell.cellContent, apply) ?? [],
        })),
      }),
    }));
  }
  return result;
}

function labelFor(
  line: MarkupLine,
  labels: Readonly<Record<string, string>>,
  among: readonly string[] | undefined,
): string | undefined {
  const types = line.weaponTypes ?? [];
  const relevant = among ? types.filter((type) => among.includes(type)) : types;
  if (line.weaponOther && !relevant.length) return labels.other;
  if (line.weaponOther && !among) return labels.other;
  const shown = relevant.length ? relevant : types;
  return shown.length ? shown.map((type) => labels[type] ?? type).join(', ') : undefined;
}

/**
 * Turns parsed lines with weapon-type sections into plain lines.
 * `{ type }` keeps shared lines and that type's sections. `{ labelled }` keeps everything and
 * prefixes each section's first line with its label (e.g. "Swords: ").
 */
export function specializeWeaponTypes(
  lines: readonly MarkupLine[],
  choice: WeaponTypeChoice,
): MarkupLine[] {
  if ('type' in choice) {
    const keep: Apply = (input) =>
      input
        .filter((line) => !line.weaponTypes || line.weaponTypes.includes(choice.type))
        .map((line) => mapNested(strip(line), keep));
    return keep([...lines]);
  }
  const labels = { ...englishWeaponTypeLabels, ...choice.labelled };
  const label: Apply = (input) => {
    const output: MarkupLine[] = [];
    let previous: number | undefined;
    for (const line of input) {
      const mapped = mapNested(strip(line), label);
      const first = line.weaponBlock !== undefined && line.weaponBlock !== previous;
      previous = line.weaponBlock;
      const text = first ? labelFor(line, labels, choice.among) : undefined;
      if (text === undefined) output.push(mapped);
      else if (mapped.linesContent && !mapped.table) {
        output.push({ ...mapped, linesContent: [{ text: `${text}: ` }, ...mapped.linesContent] });
      } else output.push({ linesContent: [{ text: `${text}:` }] }, mapped);
    }
    return output;
  };
  return label([...lines]);
}
