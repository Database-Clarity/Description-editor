import { markupImports } from '../markup/prepare.js';

// Compendium approval equivalence only; never use for publication or source hashes.
export function normaliseCompendiumEnglish(text: string): string {
  if (!text.includes('<enhanced/>')) return text;
  const imports = markupImports(text).length > 0;
  const variables = new Set([...text.matchAll(/^\s*var\s+(e\d+)\s*=/gm)].map((match) => match[1]));
  return text.replace(/<enhanced\/>(?![a-zA-Z])/g, (tag, offset: number) => {
    // Historical #eN arrows exist, but imports can supply a user variable.
    // Without resolving the import closure, numeric equivalence must fail closed.
    const number = /^\d+/.exec(text.slice(offset + tag.length))?.[0];
    return number && (imports || variables.has(`e${number}`)) ? tag : '#e';
  });
}
