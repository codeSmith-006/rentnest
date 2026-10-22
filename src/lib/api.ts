import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, AUTH_TOKEN_KEY } from "./constants";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enables sending and receiving cookies across origins
});

// Request interceptor: attach token from localStorage if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: standardize error messages
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred. Please try again.";

    // If unauthorized, clean up client state when running in browser
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Keep state clean on expired or invalid token
      if (window.location.pathname.startsWith("/dashboard")) {
        // Option to redirect to login if session expired on a protected page
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
