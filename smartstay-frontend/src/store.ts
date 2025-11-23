import { create } from "zustand";

// ✅ Define the structure of your global state
interface AuthState {
  user: {
    id?: number; // Add ID here!
    fullName: string;
    email: string;
    role: string;
  } | null;

  setUser: (user: { id?: number; fullName: string; email: string; role: string }) => void;
  clearUser: () => void;
}

// ✅ Create Zustand store
export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Default: no user logged in

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),
}));
