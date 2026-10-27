"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsService } from "@/services/reviews.service";
import { queryKeys } from "@/lib/query-client";
import { AppError } from "@/lib/error";
import { Button } from "@/components/ui/button";
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
import { Star, AlertCircle, Loader2, Sparkles } from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1, { message: "Please select a rating from 1 to 5 stars" }).max(5),
  comment: z
    .string()
    .min(10, { message: "Review comment must be at least 10 characters long" })
    .max(1000, { message: "Review comment cannot exceed 1000 characters" }),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormDialogProps {
  propertyId: string;
  propertyTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewFormDialog({
  propertyId,
  propertyTitle,
  open,
  onOpenChange,
}: ReviewFormDialogProps) {
  const queryClient = useQueryClient();
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (data: ReviewFormData) =>
      reviewsService.createReview({
        propertyId,
        rating: data.rating,
        comment: data.comment,
      }),
    onSuccess: () => {
      toast.success("Review published! Thank you for sharing your tenant experience.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byProperty(propertyId),
      });
      reset();
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      if (err instanceof AppError) {
        setServerError(err.message);
        toast.error(err.message);
      } else {
        const msg =
          "Unable to post review. Reviews are restricted to tenants with verified rental history.";
        setServerError(msg);
        toast.error(msg);
      }
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    setServerError(null);
    reviewMutation.mutate(data);
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setValue("rating", rating, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <Sparkles className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Tenant Experience
            </span>
          </div>
          <DialogTitle className="text-xl font-bold">Write a Rental Review</DialogTitle>
          <DialogDescription className="text-xs">
            Share your feedback about staying at {propertyTitle}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Star Rating Picker */}
          <div className="space-y-1.5 text-center p-3 rounded-xl bg-muted/30 border">
            <Label className="text-xs font-semibold block text-foreground">
              Your Overall Rating
            </Label>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled =
                  (hoverRating !== null ? hoverRating : selectedRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-muted-foreground hover:scale-110 transition-transform outline-none"
                    aria-label={`Rate ${star} stars out of 5`}
                  >
                    <Star
                      className={`size-6 ${
                        isFilled
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] font-semibold text-primary mt-1">
              {selectedRating === 5
                ? "Exceptional (5/5)"
                : selectedRating === 4
                ? "Very Good (4/5)"
                : selectedRating === 3
                ? "Average (3/5)"
                : selectedRating === 2
                ? "Below Average (2/5)"
                : "Poor (1/5)"}
            </div>
            {errors.rating && (
              <p className="text-[10px] text-destructive">{errors.rating.message}</p>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-1.5">
            <Label htmlFor="comment" className="text-xs font-semibold">
              Your Review
            </Label>
            <Textarea
              id="comment"
              placeholder="Describe property condition, landlord responsiveness, neighborhood safety, noise levels..."
              rows={4}
              {...register("comment")}
              className="text-xs resize-none"
            />
            {errors.comment && (
              <p className="text-[10px] text-destructive">{errors.comment.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
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
              disabled={reviewMutation.isPending}
              className="font-bold gap-1.5"
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Publishing Review...
                </>
              ) : (
                "Submit Verified Review"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
