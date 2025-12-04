import { create } from "zustand";

// ✅ Define the structure of your global state
interface AuthState {
  user: {
    id?: string; // Changed to string to match backend
    fullName: string;
    email: string;
    role: string;
    phone?: string; // Add phone number
  } | null;

  setUser: (user: { id?: string; fullName: string; email: string; role: string; phone?: string }) => void;
  clearUser: () => void;
}

// ✅ Create Zustand store
export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Default: no user logged in

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),
}));
