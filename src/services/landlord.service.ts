import { api } from "@/lib/api";
import { ApiResponse, Property, RentalRequest } from "@/types";
import { normalizeProperty, RawPropertyData } from "./properties.service";

export interface PropertyInput {
  title: string;
  description: string;
  location: string;
  address?: string;
  city?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  propertyType: string;
  category?: string;
  images: string[];
  amenities: string[];
  isAvailable?: boolean;
}

export interface LandlordStats {
  totalListings: number;
  activeRentals: number;
  pendingRequests: number;
  totalEarnings: number;
}

export const landlordService = {
  async getMyProperties(): Promise<ApiResponse<Property[]>> {
    const response = await api.get<ApiResponse<RawPropertyData[]>>("/landlord/properties");
    const rawData = response.data;
    const items = Array.isArray(rawData?.data)
      ? rawData.data.map(normalizeProperty)
      : [];
    return {
      ...rawData,
      data: items,
    };
  },

  async createProperty(data: PropertyInput): Promise<ApiResponse<Property>> {
    const response = await api.post<ApiResponse<Property>>("/landlord/properties", data);
    return response.data;
  },

  async updateProperty(id: string, data: Partial<PropertyInput>): Promise<ApiResponse<Property>> {
    const response = await api.patch<ApiResponse<Property>>(`/landlord/properties/${id}`, data);
    return response.data;
  },

  async deleteProperty(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/landlord/properties/${id}`);
    return response.data;
  },

  async getIncomingRequests(): Promise<ApiResponse<RentalRequest[]>> {
    const response = await api.get<ApiResponse<RentalRequest[]>>("/landlord/requests");
    return response.data;
  },

  async updateRequestStatus(
    id: string,
    status: "APPROVED" | "REJECTED"
  ): Promise<ApiResponse<RentalRequest>> {
    const response = await api.patch<ApiResponse<RentalRequest>>(`/landlord/requests/${id}`, {
      status,
    });
    return response.data;
  },

  async getStats(): Promise<ApiResponse<LandlordStats>> {
    const response = await api.get<ApiResponse<LandlordStats>>("/landlord/stats");
    return response.data;
  },
};
