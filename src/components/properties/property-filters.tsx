"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export interface FilterState {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  isAvailable: boolean;
  sortBy: string;
}

interface PropertyFiltersProps {
  initialFilters: FilterState;
  availableCategories: string[];
  totalResults: number;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

const COMMON_AMENITIES = [
  "Air Conditioning",
  "Swimming Pool",
  "Gym",
  "Dedicated Parking",
  "Elevator",
  "Balcony",
  "Pet Friendly",
  "High-speed WiFi",
  "Generator Backup",
  "Security System",
];

const PRICE_PRESETS = [
  { label: "< $1,000", min: "", max: "1000" },
  { label: "$1,000 - $2,000", min: "1000", max: "2000" },
  { label: "$2,000 - $3,000", min: "2000", max: "3000" },
  { label: "$3,000+", min: "3000", max: "" },
];

export function PropertyFilters({
  initialFilters,
  availableCategories,
  totalResults,
  onFilterChange,
  onReset,
}: PropertyFiltersProps) {
  const [searchInput, setSearchInput] = useState(initialFilters.search);
  const [category, setCategory] = useState(initialFilters.category);
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [bedrooms, setBedrooms] = useState(initialFilters.bedrooms);
  const [bathrooms, setBathrooms] = useState(initialFilters.bathrooms);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialFilters.amenities
  );
  const [isAvailableOnly, setIsAvailableOnly] = useState<boolean>(
    initialFilters.isAvailable
  );
  const [sortBy, setSortBy] = useState(initialFilters.sortBy);

  // Toggle for collapsible advanced filters
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Debounce search input by 400ms
  const debouncedSearch = useDebounce(searchInput, 400);

  // Update parent when any filter changes
  useEffect(() => {
    onFilterChange({
      search: debouncedSearch,
      category,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      amenities: selectedAmenities,
      isAvailable: isAvailableOnly,
      sortBy,
    });
  }, [
    debouncedSearch,
    category,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    selectedAmenities,
    isAvailableOnly,
    sortBy,
    onFilterChange,
  ]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const applyPricePreset = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleClearAll = () => {
    setSearchInput("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("all");
    setBathrooms("all");
    setSelectedAmenities([]);
    setIsAvailableOnly(false);
    setSortBy("newest");
    onReset();
  };

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    category !== "all" ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    bedrooms !== "all" ||
    bathrooms !== "all" ||
    selectedAmenities.length > 0 ||
    isAvailableOnly ||
    sortBy !== "newest";

  return (
    <div className="space-y-4">
      {/* Primary Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border shadow-xs space-y-4">
        {/* Top summary row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              Filter & Search Listings
            </span>
            <Badge variant="outline" className="text-xs ml-1">
              {totalResults} {totalResults === 1 ? "Result" : "Results"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedOpen((prev) => !prev)}
              className="text-xs h-8 gap-1.5"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>{isAdvancedOpen ? "Hide Advanced Filters" : "Advanced Filters"}</span>
              {isAdvancedOpen ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="size-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Main Search and Quick Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Debounced Search Input */}
          <div className="lg:col-span-5 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by location, city, or title (debounced)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 h-10 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search input"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Property Type / Category */}
          <div className="lg:col-span-3">
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

          {/* Max Price Quick Filter */}
          <div className="lg:col-span-2 relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="pl-8 h-10 text-sm"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="lg:col-span-2">
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

        {/* Collapsible Advanced Filters Panel */}
        {isAdvancedOpen && (
          <div className="pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Price Presets */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Price Range Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {PRICE_PRESETS.map((preset) => {
                  const isActive =
                    minPrice === preset.min && maxPrice === preset.max;
                  return (
                    <Button
                      key={preset.label}
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      size="xs"
                      onClick={() => applyPricePreset(preset.min, preset.max)}
                      className="rounded-full text-xs"
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Bedrooms & Bathrooms Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Min Price Custom Input */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Min Budget ($/mo)
                </label>
                <Input
                  type="number"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Bedrooms selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Bedrooms
                </label>
                <Select
                  value={bedrooms}
                  onValueChange={(val) => setBedrooms(val ?? "all")}
                >
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue placeholder="Any Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Bedrooms</SelectItem>
                    <SelectItem value="1">1+ Bedroom</SelectItem>
                    <SelectItem value="2">2+ Bedrooms</SelectItem>
                    <SelectItem value="3">3+ Bedrooms</SelectItem>
                    <SelectItem value="4">4+ Bedrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Bathrooms
                </label>
                <Select
                  value={bathrooms}
                  onValueChange={(val) => setBathrooms(val ?? "all")}
                >
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue placeholder="Any Bathrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Bathrooms</SelectItem>
                    <SelectItem value="1">1+ Bathroom</SelectItem>
                    <SelectItem value="2">2+ Bathrooms</SelectItem>
                    <SelectItem value="3">3+ Bathrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Availability Filter */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant={isAvailableOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAvailableOnly((prev) => !prev)}
                className="text-xs h-8 rounded-full"
              >
                {isAvailableOnly
                  ? "✓ Showing Available Properties Only"
                  : "Show Available Only"}
              </Button>
            </div>

            {/* Amenity Filter Chips */}
            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Filter by Amenities ({selectedAmenities.length} selected)
              </span>
              <div className="flex flex-wrap gap-2">
                {COMMON_AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60 hover:text-foreground"
                      }`}
                    >
                      <span>{amenity}</span>
                      {isSelected && <X className="size-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags with Single-Click Removal */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t text-xs">
            <span className="text-muted-foreground mr-1">Active filters:</span>

            {searchInput && (
              <Badge variant="secondary" className="gap-1 font-normal py-0.5">
                <span>Location: {searchInput}</span>
                <button
                  onClick={() => setSearchInput("")}
                  className="hover:text-destructive"
                  aria-label="Remove search filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {category !== "all" && (
              <Badge variant="secondary" className="gap-1 font-normal py-0.5">
                <span>Type: {category}</span>
                <button
                  onClick={() => setCategory("all")}
                  className="hover:text-destructive"
                  aria-label="Remove category filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {(minPrice || maxPrice) && (
              <Badge variant="secondary" className="gap-1 font-normal py-0.5">
                <span>
                  Price: {minPrice ? `$${minPrice}` : "$0"} -{" "}
                  {maxPrice ? `$${maxPrice}` : "Any"}
                </span>
                <button
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="hover:text-destructive"
                  aria-label="Remove price filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {bedrooms !== "all" && (
              <Badge variant="secondary" className="gap-1 font-normal py-0.5">
                <span>{bedrooms}+ Beds</span>
                <button
                  onClick={() => setBedrooms("all")}
                  className="hover:text-destructive"
                  aria-label="Remove bedrooms filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {bathrooms !== "all" && (
              <Badge variant="secondary" className="gap-1 font-normal py-0.5">
                <span>{bathrooms}+ Baths</span>
                <button
                  onClick={() => setBathrooms("all")}
                  className="hover:text-destructive"
                  aria-label="Remove bathrooms filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {isAvailableOnly && (
              <Badge variant="secondary" className="gap-1 font-normal py-0.5">
                <span>Available only</span>
                <button
                  onClick={() => setIsAvailableOnly(false)}
                  className="hover:text-destructive"
                  aria-label="Remove available only filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {selectedAmenities.map((amenity) => (
              <Badge
                key={amenity}
                variant="secondary"
                className="gap-1 font-normal py-0.5"
              >
                <span>{amenity}</span>
                <button
                  onClick={() => toggleAmenity(amenity)}
                  className="hover:text-destructive"
                  aria-label={`Remove ${amenity} filter`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
