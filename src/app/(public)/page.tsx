"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Search,
  MapPin,
  Building2,
  ArrowRight,
  Sparkles,
  Users,
  Home,
  ShieldCheck,
  CreditCard,
  Clock,
  Building,
} from "lucide-react";

const CATEGORIES = [
  { name: "Apartment", label: "Apartments", count: "140+ Listings", icon: Building2 },
  { name: "Villa", label: "Villas & Luxury", count: "45+ Listings", icon: Home },
  { name: "Studio", label: "Studio Flats", count: "80+ Listings", icon: Sparkles },
  { name: "Duplex", label: "Duplex Homes", count: "30+ Listings", icon: Users },
];

export default function PublicHomePage() {
  const router = useRouter();
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");

  // TanStack Query connected to real Backend endpoint: GET /api/properties
  const {
    data: propertiesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.properties.list({ isAvailable: true, limit: 6 }),
    queryFn: () => propertiesService.getAll({ isAvailable: true, limit: 6 }),
    retry: 1,
  });

  // If backend returns real properties, use them; otherwise gracefully fallback to mock data
  const realProperties = propertiesResponse?.data;
  const properties =
    realProperties && realProperties.length > 0
      ? realProperties
      : MOCK_FEATURED_PROPERTIES;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation.trim()) params.append("location", searchLocation.trim());
    if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
    if (maxPrice.trim()) params.append("maxPrice", maxPrice.trim());

    router.push(`/properties${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* 1. Hero Section & Search Interface */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 animate-in fade-in slide-in-from-top-3">
            <Sparkles className="size-3.5 text-primary" />
            Verified Properties • Instant Booking • Secure Payments
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            Discover, Rent, & Manage <br className="hidden sm:inline" />
            <span className="text-primary">Rental Properties</span> with Ease.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The next-generation rental marketplace connecting tenants and verified landlords.
            Browse listings, send rental requests, and pay with real Stripe checkout.
          </p>

          {/* Search Interface Container */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-4xl mx-auto p-3 sm:p-4 rounded-2xl bg-card border shadow-xl ring-1 ring-black/5 dark:ring-white/10"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Location Input */}
              <div className="sm:col-span-5 relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Location (e.g. Gulshan, Banani, Downtown)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-9 h-11 text-sm bg-transparent border-border focus-visible:ring-1"
                />
              </div>

              {/* Property Type Dropdown */}
              <div className="sm:col-span-3">
                <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val ?? "all")}>
                  <SelectTrigger className="h-11 w-full text-sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                    <SelectItem value="Duplex">Duplex</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Budget Input */}
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-11 text-sm bg-transparent border-border"
                />
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full h-11 shadow-sm font-semibold">
                  <Search className="size-4 mr-1.5" />
                  Search
                </Button>
              </div>
            </div>
          </form>

          {/* Quick Metrics Bar */}
          <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-3 text-center rounded-xl bg-card/60 border border-border/40">
              <div className="text-2xl font-bold text-foreground">1,200+</div>
              <div className="text-xs text-muted-foreground">Active Listings</div>
            </div>
            <div className="p-3 text-center rounded-xl bg-card/60 border border-border/40">
              <div className="text-2xl font-bold text-foreground">98%</div>
              <div className="text-xs text-muted-foreground">Verified Landlords</div>
            </div>
            <div className="p-3 text-center rounded-xl bg-card/60 border border-border/40">
              <div className="text-2xl font-bold text-foreground">4.9 / 5</div>
              <div className="text-xs text-muted-foreground">Tenant Satisfaction</div>
            </div>
            <div className="p-3 text-center rounded-xl bg-card/60 border border-border/40">
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-xs text-muted-foreground">Secure Stripe Flow</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Explore Property Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Explore Property Types
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Curated rental categories tailored to your lifestyle.
            </p>
          </div>
          <Link
            href="/properties"
            className="hidden sm:inline-flex items-center text-sm font-medium text-primary hover:underline gap-1"
          >
            All categories <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/properties?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:shadow-xs hover:border-primary/40"
              >
                <div className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.count}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Properties Section (Connected to Backend) */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              <Sparkles className="size-3.5" /> Handpicked Rentals
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Featured Properties
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Top residences with verified amenities, transparent pricing, and instant availability.
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline gap-1"
          >
            View all properties <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && <PropertyGridSkeleton count={6} />}

        {/* Error State with Retry Button */}
        {isError && !realProperties && (
          <RetryError
            title="Unable to load live listings"
            message={error instanceof Error ? error.message : "Could not connect to backend API"}
            onRetry={() => refetch()}
          />
        )}

        {/* Properties Grid */}
        {!isLoading && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 6).map((property, idx) => (
              <PropertyCard
                key={property.id}
                property={property}
                priority={idx < 3}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && properties.length === 0 && (
          <EmptyState
            title="No featured properties found"
            description="Check back soon or explore our complete property catalog."
            actionLabel="Browse Catalog"
            onAction={() => router.push("/properties")}
          />
        )}
      </section>

      {/* 4. Value Propositions / Marketplace Assurance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border bg-card/60 space-y-3">
            <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Verified Listings</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every home and landlord is audited. Detailed photos, exact addresses, and verified lease specifications.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card/60 space-y-3">
            <div className="size-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <CreditCard className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Secure Stripe Checkout</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No offline cash risks. Process rental payments with bank-grade Stripe encryption and automatic invoices.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card/60 space-y-3">
            <div className="size-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Quick Request Approvals</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Direct communication between tenants and landlords. Real-time updates and notification status in your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card p-8 sm:p-12 space-y-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="text-xs uppercase tracking-wider mb-1">
              Step-by-step
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              How RentNest Works
            </h2>
            <p className="text-sm text-muted-foreground">
              A transparent, simple 3-step rental journey for tenants and landlords.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-5 rounded-2xl bg-muted/30 border border-border/40">
              <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-xs">
                1
              </div>
              <h3 className="font-bold text-foreground text-lg">Browse & Filter</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Filter verified listings by location, budget, bedrooms, and amenities.
                Review high-resolution galleries and landlord requirements.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-muted/30 border border-border/40">
              <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-xs">
                2
              </div>
              <h3 className="font-bold text-foreground text-lg">Request Rental</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose start and end dates, add a personal inquiry message, and submit.
                Track status directly from your Tenant Dashboard.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-muted/30 border border-border/40">
              <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-xs">
                3
              </div>
              <h3 className="font-bold text-foreground text-lg">Pay Securely</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upon landlord approval, proceed to real Stripe checkout.
                Your receipt, rental status, and booking confirmation sync instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Dual Call to Action (Landlord & Tenant) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-16 -top-16 size-72 rounded-full bg-white/5 pointer-events-none" />

          <div className="space-y-3 text-center md:text-left max-w-xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
              <Building className="size-3.5" /> For Landlords & Property Managers
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to list your property and maximize occupancy?
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/80 leading-relaxed">
              Reach thousands of qualified tenants, manage rental requests, and receive direct digital payments with zero hassle.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 w-full md:w-auto relative z-10 shrink-0">
            <Link href="/dashboard/landlord/properties/create" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-semibold shadow-md">
                <Building2 className="size-4 mr-2" />
                List Your Property
              </Button>
            </Link>
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 font-semibold"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
