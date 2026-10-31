import { parseLines } from './lines.js';
import { prepareMarkup } from './prepare.js';
import type { MarkupDiagnostic, MarkupGlobals, MarkupLine, ParsedMarkup } from './types.js';

export * from './types.js';
export * from './syntax.js';
export {
  canonicalWeaponType,
  hasOldWeaponTypeSyntax,
  migrateWeaponTypeSyntax,
  validateWeaponSections,
  type WeaponSectionIssue,
} from './weapons.js';
export * from './specialize.js';

export function parseMarkup(
  text: string,
  globals: MarkupGlobals = { variables: '', titles: '' },
): ParsedMarkup {
  const diagnostics: MarkupDiagnostic[] = [];
  const prepared = prepareMarkup(text, globals, diagnostics);
  const titles: Record<string, MarkupLine[]> = {};
  for (const [name, content] of Object.entries(prepared.titles)) {
    titles[name] = parseLines(prepareMarkup(content, globals, diagnostics).text, {});
  }
  return { lines: parseLines(prepared.text, titles), diagnostics };
}
