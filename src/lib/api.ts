import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, AUTH_TOKEN_KEY } from "./constants";
import { parseApiError } from "./error";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send HTTP-only session cookies
});

// Storage token helper functions
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// Request interceptor: attach Authorization header if token exists
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(parseApiError(error))
);

// Response interceptor: standardize error messages through parseApiError
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const parsed = parseApiError(error);

    // If unauthorized (401), clean up expired token
    if (parsed.status === 401 && typeof window !== "undefined") {
      removeStoredToken();
    }

    return Promise.reject(parsed);
  }
);

export default api;
