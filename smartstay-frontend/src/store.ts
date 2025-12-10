import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  userId: string;
  id?: string; 
  fullName: string;
  email: string;
  gender?:string;
  role: 'Admin' | 'Manager' | 'Receptionist' | 'Guest' | 'Hotel Manager' | 'Staff';
  phone?: string;
  hotelId?: number;
  hotelName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage');
      },
    }),
    { name: 'auth-storage' }
  )
);
