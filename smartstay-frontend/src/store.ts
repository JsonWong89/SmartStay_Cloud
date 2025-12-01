import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  userId: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Receptionist';
  hotelId?: number;
  hotelName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),

      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage');
      },
    }),
    { name: 'auth-storage' }
  )
);
