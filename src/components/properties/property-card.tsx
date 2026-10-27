"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { MapPin, Bed, Bath, Maximize2, Building2, Sparkles } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
}

export function PropertyCard({ property, priority = false }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);

  const displayImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";

  return (
    <Card className="overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all duration-300 border-border/80 hover:border-primary/40 bg-card">
      <div>
        {/* Thumbnail Image using next/image with fallback */}
        <div className="relative h-52 w-full overflow-hidden bg-muted">
          {!imageError ? (
            <Image
              src={displayImage}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              onError={() => setImageError(true)}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="size-full flex flex-col items-center justify-center bg-muted text-muted-foreground gap-2">
              <Building2 className="size-10 opacity-30" />
              <span className="text-xs">Image unavailable</span>
            </div>
          )}

          {/* Category / Type Badge */}
          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
            <Badge variant="secondary" className="backdrop-blur-md bg-background/85 shadow-xs font-medium">
              {property.propertyType ||
                (typeof (property.category as unknown) === "object" && property.category !== null
                  ? ((property.category as unknown) as { name?: string }).name
                  : property.category) ||
                "Rental"}
            </Badge>
            {property.isAvailable || property.status === "AVAILABLE" ? (
              <Badge variant="default" className="bg-emerald-600/90 text-white hover:bg-emerald-600 shadow-xs">
                Available
              </Badge>
            ) : (
              <Badge variant="destructive" className="shadow-xs">
                Rented
              </Badge>
            )}
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-3 right-3 z-10">
            <div className="px-3 py-1 rounded-lg bg-background/90 backdrop-blur-md text-foreground font-bold text-sm shadow-md border border-border/40">
              ${Number(property.price ?? property.rent ?? 0).toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardHeader className="pt-4 pb-2 space-y-1.5">
          <Link href={`/properties/${property.id}`} className="block">
            <CardTitle className="text-base sm:text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </CardTitle>
          </Link>
          <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground line-clamp-1">
            <MapPin className="size-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{property.location || [property.area, property.city].filter(Boolean).join(", ") || property.address || "Prime Location"}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 space-y-3">
          {/* Key Specs */}
          <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-muted/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate">
              <Bed className="size-3.5 text-foreground/70 shrink-0" />
              <span className="truncate">{property.bedrooms ?? 1} {property.bedrooms === 1 ? "Bed" : "Beds"}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Bath className="size-3.5 text-foreground/70 shrink-0" />
              <span className="truncate">{property.bathrooms ?? 1} {property.bathrooms === 1 ? "Bath" : "Baths"}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Maximize2 className="size-3.5 text-foreground/70 shrink-0" />
              <span className="truncate">{property.squareFeet || property.size ? `${property.squareFeet || property.size} sqft` : "Spacious"}</span>
            </div>
          </div>

          {/* Amenities Chips */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {property.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50"
                >
                  <Sparkles className="size-2.5 mr-1 text-primary/60" />
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </CardContent>
      </div>

      {/* Action Footer */}
      <CardFooter className="pt-2">
        <Link href={`/properties/${property.id}`} className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors font-medium shadow-2xs"
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
