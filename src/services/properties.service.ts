import { api } from "@/lib/api";
import { ApiResponse, Property, PropertyFilterParams } from "@/types";

export const propertiesService = {
  async getAll(params?: PropertyFilterParams): Promise<ApiResponse<Property[]>> {
    const response = await api.get<ApiResponse<Property[]>>("/properties", {
      params,
    });
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Property>> {
    const response = await api.get<ApiResponse<Property>>(`/properties/${id}`);
    return response.data;
  },

  async getCategories(): Promise<ApiResponse<string[]>> {
    const response = await api.get<ApiResponse<string[]>>("/categories");
    return response.data;
  },
};
