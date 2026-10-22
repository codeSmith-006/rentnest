import { api } from "@/lib/api";
import { ApiResponse, Payment } from "@/types";

export interface CreatePaymentSessionPayload {
  rentalRequestId: string;
  gateway?: "stripe" | "sslcommerz";
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  sessionId?: string;
}

export const paymentsService = {
  async createSession(
    payload: CreatePaymentSessionPayload
  ): Promise<ApiResponse<CheckoutSessionResponse>> {
    const response = await api.post<ApiResponse<CheckoutSessionResponse>>(
      "/payments/create",
      payload
    );
    return response.data;
  },

  async getMyPayments(): Promise<ApiResponse<Payment[]>> {
    const response = await api.get<ApiResponse<Payment[]>>("/payments");
    return response.data;
  },

  async verifyPayment(
    sessionId: string
  ): Promise<ApiResponse<{ verified: boolean; payment: Payment }>> {
    const response = await api.get<ApiResponse<{ verified: boolean; payment: Payment }>>(
      `/payments/verify/${sessionId}`
    );
    return response.data;
  },
};
