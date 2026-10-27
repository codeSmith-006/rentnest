"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { propertiesService } from "@/services/properties.service";
import { queryKeys } from "@/lib/query-client";
import { MOCK_FEATURED_PROPERTIES } from "@/lib/mock-data";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyGridSkeleton } from "@/components/properties/property-card-skeleton";
import {
  PropertyFilters,
  FilterState,
} from "@/components/properties/property-filters";
import { EmptyState } from "@/components/feedback/empty-state";
import { RetryError } from "@/components/feedback/retry-error";
import { Badge } from "@/components/ui/badge";
import { Building, Home, CheckCircle2 } from "lucide-react";
import { Property } from "@/types";

function PropertiesListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial filters from URL query parameters
  const initialFilters: FilterState = useMemo(() => {
    const amenitiesParam = searchParams.get("amenities");
    const amenitiesList = amenitiesParam ? amenitiesParam.split(",").filter(Boolean) : [];

    return {
      search: searchParams.get("search") || searchParams.get("location") || "",
      category: searchParams.get("category") || "all",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedrooms: searchParams.get("bedrooms") || "all",
      bathrooms: searchParams.get("bathrooms") || "all",
      amenities: amenitiesList,
      isAvailable: searchParams.get("isAvailable") === "true",
      sortBy: searchParams.get("sortBy") || "newest",
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Synchronize shareable filters with URL search parameters without page reload
  const syncUrlParams = useCallback(
    (newFilters: FilterState) => {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams();
      if (newFilters.search.trim()) params.set("search", newFilters.search.trim());
      if (newFilters.category !== "all") params.set("category", newFilters.category);
      if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
      if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
      if (newFilters.bedrooms !== "all") params.set("bedrooms", newFilters.bedrooms);
      if (newFilters.bathrooms !== "all") params.set("bathrooms", newFilters.bathrooms);
      if (newFilters.amenities.length > 0)
        params.set("amenities", newFilters.amenities.join(","));
      if (newFilters.isAvailable) params.set("isAvailable", "true");
      if (newFilters.sortBy !== "newest") params.set("sortBy", newFilters.sortBy);

      const queryString = params.toString();
      const newUrl = queryString ? `/properties?${queryString}` : "/properties";

      // Update URL quietly to support sharing/bookmarking
      window.history.replaceState(null, "", newUrl);
    },
    []
  );

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      syncUrlParams(newFilters);
    },
    [syncUrlParams]
  );

  const [resetKey, setResetKey] = useState(0);

  const handleResetFilters = useCallback(() => {
    const resetState: FilterState = {
      search: "",
      category: "all",
      minPrice: "",
      maxPrice: "",
      bedrooms: "all",
      bathrooms: "all",
      amenities: [],
      isAvailable: false,
      sortBy: "newest",
    };
    setFilters(resetState);
    setResetKey((k) => k + 1);
    router.replace("/properties");
  }, [router]);

  // Construct query object for API client
  const apiQueryParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (filters.search.trim()) {
      params.search = filters.search.trim();
      params.location = filters.search.trim();
    }
    if (filters.category !== "all") params.category = filters.category;
    if (filters.minPrice) params.minPrice = Number(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
    if (filters.bedrooms !== "all") params.bedrooms = Number(filters.bedrooms);
    if (filters.bathrooms !== "all") params.bathrooms = Number(filters.bathrooms);
    if (filters.amenities.length > 0) params.amenities = filters.amenities;
    if (filters.isAvailable) params.isAvailable = true;

    if (filters.sortBy === "price_asc") {
      params.sortBy = "price";
      params.sortOrder = "asc";
    } else if (filters.sortBy === "price_desc") {
      params.sortBy = "price";
      params.sortOrder = "desc";
    }

    return params;
  }, [filters]);

  // TanStack Query: fetch from backend GET /api/properties
  const {
    data: propertiesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.properties.list(apiQueryParams),
    queryFn: () => propertiesService.getAll(apiQueryParams),
    retry: 1,
  });

  // Query categories from backend
  const { data: categoriesResponse } = useQuery({
    queryKey: queryKeys.properties.categories(),
    queryFn: () => propertiesService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const availableCategories = categoriesResponse?.data?.length
    ? categoriesResponse.data
    : ["Apartment", "Villa", "Studio", "Duplex", "Commercial"];

  // Filter properties from backend response or apply client filtering to mock fixtures
  const displayedProperties = useMemo(() => {
    if (propertiesResponse?.data && propertiesResponse.data.length > 0) {
      return propertiesResponse.data;
    }

    // Fallback: apply all advanced filters to MOCK_FEATURED_PROPERTIES
    let list: Property[] = [...MOCK_FEATURED_PROPERTIES];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          (p.city && p.city.toLowerCase().includes(q))
      );
    }

    if (filters.category !== "all") {
      const cat = filters.category.toLowerCase();
      list = list.filter(
        (p) =>
          (p.category && p.category.toLowerCase() === cat) ||
          (p.propertyType && p.propertyType.toLowerCase() === cat)
      );
    }

    if (filters.minPrice) {
      const min = Number(filters.minPrice);
      if (!isNaN(min)) list = list.filter((p) => p.price >= min);
    }

    if (filters.maxPrice) {
      const max = Number(filters.maxPrice);
      if (!isNaN(max)) list = list.filter((p) => p.price <= max);
    }

    if (filters.bedrooms !== "all") {
      const beds = Number(filters.bedrooms);
      if (!isNaN(beds)) list = list.filter((p) => p.bedrooms >= beds);
    }

    if (filters.bathrooms !== "all") {
      const baths = Number(filters.bathrooms);
      if (!isNaN(baths)) list = list.filter((p) => p.bathrooms >= baths);
    }

    if (filters.isAvailable) {
      list = list.filter((p) => p.isAvailable);
    }

    if (filters.amenities.length > 0) {
      list = list.filter((p) =>
        filters.amenities.every((amenity) =>
          p.amenities?.some((a) => a.toLowerCase() === amenity.toLowerCase())
        )
      );
    }

    if (filters.sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [propertiesResponse, filters]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            <Building className="size-3.5" /> Marketplace Listings
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Browse Rental Properties
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Discover verified rentals with transparent pricing, full amenities, and instant booking requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {propertiesResponse?.data && (
            <Badge variant="outline" className="text-xs text-emerald-600 bg-emerald-500/10 border-emerald-500/30 gap-1">
              <CheckCircle2 className="size-3" /> Live Backend
            </Badge>
          )}
          <Badge variant="outline" className="text-xs px-3 py-1 bg-muted/40">
            {isLoading ? "Searching..." : `${displayedProperties.length} Properties`}
          </Badge>
        </div>
      </div>

      {/* Advanced Filter Component */}
      <PropertyFilters
        key={resetKey}
        initialFilters={filters}
        availableCategories={availableCategories}
        totalResults={displayedProperties.length}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Listings Display Section */}
      <div className="space-y-6 pt-2">
        {/* Loading Skeletons */}
        {isLoading && <PropertyGridSkeleton count={6} />}

        {/* Error State with Retry Button */}
        {isError && displayedProperties.length === 0 && (
          <RetryError
            title="Unable to load live listings"
            message={
              error instanceof Error
                ? error.message
                : "Could not retrieve properties from the server."
            }
            onRetry={() => refetch()}
          />
        )}

        {/* Success Grid of Property Cards */}
        {!isLoading && displayedProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProperties.map((property, idx) => (
              <PropertyCard
                key={property.id}
                property={property}
                priority={idx < 3}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayedProperties.length === 0 && (
          <EmptyState
            icon={<Home className="size-6" />}
            title="No properties match your filter criteria"
            description="Try clearing some filters or widening your budget and location to explore more homes."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertyGridSkeleton count={6} />}>
      <PropertiesListContent />
    </Suspense>
  );
}
