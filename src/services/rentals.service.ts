import { api } from "@/lib/api";
import { ApiResponse, RentalRequest } from "@/types";

export interface CreateRentalRequestPayload {
  propertyId: string;
  startDate: string;
  endDate: string;
  message?: string;
}

export const rentalsService = {
  async createRequest(payload: CreateRentalRequestPayload): Promise<ApiResponse<RentalRequest>> {
    const response = await api.post<ApiResponse<RentalRequest>>("/rentals", payload);
    return response.data;
  },

  async getMyRentals(): Promise<ApiResponse<RentalRequest[]>> {
    const response = await api.get<ApiResponse<RentalRequest[]>>("/rentals");
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<RentalRequest>> {
    const response = await api.get<ApiResponse<RentalRequest>>(`/rentals/${id}`);
    return response.data;
  },

  async cancelRequest(id: string): Promise<ApiResponse<RentalRequest>> {
    const response = await api.patch<ApiResponse<RentalRequest>>(`/rentals/${id}/cancel`);
    return response.data;
  },
};
