import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), 'utf8').replace(/\s+/g, ' ');

// Alias stubs have no `editor`, so the unchanged publisher aborts on them
// (`perk.editor.en?.main`). The cut-over docs must gate on both artifacts.
describe('alias stub cut-over documentation', () => {
  it.each([
    ['core README', '../README.md'],
    ['worker README', '../../../apps/worker/README.md'],
  ])('%s requires converter, publisher and the converter-repo example', (_name, path) => {
    const text = read(path);
    expect(text).toContain('stub-aware npm converter');
    expect(text).toContain('publisher `index.ts`');
    expect(text).toContain('Live-Clarity-Database `converter`');
    expect(text).toContain('Publisher usage');
    expect(text).toContain('agents/batch4-associated');
  });
});
