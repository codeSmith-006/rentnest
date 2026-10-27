export type UserRole = "TENANT" | "LANDLORD" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isBanned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RentalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Property {
  id: string;
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
  isAvailable: boolean;
  landlordId: string;
  landlord?: Partial<User>;
  createdAt: string;
  updatedAt: string;
}

export interface RentalRequest {
  id: string;
  propertyId: string;
  property?: Property;
  tenantId: string;
  tenant?: Partial<User>;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  totalAmount: number;
  message?: string;
  paymentId?: string;
  paymentStatus?: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  rentalRequestId: string;
  rentalRequest?: RentalRequest;
  tenantId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorSources?: Array<{
    path: string | number;
    message: string;
  }>;
  stack?: string;
}

export interface PropertyFilterParams {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  category?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  isAvailable?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}
