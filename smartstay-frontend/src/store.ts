import { create } from 'zustand';
import axios from 'axios';
import type { Role, User } from './types';

interface AuthState {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
  setUser: (updated: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,


  // FIXED LOGIN
  login: async (userId: string) => {

    const res = await axios.get<{
      userId: string;
      name: string;
      fullName: string;
      role: Role;
      hotelId: number;
      hotelName: string;
    }>(`https://localhost:7168/api/users/manager/${userId}`);


    const user: User = {
      id: res.data.userId,
      name: res.data.name,                 // Display name
      fullName: res.data.fullName,         // <-- FIXED
      role: res.data.role,
      hotelId: res.data.hotelId,
      hotelName: res.data.hotelName        // <-- FIXED
    };

    set({ user });
    // Persist to localStorage for demo/session
    localStorage.setItem('smartstay_user', JSON.stringify(user));
  },
  logout: () => {
    set({ user: null });
    localStorage.removeItem('smartstay_user');
  },

  setUser: (updated) =>
    set((state) => {
      const newUser = { ...state.user, ...updated } as User;
      localStorage.setItem("smartstay_user", JSON.stringify(newUser));
      return { user: newUser };
    }),
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
