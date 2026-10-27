import { create } from 'zustand';
import { apiUrl, clearSession, getMe, type User } from '../services/api';
import { errorMessage } from '../services/http';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  load(): Promise<void>;
  logout(): void;
}

let requestId = 0;
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: Boolean(apiUrl),
  error: null,
  async load() {
    if (!apiUrl) return;
    const id = ++requestId;
    set({ loading: true, error: null });
    try {
      const user = await getMe();
      if (id === requestId) set({ user, loading: false });
    } catch (error) {
      if (id === requestId) set({ user: null, loading: false, error: errorMessage(error) });
    }
  },
  logout() {
    try {
      clearSession();
      requestId++;
      set({ user: null, loading: false, error: null });
    } catch (error) {
      set({ error: `Cannot clear session: ${errorMessage(error)}` });
    }
  },
}));
