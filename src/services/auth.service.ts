import { api } from "@/lib/api";
import { ApiResponse, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "TENANT" | "LANDLORD";
  phone?: string;
}

export interface AuthResponseData {
  user: User;
  token?: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> {
    const response = await api.post<ApiResponse<AuthResponseData>>("/auth/register", payload);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    const response = await api.post<ApiResponse<AuthResponseData>>("/auth/login", payload);
    return response.data;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await api.post<ApiResponse<{ message: string }>>("/auth/logout");
    return response.data;
  },
};
