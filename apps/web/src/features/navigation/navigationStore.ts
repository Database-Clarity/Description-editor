import { create } from 'zustand';

interface NavigationState {
  compact: boolean;
  toggleCompact: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  compact: true,
  toggleCompact: () => set((state) => ({ compact: !state.compact })),
}));
