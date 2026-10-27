"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { propertiesService } from "@/services/properties.service";
import { queryKeys } from "@/lib/query-client";
import { MOCK_FEATURED_PROPERTIES } from "@/lib/mock-data";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyGridSkeleton } from "@/components/properties/property-card-skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { RetryError } from "@/components/feedback/retry-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  Building,
  Home,
  CheckCircle2,
} from "lucide-react";
import { Property } from "@/types";

function PropertiesListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial filter values from URL search parameters
  const initialLocation = searchParams.get("location") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialMaxPrice = searchParams.get("maxPrice") || "";
  const initialBedrooms = searchParams.get("bedrooms") || "all";
  const initialSortBy = searchParams.get("sortBy") || "newest";

  const [location, setLocation] = useState(initialLocation);
  const [category, setCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [bedrooms, setBedrooms] = useState(initialBedrooms);
  const [sortBy, setSortBy] = useState(initialSortBy);

  // Active query parameters for API call
  const queryFilters = useMemo(() => {
    const filters: Record<string, unknown> = {};
    if (location.trim()) filters.location = location.trim();
    if (category !== "all") filters.category = category;
    if (maxPrice.trim()) filters.maxPrice = Number(maxPrice);
    if (bedrooms !== "all") filters.bedrooms = Number(bedrooms);
    if (sortBy === "price_asc") {
      filters.sortBy = "price";
      filters.sortOrder = "asc";
    } else if (sortBy === "price_desc") {
      filters.sortBy = "price";
      filters.sortOrder = "desc";
    }
    return filters;
  }, [location, category, maxPrice, bedrooms, sortBy]);

  // Connect to real backend API: GET /api/properties
  const {
    data: propertiesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.properties.list(queryFilters),
    queryFn: () => propertiesService.getAll(queryFilters),
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

  // Filter properties from backend or development mock fallback
  const displayedProperties = useMemo(() => {
    if (propertiesResponse?.data && propertiesResponse.data.length > 0) {
      return propertiesResponse.data;
    }

    // Fallback: apply current client filters to MOCK_FEATURED_PROPERTIES
    let list: Property[] = [...MOCK_FEATURED_PROPERTIES];

    if (location.trim()) {
      const loc = location.toLowerCase();
      list = list.filter(
        (p) =>
          p.location.toLowerCase().includes(loc) ||
          p.title.toLowerCase().includes(loc) ||
          (p.city && p.city.toLowerCase().includes(loc))
      );
    }

    if (category !== "all") {
      list = list.filter(
        (p) =>
          (p.category && p.category.toLowerCase() === category.toLowerCase()) ||
          (p.propertyType && p.propertyType.toLowerCase() === category.toLowerCase())
      );
    }

    if (maxPrice.trim()) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        list = list.filter((p) => p.price <= max);
      }
    }

    if (bedrooms !== "all") {
      const beds = Number(bedrooms);
      if (!isNaN(beds)) {
        list = list.filter((p) => p.bedrooms >= beds);
      }
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [propertiesResponse, location, category, maxPrice, bedrooms, sortBy]);

  const handleResetFilters = () => {
    setLocation("");
    setCategory("all");
    setMaxPrice("");
    setBedrooms("all");
    setSortBy("newest");
    router.push("/properties");
  };

  const hasActiveFilters =
    Boolean(location) ||
    category !== "all" ||
    Boolean(maxPrice) ||
    bedrooms !== "all" ||
    sortBy !== "newest";

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
            Discover verified rentals with transparent pricing, full amenities, and instant requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 bg-muted/30">
            {isLoading ? "Searching..." : `${displayedProperties.length} Properties Found`}
          </Badge>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-8"
            >
              <RotateCcw className="size-3 mr-1" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="p-4 rounded-2xl bg-card border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5 text-primary" /> Filter & Search
          </span>
          {propertiesResponse?.data && (
            <span className="text-[11px] text-emerald-600 flex items-center gap-1 normal-case font-normal">
              <CheckCircle2 className="size-3" /> Live API Connected
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Location input */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search location or title..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9 h-10 text-sm"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <Select value={category} onValueChange={(val) => setCategory(val ?? "all")}>
              <SelectTrigger className="h-10 text-sm w-full">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Property Types</SelectItem>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Price */}
          <div>
            <Input
              type="number"
              placeholder="Max Price ($/mo)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <Select value={bedrooms} onValueChange={(val) => setBedrooms(val ?? "all")}>
              <SelectTrigger className="h-10 text-sm w-full">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Bedrooms</SelectItem>
                <SelectItem value="1">1+ Bedrooms</SelectItem>
                <SelectItem value="2">2+ Bedrooms</SelectItem>
                <SelectItem value="3">3+ Bedrooms</SelectItem>
                <SelectItem value="4">4+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val ?? "newest")}>
              <SelectTrigger className="h-10 text-sm w-full">
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && <PropertyGridSkeleton count={6} />}

        {/* Error State with Retry Button */}
        {isError && !displayedProperties.length && (
          <RetryError
            title="Failed to load property listings"
            message={
              error instanceof Error
                ? error.message
                : "Could not connect to the backend properties endpoint."
            }
            onRetry={() => refetch()}
          />
        )}

        {/* Success Grid */}
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
            title="No properties match your search"
            description="Try adjusting your budget, location, or property type filters to see more listings."
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
