import { api } from "@/lib/api";
import { ApiResponse, Property, PropertyFilterParams } from "@/types";

export interface RawPropertyData {
  id: string;
  title: string;
  description: string;
  location?: string;
  address?: string;
  city?: string;
  area?: string;
  price?: number | string;
  rent?: number | string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  squareFeet?: number | string;
  size?: number | string;
  propertyType?: string;
  category?: string | { id?: string; name?: string; slug?: string };
  categoryId?: string;
  images?: string[];
  amenities?: string[];
  isAvailable?: boolean;
  status?: string;
  landlordId?: string;
  landlord?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  _count?: { reviews?: number };
}

export function normalizeProperty(raw: RawPropertyData | Record<string, unknown>): Property {
  if (!raw) return raw as unknown as Property;

  const rentNumber = Number(raw.price ?? raw.rent ?? 0);
  const isAvail =
    raw.isAvailable !== undefined
      ? Boolean(raw.isAvailable)
      : raw.status === "AVAILABLE" || raw.status === undefined;

  const categoryName =
    typeof raw.category === "object" && raw.category !== null
      ? (raw.category as { name?: string; slug?: string }).name ||
        (raw.category as { name?: string; slug?: string }).slug ||
        "Apartment"
      : typeof raw.category === "string" && raw.category.trim()
      ? raw.category
      : typeof raw.propertyType === "string" && raw.propertyType.trim()
      ? raw.propertyType
      : "Apartment";

  const locationStr =
    (typeof raw.location === "string" && raw.location) ||
    [raw.area, raw.city].filter(Boolean).join(", ") ||
    (typeof raw.address === "string" && raw.address) ||
    "Prime Location";

  const rawImages = Array.isArray(raw.images) && raw.images.length > 0 ? (raw.images as string[]) : [];
  const defaultImages = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
  ];

  return {
    ...(raw as unknown as Property),
    id: (raw.id as string) || "",
    title: (raw.title as string) || "Untitled Property",
    description: (raw.description as string) || "",
    price: isNaN(rentNumber) ? 0 : rentNumber,
    rent: isNaN(rentNumber) ? 0 : rentNumber,
    bedrooms: Number(raw.bedrooms ?? 1),
    bathrooms: Number(raw.bathrooms ?? 1),
    squareFeet: Number(raw.squareFeet ?? raw.size ?? 0),
    size: Number(raw.size ?? raw.squareFeet ?? 0),
    isAvailable: isAvail,
    status: isAvail ? "AVAILABLE" : "UNAVAILABLE",
    propertyType: categoryName,
    category: categoryName,
    location: locationStr,
    images: rawImages.length > 0 ? rawImages : defaultImages,
    amenities: Array.isArray(raw.amenities) ? (raw.amenities as string[]) : [],
    landlordId: (raw.landlordId as string) || "",
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) || new Date().toISOString(),
  };
}

export const propertiesService = {
  async getAll(params?: PropertyFilterParams): Promise<ApiResponse<Property[]>> {
    const response = await api.get<ApiResponse<RawPropertyData[]>>("/properties", {
      params,
    });
    const rawData = response.data;
    const items = Array.isArray(rawData?.data)
      ? rawData.data.map(normalizeProperty)
      : [];
    return {
      ...rawData,
      data: items,
    };
  },

  async getById(id: string): Promise<ApiResponse<Property>> {
    const response = await api.get<ApiResponse<RawPropertyData>>(`/properties/${id}`);
    const rawData = response.data;
    return {
      ...rawData,
      data: rawData?.data ? normalizeProperty(rawData.data) : (rawData?.data as unknown as Property),
    };
  },

  async getCategories(): Promise<ApiResponse<string[]>> {
    const response = await api.get<ApiResponse<Array<string | { name?: string; slug?: string }>>>("/categories");
    const rawData = response.data;
    const list: string[] = Array.isArray(rawData?.data)
      ? rawData.data.map((cat) =>
          typeof cat === "string" ? cat : cat.name || cat.slug || ""
        )
      : [];
    return {
      ...rawData,
      data: list.filter(Boolean),
    };
  },
};
