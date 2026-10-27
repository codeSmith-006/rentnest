import { api } from "@/lib/api";
import { ApiResponse, Property, User } from "@/types";

export interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalRentals: number;
  totalVolume: number;
}

export const adminService = {
  async getUsers(params?: { search?: string; role?: string; page?: number; limit?: number }): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>("/admin/users", { params });
    return response.data;
  },

  async toggleBanUser(id: string, isBanned: boolean): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>(`/admin/users/${id}`, { isBanned });
    return response.data;
  },

  async getAllProperties(): Promise<ApiResponse<Property[]>> {
    const response = await api.get<ApiResponse<Property[]>>("/admin/properties");
    return response.data;
  },

  async deleteProperty(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/admin/properties/${id}`);
    return response.data;
  },

  async getPlatformStats(): Promise<ApiResponse<AdminStats>> {
    const response = await api.get<ApiResponse<AdminStats>>("/admin/stats");
    return response.data;
  },
};
