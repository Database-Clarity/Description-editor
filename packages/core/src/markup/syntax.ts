export const markupColors = ['blue', 'green', 'purple', 'yellow', 'center', 'bold', 'pve', 'pvp'];
export const markupIcons = [
  'kinetic',
  'arc',
  'solar',
  'stasis',
  'void',
  'strand',
  'heavy',
  'primary',
  'special',
  'barrier',
  'overload',
  'unstoppable',
  'hunter',
  'titan',
  'warlock',
];
export const markupEmpty = ['background', 'breakSpaces', 'bold'];
export const markupLineClasses = [...markupColors, ...markupEmpty];
export const markupTableClasses = [
  'background_1',
  'background_2',
  'centerTable',
  'formula',
  'wide',
];
/** Bungie manifest weapon item subtype names; the canonical vocabulary of `<weapons …>` blocks. */
export const weaponTypeNames = [
  'Auto Rifle',
  'Combat Bow',
  'Fusion Rifle',
  'Glaive',
  'Grenade Launcher',
  'Hand Cannon',
  'Linear Fusion Rifle',
  'Machine Gun',
  'Pulse Rifle',
  'Rocket Launcher',
  'Scout Rifle',
  'Shotgun',
  'Sidearm',
  'Sniper Rifle',
  'Submachine Gun',
  'Sword',
  'Trace Rifle',
] as const;
/** Non-manifest tags that older tooltips scope text with (abilities and an ammo split). */
export const weaponTypeExtraTags = ['Grenade', 'Melee', 'Super', 'Heavy Grenade Launcher'] as const;
/** Every name a `<weapons …>` block may list. */
export const markupWeaponTypes: readonly string[] = [...weaponTypeNames, ...weaponTypeExtraTags];
/** Abbreviations of the old `< weapon type (…) >` syntax, lowercase, mapped to canonical names. */
export const legacyWeaponTypeNames: Readonly<Record<string, string>> = {
  ar: 'Auto Rifle',
  bow: 'Combat Bow',
  fusion: 'Fusion Rifle',
  gl: 'Grenade Launcher',
  hc: 'Hand Cannon',
  'heavy gl': 'Heavy Grenade Launcher',
  lfr: 'Linear Fusion Rifle',
  lmg: 'Machine Gun',
  pulse: 'Pulse Rifle',
  rocket: 'Rocket Launcher',
  scout: 'Scout Rifle',
  smg: 'Submachine Gun',
  sniper: 'Sniper Rifle',
  trace: 'Trace Rifle',
};

export function extractVariables(text: string): Record<string, string> {
  return Object.fromEntries(
    [...text.matchAll(/^var ([a-zA-Z0-9]+) = (.+)$/gm)].map((match) => [
      match[1],
      match[2].trim() === 'empty' ? '' : match[2].trim(),
    ]),
  );
}

export function extractBlocks(text: string, kind: 'title' | 'export'): Record<string, string> {
  const pattern =
    kind === 'title' ? /^title [A-z0-9 ]+ \([^]*?\n\)$/gm : /^export [A-z0-9 ]+ \([\s\S]*?\n\)$/gm;
  return Object.fromEntries(
    [...text.matchAll(pattern)].map(([block]) => {
      const lines = block.split('\n');
      const name = lines[0]
        .replace(kind === 'title' ? /title|\(.*/gi : /export|hidden|\(.*/gi, '')
        .trim();
      return [name, lines.slice(1, -1).join('\n')];
    }),
  );
}
import type { Lang } from '../languages.js';

export function markupLanguage(lang: Lang): string {
  return lang === 'zh-chs' ? 'zh-Hans' : lang === 'zh-cht' ? 'zh-Hant' : lang;
}
