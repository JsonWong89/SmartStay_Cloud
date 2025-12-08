import { create } from "zustand";

interface AuthState {
  user: {
    id?: string; 
    fullName: string;
    email: string;
    role: string;
    phone?: string; 
  } | null;

  setUser: (user: { id?: string; fullName: string; email: string; role: string; phone?: string }) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Default: no user logged in

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),
}));
