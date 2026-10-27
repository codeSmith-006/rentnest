"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { landlordService, PropertyInput } from "@/services/landlord.service";
import { queryKeys } from "@/lib/query-client";
import { Property } from "@/types";
import { AppError } from "@/lib/error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building, AlertCircle, Loader2, Plus, X, Image as ImageIcon } from "lucide-react";

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

interface PropertyFormDialogProps {
  propertyToEdit?: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PropertyFormContent({
  propertyToEdit,
  onOpenChange,
}: {
  propertyToEdit?: Property | null;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(
    propertyToEdit?.images && propertyToEdit.images.length > 0
      ? propertyToEdit.images
      : [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    propertyToEdit?.amenities && propertyToEdit.amenities.length > 0
      ? propertyToEdit.amenities
      : ["Air Conditioning", "Dedicated Parking", "Elevator"]
  );

  const isEditMode = Boolean(propertyToEdit);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: propertyToEdit?.title || "",
      description: propertyToEdit?.description || "",
      location: propertyToEdit?.location || "",
      address: propertyToEdit?.address || "",
      city: propertyToEdit?.city || "Dhaka",
      price: Number(propertyToEdit?.price ?? propertyToEdit?.rent ?? 1200),
      bedrooms: propertyToEdit?.bedrooms ?? 2,
      bathrooms: propertyToEdit?.bathrooms ?? 2,
      squareFeet: Number(propertyToEdit?.squareFeet ?? propertyToEdit?.size ?? 1400),
      propertyType: propertyToEdit?.propertyType || (typeof (propertyToEdit?.category as unknown) === "object" && propertyToEdit?.category !== null ? ((propertyToEdit?.category as unknown) as { name?: string }).name : propertyToEdit?.category) || "Apartment",
      category: (typeof (propertyToEdit?.category as unknown) === "object" && propertyToEdit?.category !== null ? ((propertyToEdit?.category as unknown) as { name?: string }).name : propertyToEdit?.category) || "Apartment",
      isAvailable: propertyToEdit ? Boolean(propertyToEdit.isAvailable ?? propertyToEdit.status === "AVAILABLE") : true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const payload: PropertyInput = {
        ...data,
        images:
          images.length > 0
            ? images
            : [
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
              ],
        amenities: selectedAmenities,
      };

      if (isEditMode && propertyToEdit) {
        return landlordService.updateProperty(propertyToEdit.id, payload);
      }
      return landlordService.createProperty(payload);
    },
    onSuccess: () => {
      toast.success(
        isEditMode
          ? "Property updated successfully!"
          : "Property listing published successfully!"
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.landlord.properties() });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      if (err instanceof AppError) {
        setServerError(err.message);
        toast.error(err.message);
      } else {
        const fallback = "Failed to save property listing. Please try again.";
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
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-1 text-primary">
          <Building className="size-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isEditMode ? "Edit Listing" : "New Property Listing"}
          </span>
        </div>
        <DialogTitle className="text-xl font-bold">
          {isEditMode ? "Update Property Details" : "Publish New Rental Property"}
        </DialogTitle>
        <DialogDescription className="text-xs">
          Provide comprehensive specifications to attract verified tenants.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
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
            placeholder="e.g. Modern Lakeview 3-Bedroom Penthouse"
            {...register("title")}
            aria-invalid={Boolean(errors.title)}
            className="text-xs"
          />
          {errors.title && (
            <p className="text-[10px] text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-semibold">
            Full Description
          </Label>
          <Textarea
            id="description"
            placeholder="Detail floor plan, natural light, security, nearby transit, lease terms..."
            rows={3}
            {...register("description")}
            className="text-xs resize-none"
          />
          {errors.description && (
            <p className="text-[10px] text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Location & City */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-semibold">
              Neighborhood / Area
            </Label>
            <Input
              id="location"
              placeholder="e.g. Gulshan 2, Dhaka"
              {...register("location")}
              className="text-xs"
            />
            {errors.location && (
              <p className="text-[10px] text-destructive">
                {errors.location.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-semibold">
              Monthly Rent (USD)
            </Label>
            <Input
              id="price"
              type="number"
              min={1}
              placeholder="1500"
              {...register("price", { valueAsNumber: true })}
              className="text-xs"
            />
            {errors.price && (
              <p className="text-[10px] text-destructive">
                {errors.price.message}
              </p>
            )}
          </div>
        </div>

        {/* Specs: Bedrooms, Bathrooms, SqFt */}
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
              className="text-xs"
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
              className="text-xs"
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
              className="text-xs"
            />
          </div>
        </div>

        {/* Property Type & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="propertyType" className="text-xs font-semibold">
              Property Type
            </Label>
            <Input
              id="propertyType"
              placeholder="Apartment, Villa, Studio, Loft"
              {...register("propertyType")}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-semibold">
              Marketplace Category
            </Label>
            <Input
              id="category"
              placeholder="Residential, Luxury, Commercial"
              {...register("category")}
              className="text-xs"
            />
          </div>
        </div>

        {/* Image URLs */}
        <div className="space-y-2 pt-1 border-t">
          <Label className="text-xs font-semibold flex items-center justify-between">
            <span>Photo Gallery URLs ({images.length})</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Direct image link (https://...)
            </span>
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Paste high-res image URL (e.g. Unsplash or Cloudinary)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddImage}
              className="shrink-0"
            >
              <Plus className="size-4 mr-1" /> Add
            </Button>
          </div>

          {images.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
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
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Amenities Selector */}
        <div className="space-y-2 pt-1 border-t">
          <Label className="text-xs font-semibold block">
            Amenities & Facilities
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

        <DialogFooter className="pt-3 flex-col sm:flex-row gap-2 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={mutation.isPending}
            className="font-bold gap-1.5"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving Listing...
              </>
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Publish Property"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function PropertyFormDialog({
  propertyToEdit,
  open,
  onOpenChange,
}: PropertyFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        {open && (
          <PropertyFormContent
            key={propertyToEdit?.id ?? "new-property"}
            propertyToEdit={propertyToEdit}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
