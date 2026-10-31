import { legacyWeaponTypeNames, markupWeaponTypes } from './syntax.js';

const openTag = /^\s*<weapons(?:\s+(.*?))?\s*>\s*$/i;
const closeTag = /^\s*<\/weapons\s*>\s*$/i;
const oldOpen = /^\s*< weapon type\b/;
const oldTerminator = /^\s*<\$\$>\s*$/;
const oldHeader = /^\s*<\s*(?:weapon type\s*)?\((.*)\)\s*>\s*$/;

export interface WeaponSectionIssue {
  severity: 'error' | 'warning';
  /** 1-based line of the original text. */
  line: number;
  message: string;
}

export type WeaponSegment =
  | { kind: 'text'; lines: string[] }
  | { kind: 'block'; types: string[]; other: boolean; lines: string[] };

const canonicalByLowercase = new Map(markupWeaponTypes.map((name) => [name.toLowerCase(), name]));

/** Canonical name for `name` (case-insensitive); old abbreviations only when `legacy` is set. */
export function canonicalWeaponType(name: string, legacy = false): string | undefined {
  const key = name.trim().replace(/\s+/g, ' ').toLowerCase();
  return canonicalByLowercase.get(key) ?? (legacy ? legacyWeaponTypeNames[key] : undefined);
}

function splitNames(list: string | undefined) {
  return (list ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

/**
 * Splits text into plain segments and `<weapons …>` blocks. Tags stand on their own line;
 * malformed structure is reported but still yields blocks for the names that are known.
 */
export function scanWeaponSections(text: string): {
  segments: WeaponSegment[];
  issues: WeaponSectionIssue[];
} {
  const issues: WeaponSectionIssue[] = [];
  const segments: WeaponSegment[] = [];
  const named = new Set<string>();
  const rawBlocks: { names: string[]; other: boolean; lines: string[] }[] = [];
  const blockSlots: number[] = [];
  let current: { names: string[]; other: boolean; lines: string[]; line: number } | undefined;
  let depth = 0;
  let plain: string[] = [];
  let others = 0;
  const flushPlain = () => {
    if (plain.length) segments.push({ kind: 'text', lines: plain });
    plain = [];
  };
  const lines = text.replace(/\r/g, '').split('\n');
  lines.forEach((content, index) => {
    const line = index + 1;
    const opening = openTag.exec(content);
    if (opening) {
      if (current) {
        depth++;
        issues.push({
          severity: 'error',
          line,
          message: `<weapons> blocks cannot be nested (opened at line ${current.line}).`,
        });
        return;
      }
      const listed = splitNames(opening[1]);
      const names: string[] = [];
      let other = false;
      if (!listed.length) {
        issues.push({
          severity: 'error',
          line,
          message: '<weapons> needs at least one weapon type or "other".',
        });
      }
      for (const name of listed) {
        if (name.toLowerCase() === 'other') {
          other = true;
          continue;
        }
        const canonical = canonicalWeaponType(name);
        if (canonical) {
          if (!names.includes(canonical)) names.push(canonical);
        } else {
          issues.push({
            severity: 'error',
            line,
            message: `Unknown weapon type "${name}". Use a Bungie weapon type such as "Hand Cannon", or "other".`,
          });
        }
      }
      if (other && listed.length > 1) {
        issues.push({
          severity: 'error',
          line,
          message: '"other" cannot be combined with weapon type names.',
        });
      }
      if (other && ++others > 1) {
        issues.push({
          severity: 'error',
          line,
          message: 'Only one <weapons other> block is allowed per tooltip.',
        });
      }
      flushPlain();
      current = { names: other ? [] : names, other, lines: [], line };
      return;
    }
    if (closeTag.test(content)) {
      if (depth > 0) {
        depth--;
      } else if (current) {
        blockSlots.push(segments.length);
        rawBlocks.push(current);
        segments.push({ kind: 'block', types: [], other: current.other, lines: current.lines });
        for (const name of current.names) named.add(name);
        current = undefined;
      } else {
        issues.push({
          severity: 'error',
          line,
          message: 'Stray </weapons> without an opening tag.',
        });
      }
      return;
    }
    (current ? current.lines : plain).push(content);
  });
  if (current) {
    issues.push({
      severity: 'error',
      line: current.line,
      message: '<weapons> is never closed; add </weapons> after its lines.',
    });
    blockSlots.push(segments.length);
    rawBlocks.push(current);
    segments.push({ kind: 'block', types: [], other: current.other, lines: current.lines });
    for (const name of current.names) named.add(name);
  }
  flushPlain();
  // `other` resolves to every name no block in this text lists, as the old syntax did.
  const complement = markupWeaponTypes.filter((name) => !named.has(name));
  blockSlots.forEach((slot, index) => {
    const raw = rawBlocks[index];
    const segment = segments[slot];
    if (segment.kind === 'block') segment.types = raw.other ? complement : raw.names;
  });
  return { segments, issues };
}

/** Replaces comments with blanks, keeping line numbers intact. */
function blankComments(text: string): string {
  return text
    .replace(/\/\*[^]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ''))
    .replace(/^ *\/\/.*$| +\/\/.*$/gm, '');
}

/** Validation of weapon-type sections in authored text; line numbers refer to `text`. */
export function validateWeaponSections(text: string): WeaponSectionIssue[] {
  const clean = blankComments(text);
  const issues = scanWeaponSections(clean).issues;
  clean
    .replace(/\r/g, '')
    .split('\n')
    .forEach((content, index) => {
      if (oldOpen.test(content)) {
        issues.push({
          severity: 'warning',
          line: index + 1,
          message:
            'Old weapon-type syntax: use <weapons Name> … </weapons>. Convert it with "Convert old weapon-type syntax".',
        });
      }
    });
  return issues.sort((a, b) => a.line - b.line);
}

export function hasOldWeaponTypeSyntax(text: string): boolean {
  return /^\s*< weapon type\b/m.test(blankComments(text));
}

/**
 * Rewrites old `< weapon type (HC) > … < (Bow) > … <$$>` blocks to `<weapons …>` blocks.
 * Pure and idempotent; text that has no old block is returned unchanged.
 */
export function migrateWeaponTypeSyntax(text: string): string {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const output: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    if (!oldOpen.test(lines[index])) {
      output.push(lines[index]);
      continue;
    }
    let end = index + 1;
    while (end < lines.length && !oldTerminator.test(lines[end])) end++;
    const first = oldHeader.exec(lines[index]);
    if (end >= lines.length || !first) {
      output.push(lines[index]);
      continue;
    }
    const groups: { names: string[]; body: string[] }[] = [];
    for (let cursor = index; cursor < end; cursor++) {
      const header = oldHeader.exec(lines[cursor]);
      if (header && (cursor === index || !oldOpen.test(lines[cursor]))) {
        const names: string[] = [];
        let other = false;
        for (const raw of splitNames(header[1])) {
          if (raw.toLowerCase() === 'other') other = true;
          else {
            // Unknown names stay as written so the new validation reports them.
            const name = canonicalWeaponType(raw, true) ?? raw;
            if (!names.includes(name)) names.push(name);
          }
        }
        groups.push({ names: other ? ['other'] : names, body: [] });
      } else groups.at(-1)?.body.push(lines[cursor]);
    }
    for (const group of groups) {
      output.push(`<weapons ${group.names.join(', ')}>`, ...group.body, '</weapons>');
    }
    index = end;
  }
  return output.join(eol);
}

/** True when a `<weapons …>` or `</weapons>` tag line is present. */
export function hasWeaponTags(text: string): boolean {
  return /^\s*<\/?weapons(\s|>)/im.test(text);
}

/** Lines as parser input: every line, including the last, ends with a newline. */
export function joinLines(lines: readonly string[]): string {
  return lines.map((line) => line + String.fromCharCode(10)).join('');
}
