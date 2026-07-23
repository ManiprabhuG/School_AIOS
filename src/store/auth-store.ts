import { create } from 'zustand';
import { User, UserRole } from '@/types';
import { currentUser } from '@/lib/mock-data';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  activeRole: UserRole;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: currentUser,
  isAuthenticated: true,
  activeRole: currentUser.role,
  login: (email: string, role: UserRole = 'Super Admin') => {
    set({
      user: {
        ...currentUser,
        email,
        role,
      },
      isAuthenticated: true,
      activeRole: role,
    });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  switchRole: (role: UserRole) => {
    set((state) => ({
      activeRole: role,
      user: state.user ? { ...state.user, role } : null,
    }));
  },
}));
