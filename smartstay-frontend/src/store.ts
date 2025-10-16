import { create } from "zustand";

// ✅ Define the structure of your global state
interface AuthState {
  // The currently logged-in user's info
  user: {
    fullName: string;
    email: string;
    role: string;
  } | null;

  // --- Actions ---
  // Save user info after login or register
  setUser: (user: { fullName: string; email: string; role: string }) => void;

  // Clear user info when logged out
  clearUser: () => void;
}

// ✅ Create Zustand store
export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Default: no user logged in

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),
}));
