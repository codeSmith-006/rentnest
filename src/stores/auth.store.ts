import { create } from "zustand";
import { User } from "@/types";
import { AUTH_TOKEN_KEY, USER_STORAGE_KEY } from "@/lib/constants";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token?: string) => void;
  clearAuth: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: User, token?: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      }
    }
    set({ user, token: token || null, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  initAuth: async () => {
    if (typeof window === "undefined") return;

    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

      if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        set({
          user,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });

        // Optionally revalidate session against backend /auth/me
        try {
          const res = await authService.getCurrentUser();
          if (res?.data) {
            set({ user: res.data, isAuthenticated: true });
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data));
          }
        } catch {
          // If token expired or network fails, keep local state or clear if 401
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
