"use client";

import { use, useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { propertiesService } from "@/services/properties.service";
import { queryKeys } from "@/lib/query-client";
import { MOCK_FEATURED_PROPERTIES } from "@/lib/mock-data";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Building2,
  ShieldCheck,
  User,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { RentalRequestDialog } from "@/components/properties/rental-request-dialog";
import { Property } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

function PropertyDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <Skeleton className="h-6 w-32 rounded-md" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <div className="flex gap-3">
            <Skeleton className="h-20 w-28 rounded-xl" />
            <Skeleton className="h-20 w-28 rounded-xl" />
            <Skeleton className="h-20 w-28 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-2/3 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function PropertyDetailsContent({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { user, isAuthenticated } = useAuthStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // TanStack Query to fetch property by ID from backend
  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.properties.detail(id),
    queryFn: () => propertiesService.getById(id),
    retry: 1,
  });

  // Resolve property from API or fallback mock fixtures
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  const property: Property | undefined = useMemo(() => {
    if (apiResponse?.data) return apiResponse.data;
    return MOCK_FEATURED_PROPERTIES.find((p) => p.id === id);
  }, [apiResponse, id]);

  const images =
    property?.images && property.images.length > 0
      ? property.images
      : [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        ];

  const handleRentalRequestClick = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/properties/${id}`);
      return;
    }

    if (user?.role === "LANDLORD" || user?.role === "ADMIN") {
      toast.error(`As a ${user.role}, you cannot submit tenant rental requests.`);
      return;
    }

    // Tenant is ready: open validated rental submission modal
    setIsRequestDialogOpen(true);
  };

  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (isError && !property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Building2 className="size-8" />}
          title="Property Not Found"
          description="The rental listing you are looking for does not exist, has been removed, or is currently unavailable."
          actionLabel="Back to All Properties"
          onAction={() => router.push("/properties")}
        />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Building2 className="size-8" />}
          title="Property Not Found"
          description="Invalid property ID. Please browse our active catalog."
          actionLabel="Browse Catalog"
          onAction={() => router.push("/properties")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/properties"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors gap-1.5"
        >
          <ArrowLeft className="size-4" /> Back to Properties
        </Link>
      </div>

      {/* Main Grid: Gallery + Details vs Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Gallery, Specs, Description, Amenities */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Gallery */}
          <div className="space-y-3">
            <div className="relative h-[340px] sm:h-[480px] w-full rounded-2xl overflow-hidden bg-muted border shadow-sm">
              <Image
                src={images[selectedImageIndex] || images[0]}
                alt={property.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge
                  variant="secondary"
                  className="backdrop-blur-md bg-background/90 shadow-xs font-semibold"
                >
                  {property.propertyType || property.category}
                </Badge>
                {property.isAvailable ? (
                  <Badge
                    variant="default"
                    className="bg-emerald-600/90 text-white shadow-xs"
                  >
                    Available Now
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="shadow-xs">
                    Rented
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative size-20 sm:size-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-primary ring-2 ring-primary/20 scale-102"
                        : "border-border/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Location Header */}
          <div className="space-y-2 border-b pb-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {property.title}
              </h1>
            </div>
            <p className="flex items-center gap-1.5 text-sm sm:text-base text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-primary" />
              <span>
                {property.address ? `${property.address}, ` : ""}
                {property.location}
              </span>
            </p>
          </div>

          {/* Quick Specs Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl border bg-card text-center space-y-1">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Bed className="size-4.5" />
              </div>
              <div className="font-bold text-lg text-foreground">
                {property.bedrooms}
              </div>
              <div className="text-xs text-muted-foreground">Bedrooms</div>
            </div>

            <div className="p-4 rounded-xl border bg-card text-center space-y-1">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Bath className="size-4.5" />
              </div>
              <div className="font-bold text-lg text-foreground">
                {property.bathrooms}
              </div>
              <div className="text-xs text-muted-foreground">Bathrooms</div>
            </div>

            <div className="p-4 rounded-xl border bg-card text-center space-y-1">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Maximize2 className="size-4.5" />
              </div>
              <div className="font-bold text-lg text-foreground">
                {property.squareFeet ? `${property.squareFeet}` : "—"}
              </div>
              <div className="text-xs text-muted-foreground">Square Feet</div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3 border-t pt-6">
            <h2 className="text-xl font-bold text-foreground">About this property</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Property Amenities</h2>
              <Badge variant="outline" className="text-xs">
                {property.amenities?.length || 0} Listed
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities && property.amenities.length > 0 ? (
                property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 p-3 rounded-xl border bg-muted/30 text-sm font-medium text-foreground"
                  >
                    <Sparkles className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{amenity}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground col-span-3">
                  Standard residential amenities included.
                </p>
              )}
            </div>
          </div>

          {/* Landlord Information Card */}
          <div className="border-t pt-6">
            <Card className="bg-muted/20 border-border/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Listed By Verified Landlord
                  </span>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <ShieldCheck className="size-4" /> Verified Host
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base ring-1 ring-border">
                    <User className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      {property.landlord?.name || "Verified Landlord"}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="size-3" />
                      {property.landlord?.email || "Contact via RentNest portal"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Sticky Rental Request Booking Card */}
        <div className="lg:col-span-4 sticky top-24">
          <Card className="border-border shadow-lg ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader className="border-b pb-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-foreground">
                    ${property.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground ml-1.5">
                    / month
                  </span>
                </div>
                <Badge variant={property.isAvailable ? "default" : "destructive"}>
                  {property.isAvailable ? "Available" : "Rented"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-5">
              {/* Rental Request CTA summary */}
              <div className="space-y-3 p-3.5 rounded-xl bg-muted/40 text-xs text-muted-foreground border">
                <div className="flex items-center justify-between">
                  <span>Minimum Lease:</span>
                  <span className="font-semibold text-foreground">6 Months</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Security Deposit:</span>
                  <span className="font-semibold text-foreground">1 Month Rent</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Gateway:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-600" /> Stripe
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                size="lg"
                onClick={handleRentalRequestClick}
                disabled={!property.isAvailable}
                className="w-full font-bold shadow-md h-12 text-sm"
              >
                {!isAuthenticated ? (
                  <span className="flex items-center gap-1.5">
                    <Lock className="size-4" /> Sign In to Request Rental
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-4" /> Submit Rental Request
                  </span>
                )}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                You won&apos;t be charged yet. The landlord reviews your request first. Payment is made via Stripe upon approval.
              </p>

              <div className="border-t pt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>Tenant Protection Guarantee included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Direct landlord messaging after approval</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {property && (
        <RentalRequestDialog
          property={property}
          open={isRequestDialogOpen}
          onOpenChange={setIsRequestDialogOpen}
        />
      )}
    </div>
  );
}

export default function PropertyDetailsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PropertyDetailSkeleton />}>
      <PropertyDetailsContent params={params} />
    </Suspense>
  );
}
