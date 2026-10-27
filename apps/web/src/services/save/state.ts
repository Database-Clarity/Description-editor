import { create } from 'zustand';
import type { Change } from '../api';
import type { Drafts } from '../draftStorage';

export interface SaveReview {
  changes: Change[];
  submitted: Drafts;
}
export const useSaveState = create<{
  locked: boolean;
  review: SaveReview | null;
  close(): void;
}>((set) => ({
  locked: false,
  review: null,
  close: () => set({ locked: false, review: null }),
}));

export function reviewSaveChanges(changes: Change[], submitted: Drafts = {}): void {
  if (useSaveState.getState().locked) throw new Error('Finish the open save review first.');
  if (!changes.length) throw new Error('There are no changes to save.');
  useSaveState.setState({ locked: true, review: { changes, submitted } });
}
