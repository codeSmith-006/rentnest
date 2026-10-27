import { create } from "zustand";
import { User } from "@/types";
import { AUTH_TOKEN_KEY, USER_ROLE_KEY, USER_STORAGE_KEY } from "@/lib/constants";
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
      // Store cookie for server-side middleware (7 days expiry)
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `${USER_ROLE_KEY}=${user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;

      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
    }
    set({ user, token: token || null, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `${USER_ROLE_KEY}=; path=/; max-age=0; SameSite=Lax`;
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
