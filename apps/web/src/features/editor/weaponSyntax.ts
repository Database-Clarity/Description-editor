import type { EditorState, TransactionSpec } from '@codemirror/state';
import { convertWeaponTypeSyntax, hasOldWeaponTypeSyntax } from '@clarity/core';

export interface WeaponSyntaxPlan {
  /** One undoable change; absent when nothing can be converted. */
  change?: TransactionSpec;
  /** Why an old-syntax text was left unchanged, to show to the author. */
  diagnostic?: string;
}

/**
 * Plans the rewrite of old `< weapon type (…) >` blocks to `<weapons …>` blocks. Conversion only
 * happens when it renders every weapon type the same; otherwise the plan carries the reason.
 * Only the differing span is replaced, so the caret stays where it was.
 */
export function planWeaponSyntaxConversion(state: EditorState): WeaponSyntaxPlan {
  const text = state.doc.toString();
  if (!hasOldWeaponTypeSyntax(text)) return {};
  const { text: next, diagnostic } = convertWeaponTypeSyntax(text);
  if (next === text) return { diagnostic };
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
    change: {
      changes: { from: start, to: text.length - end, insert: next.slice(start, next.length - end) },
      userEvent: 'input.convert',
    },
  };
}

/** The undoable conversion change, or undefined when there is nothing (safe) to convert. */
export function weaponSyntaxConversion(state: EditorState): TransactionSpec | undefined {
  return planWeaponSyntaxConversion(state).change;
}
