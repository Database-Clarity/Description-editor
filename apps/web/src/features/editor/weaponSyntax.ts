import type { EditorState, TransactionSpec } from '@codemirror/state';
import { hasOldWeaponTypeSyntax, migrateWeaponTypeSyntax } from '@clarity/core';

/**
 * One undoable change that rewrites old `< weapon type (…) >` blocks to `<weapons …>` blocks.
 * Only the differing span is replaced, so the caret stays where it was.
 */
export function weaponSyntaxConversion(state: EditorState): TransactionSpec | undefined {
  const text = state.doc.toString();
  if (!hasOldWeaponTypeSyntax(text)) return undefined;
  const next = migrateWeaponTypeSyntax(text);
  if (next === text) return undefined;
  let start = 0;
  while (start < text.length && start < next.length && text[start] === next[start]) start++;
  let end = 0;
  while (
    end < text.length - start &&
    end < next.length - start &&
    text[text.length - 1 - end] === next[next.length - 1 - end]
  ) {
    end++;
  }
  return {
    changes: { from: start, to: text.length - end, insert: next.slice(start, next.length - end) },
    userEvent: 'input.convert',
  };
}
