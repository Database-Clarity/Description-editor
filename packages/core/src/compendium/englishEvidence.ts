// Compendium approval equivalence only; never use for publication or source hashes.
export function normaliseCompendiumEnglish(text: string): string {
  if (!text.includes('<enhanced/>')) return text;
  const variables = new Set([...text.matchAll(/^\s*var\s+(e\d+)\s*=/gm)].map((match) => match[1]));
  return text.replace(/<enhanced\/>(?![a-zA-Z])/g, (tag, offset: number) => {
    // Historical #eN arrows exist, but a declared #eN is a user variable.
    const number = /^\d+/.exec(text.slice(offset + tag.length))?.[0];
    return number && variables.has(`e${number}`) ? tag : '#e';
  });
}
