import { QueryClient, isServer } from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute default stale time
        gcTime: 5 * 60 * 1000, // 5 minutes garbage collection time
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: always create a new QueryClient
    return makeQueryClient();
  } else {
    // Browser: create once and reuse to avoid resetting cache during re-renders
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

/**
 * Centralized query key factory for predictable caching and invalidation across the application.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    currentUser: () => [...queryKeys.auth.all, "me"] as const,
  },
  properties: {
    all: ["properties"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.properties.all, "list", filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.properties.all, "detail", id] as const,
    categories: () => [...queryKeys.properties.all, "categories"] as const,
  },
  rentals: {
    all: ["rentals"] as const,
    myRentals: () => [...queryKeys.rentals.all, "my"] as const,
    detail: (id: string) => [...queryKeys.rentals.all, "detail", id] as const,
  },
  payments: {
    all: ["payments"] as const,
    myPayments: () => [...queryKeys.payments.all, "my"] as const,
  },
  landlord: {
    all: ["landlord"] as const,
    properties: () => [...queryKeys.landlord.all, "properties"] as const,
    requests: () => [...queryKeys.landlord.all, "requests"] as const,
    stats: () => [...queryKeys.landlord.all, "stats"] as const,
  },
  admin: {
    all: ["admin"] as const,
    users: (filters?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "users", filters ?? {}] as const,
    properties: () => [...queryKeys.admin.all, "properties"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    byProperty: (propertyId: string) => [...queryKeys.reviews.all, "property", propertyId] as const,
  },
};
