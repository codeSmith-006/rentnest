import { api } from "@/lib/api";
import { ApiResponse, Review } from "@/types";

export interface CreateReviewPayload {
  propertyId: string;
  rating: number;
  comment: string;
}

export const reviewsService = {
  async getByPropertyId(propertyId: string): Promise<ApiResponse<Review[]>> {
    const response = await api.get<ApiResponse<Review[]>>(`/properties/${propertyId}/reviews`);
    return response.data;
  },

  async createReview(payload: CreateReviewPayload): Promise<ApiResponse<Review>> {
    const response = await api.post<ApiResponse<Review>>("/reviews", payload);
    return response.data;
  },
};
