import { create } from 'zustand';

export type UserRole = 'citizen' | 'dept_admin' | 'super_admin';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cityId?: string;
  departmentId?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

export const useAuthStore = create<AuthState>((set, get) => ({
  token: storedToken ?? null,
  user: storedUser ? JSON.parse(storedUser) : null,

  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },

  isAuthenticated: () => !!get().token,
}));
