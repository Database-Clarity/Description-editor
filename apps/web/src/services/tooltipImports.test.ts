import { expect, test } from 'vitest';
import type { Tooltip } from '@clarity/core';
import { tooltipImports } from './tooltipImports';

const tooltip = (hash: number, text: string): Tooltip => ({
  hash,
  text: { en: { text, updatedAt: '2026-10-27T00:00:00Z', updatedBy: 'owner' } },
  associated: [],
});
test('editor and preview imports resolve aliases to canonical draft text, not stale alias drafts', () => {
  const imports = tooltipImports(
    { 10: tooltip(10, 'saved') },
    {
      10: { base: tooltip(10, 'saved'), next: tooltip(10, 'canonical draft') },
      20: { base: tooltip(20, 'old'), next: tooltip(20, 'stale alias draft') },
    },
    'en',
    { 20: { to: 10, kind: 'frame' }, 99: { to: 20, kind: 'sandbox' } },
  );
  expect(imports).toEqual({ 10: 'canonical draft', 20: 'canonical draft', 99: 'canonical draft' });
});
