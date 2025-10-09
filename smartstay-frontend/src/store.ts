import { create } from 'zustand';
import type { Role, User } from './types';

interface AuthState {
  user: User | null;
  login: (name: string, role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (name, role) => {
    const user: User = { id: crypto.randomUUID(), name, role };
    set({ user });
    // Persist to localStorage for demo/session
    localStorage.setItem('smartstay_user', JSON.stringify(user));
  },
  logout: () => {
    set({ user: null });
    localStorage.removeItem('smartstay_user');
  },
}));

// Rehydrate store from localStorage on load (simple demo persistence)
const saved = localStorage.getItem('smartstay_user');
if (saved) {
  try {
    const user = JSON.parse(saved) as User;
    useAuthStore.setState({ user });
  } catch {
    localStorage.removeItem('smartstay_user');
  }
}
