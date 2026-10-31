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

/**
 * Validation of weapon-type sections in authored text; line numbers refer to `text`.
 * The main body and every `title … ( … )` declaration are separate scopes, as the parser
 * treats them, so each may have its own `other` block.
 */
export function validateWeaponSections(text: string): WeaponSectionIssue[] {
  const clean = blankComments(text).replace(/\r/g, '');
  const lines = clean.split('\n');
  const main = [...lines];
  const scopes: { first: number; text: string }[] = [];
  for (const match of clean.matchAll(/^title .+ \([^]*?\n\)$/gm)) {
    const first = clean.slice(0, match.index).split('\n').length - 1;
    const length = match[0].split('\n').length;
    // The declaration's own header and closing lines are not part of its body.
    scopes.push({ first: first + 1, text: lines.slice(first + 1, first + length - 1).join('\n') });
    main.fill('', first, first + length);
  }
  scopes.unshift({ first: 0, text: main.join('\n') });
  const issues = scopes.flatMap(({ first, text: scope }) =>
    scanWeaponSections(scope).issues.map((issue) => ({ ...issue, line: issue.line + first })),
  );
  lines.forEach((content, index) => {
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

/** Blanks comments with spaces, keeping every character position and newline. */
function maskComments(text: string): string {
  const blank = (comment: string) => comment.replace(/[^\r\n]/g, ' ');
  return text.replace(/\/\*[^]*?\*\//g, blank).replace(/^ *\/\/.*$| +\/\/.*$/gm, blank);
}

interface LegacyGroup {
  /** Canonical (or unknown, as written) names of the header; empty for `other`. */
  names: string[];
  other: boolean;
  /** Types this group covers in the old syntax (`other` = what earlier groups of its chain left). */
  covers: string[];
  /** Comment text that followed the header and terminator on their lines. */
  headerTail: string;
  body: string[];
}

/** The one old `other` group (if any) whose set the text-wide new `other` still reproduces. */
function keptOther(groups: LegacyGroup[], named: Set<string>): LegacyGroup | undefined {
  const others = groups.filter((group) => group.other);
  // Explicit blocks name types too, so each candidate is checked against the rest being explicit.
  return others.find((group) => {
    const taken = new Set(named);
    for (const rest of others) {
      if (rest !== group) for (const name of rest.covers) taken.add(name);
    }
    const complement = markupWeaponTypes.filter((name) => !taken.has(name));
    return (
      complement.length === group.covers.length &&
      complement.every((name) => group.covers.includes(name))
    );
  });
}

/** Writes one old chain as new blocks; `terminatorTail` is a comment after the old `<$$>`. */
function migratedChain(groups: LegacyGroup[], terminatorTail: string, keeper?: LegacyGroup) {
  const blocks = groups.flatMap((group) => {
    const header = !group.other
      ? group.names.join(', ')
      : group === keeper
        ? 'other'
        : group.covers.join(', ');
    // An old `other` that nothing could match is dead text and cannot be named.
    if (group.other && !header) return [];
    return [`<weapons ${header}>${group.headerTail}`, ...group.body, '</weapons>'];
  });
  if (blocks.length) blocks[blocks.length - 1] += terminatorTail;
  return blocks;
}

/**
 * Rewrites old `< weapon type (HC) > … < (Bow) > … <$$>` blocks to `<weapons …>` blocks.
 * Pure and idempotent; text that has no old block is returned unchanged. Comments are kept
 * and never read as structure. The old `other` covered what earlier groups of its chain left;
 * where the new text-wide `other` would differ, the block lists its types instead.
 */
export function migrateWeaponTypeSyntax(text: string): string {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const masked = maskComments(text)
    .split(/\r?\n/)
    // A line that starts inside a multi-line comment is not structure.
    .map((line, index) => (lines[index].slice(0, line.search(/\S|$/)).trim() ? '' : line));
  const tailOf = (index: number) => lines[index].slice(masked[index].trimEnd().length);
  const chains: { at: number; end: number; groups: LegacyGroup[] }[] = [];
  const named = new Set<string>();
  for (const line of masked) {
    // Blocks already in the new syntax count towards what the new `other` leaves out.
    for (const name of splitNames(openTag.exec(line)?.[1])) {
      const canonical = canonicalWeaponType(name);
      if (canonical) named.add(canonical);
    }
  }
  for (let index = 0; index < lines.length; index++) {
    if (!oldOpen.test(masked[index])) continue;
    let end = index + 1;
    while (end < lines.length && !oldTerminator.test(masked[end])) end++;
    if (end >= lines.length || !oldHeader.test(masked[index])) continue;
    const groups: LegacyGroup[] = [];
    let left = [...markupWeaponTypes];
    for (let cursor = index; cursor < end; cursor++) {
      const header = oldHeader.exec(masked[cursor]);
      if (header && (cursor === index || !oldOpen.test(masked[cursor]))) {
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
        left = left.filter((type) => !names.includes(type));
        groups.push({
          names,
          other,
          covers: other ? left : names.filter((name) => markupWeaponTypes.includes(name)),
          headerTail: tailOf(cursor),
          body: [],
        });
        if (!other) for (const name of names) named.add(name);
      } else groups.at(-1)?.body.push(lines[cursor]);
    }
    chains.push({ at: index, end, groups });
    index = end;
  }
  const keeper = keptOther(
    chains.flatMap((chain) => chain.groups),
    named,
  );
  const output: string[] = [];
  let cursor = 0;
  for (const chain of chains) {
    output.push(...lines.slice(cursor, chain.at));
    output.push(...migratedChain(chain.groups, tailOf(chain.end), keeper));
    cursor = chain.end + 1;
  }
  output.push(...lines.slice(cursor));
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
