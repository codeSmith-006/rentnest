"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { landlordService, PropertyInput } from "@/services/landlord.service";
import { queryKeys } from "@/lib/query-client";
import { AppError } from "@/lib/error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Building, AlertCircle, Loader2, Plus, X, ArrowLeft, Image as ImageIcon } from "lucide-react";

const propertySchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters" }),
  location: z.string().min(3, { message: "Location is required" }),
  address: z.string().optional(),
  city: z.string().optional(),
  price: z.number().min(50, { message: "Price must be at least $50" }),
  bedrooms: z.number().min(0, { message: "Bedrooms must be 0 or more" }),
  bathrooms: z.number().min(0, { message: "Bathrooms must be 0 or more" }),
  squareFeet: z.number().optional(),
  propertyType: z.string().min(1, { message: "Property type is required" }),
  category: z.string().optional(),
  isAvailable: z.boolean(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const AVAILABLE_AMENITIES = [
  "Air Conditioning",
  "Swimming Pool",
  "Gym",
  "Elevator",
  "Dedicated Parking",
  "Balcony",
  "Generator Backup",
  "Security System",
  "Furnished",
  "Pet Friendly",
  "High Speed WiFi",
  "Dishwasher",
];

export default function NewPropertyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Air Conditioning",
    "Dedicated Parking",
    "Elevator",
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      location: "Gulshan 2, Dhaka",
      address: "Road 71, Block D",
      city: "Dhaka",
      price: 1500,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1600,
      propertyType: "Apartment",
      category: "Apartment",
      isAvailable: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const payload: PropertyInput = {
        ...data,
        images,
        amenities: selectedAmenities,
      };
      return landlordService.createProperty(payload);
    },
    onSuccess: () => {
      toast.success("Property listing published successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.landlord.properties() });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      router.push("/dashboard/landlord");
    },
    onError: (err: unknown) => {
      if (err instanceof AppError) {
        setServerError(err.message);
        toast.error(err.message);
      } else {
        const fallback = "Failed to publish listing. Please try again.";
        setServerError(fallback);
        toast.error(fallback);
      }
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    setServerError(null);
    mutation.mutate(data);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard/landlord"
        className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5 transition"
      >
        <ArrowLeft className="size-3.5" /> Back to Landlord Hub
      </Link>

      <Card className="border-border/80 shadow-md">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2 mb-1 text-primary">
            <Building className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Landlord Management
            </span>
          </div>
          <CardTitle className="text-2xl font-bold">Add New Rental Listing</CardTitle>
          <CardDescription>
            Publish apartment, condominium, or luxury home availability to the marketplace
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 pt-6">
            {serverError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">
                Listing Title
              </Label>
              <Input
                id="title"
                placeholder="e.g. Spacious Lakefront 3-Bed Apartment"
                {...register("title")}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title && (
                <p className="text-[11px] text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Property Description
              </Label>
              <Textarea
                id="description"
                placeholder="Include features, balcony views, utility terms, floor plan, accessibility..."
                rows={4}
                {...register("description")}
                className="resize-none"
              />
              {errors.description && (
                <p className="text-[11px] text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Location & City & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-semibold">
                  Area / Neighborhood
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Gulshan, Dhaka"
                  {...register("location")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-semibold">
                  Street Address
                </Label>
                <Input
                  id="address"
                  placeholder="e.g. Road 12, House 4"
                  {...register("address")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-semibold">
                  Monthly Rent ($ USD)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min={1}
                  {...register("price", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Bedrooms, Bathrooms, SqFt */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bedrooms" className="text-xs font-semibold">
                  Bedrooms
                </Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min={0}
                  {...register("bedrooms", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bathrooms" className="text-xs font-semibold">
                  Bathrooms
                </Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min={0}
                  {...register("bathrooms", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="squareFeet" className="text-xs font-semibold">
                  Square Feet
                </Label>
                <Input
                  id="squareFeet"
                  type="number"
                  min={50}
                  {...register("squareFeet", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Type & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="propertyType" className="text-xs font-semibold">
                  Property Type
                </Label>
                <Input
                  id="propertyType"
                  placeholder="Apartment, Studio, Villa, Loft"
                  {...register("propertyType")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">
                  Category
                </Label>
                <Input
                  id="category"
                  placeholder="Residential, Commercial, Luxury"
                  {...register("category")}
                />
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Gallery Photo URLs ({images.length})</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Online photo URLs
                </span>
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddImage}
                  className="shrink-0"
                >
                  <Plus className="size-4 mr-1" /> Add
                </Button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ImageIcon className="size-3.5 text-primary shrink-0" />
                      <span className="truncate font-mono text-[11px] text-muted-foreground">
                        {img}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-semibold block">
                Select Amenities Included
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-2 rounded-lg text-left text-xs font-medium border transition-colors flex items-center justify-between ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border/70 hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <span className="truncate">{amenity}</span>
                      {isSelected && <span className="size-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/dashboard/landlord">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="font-bold gap-1.5"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Publishing Listing...
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Publish Listing Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
