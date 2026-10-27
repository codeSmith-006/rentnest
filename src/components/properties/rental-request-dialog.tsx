"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentalsService } from "@/services/rentals.service";
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
import { Calendar, AlertCircle, Loader2, DollarSign, Building } from "lucide-react";

const rentalRequestSchema = z
  .object({
    startDate: z.string().min(1, { message: "Move-in date is required" }),
    endDate: z.string().min(1, { message: "Lease end date is required" }),
    message: z
      .string()
      .max(500, { message: "Message cannot exceed 500 characters" })
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

type RentalRequestFormData = z.infer<typeof rentalRequestSchema>;

interface RentalRequestDialogProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RentalRequestDialog({
  property,
  open,
  onOpenChange,
}: RentalRequestDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-10-01");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RentalRequestFormData>({
    resolver: zodResolver(rentalRequestSchema),
    defaultValues: {
      startDate: "2026-04-01",
      endDate: "2026-10-01",
      message: "",
    },
  });

  // Approximate duration calculation
  const getMonthsDiff = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime <= 0) return 1;
    const days = diffTime / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(days / 30));
  };

  const estimatedMonths = getMonthsDiff();
  const estimatedTotal = property.price * estimatedMonths;

  const requestMutation = useMutation({
    mutationFn: (data: RentalRequestFormData) =>
      rentalsService.createRequest({
        propertyId: property.id,
        startDate: data.startDate,
        endDate: data.endDate,
        message: data.message,
      }),
    onSuccess: () => {
      toast.success(
        "Rental request submitted! The landlord will review your application."
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.myRentals() });
      reset();
      onOpenChange(false);
      router.push("/dashboard/tenant");
    },
    onError: (err: unknown) => {
      if (err instanceof AppError) {
        setServerError(err.message);
        toast.error(err.message);
      } else {
        const fallback =
          "Unable to submit rental request. Please verify your lease dates.";
        setServerError(fallback);
        toast.error(fallback);
      }
    },
  });

  const onSubmit = (data: RentalRequestFormData) => {
    setServerError(null);
    requestMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <Building className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Rental Application
            </span>
          </div>
          <DialogTitle className="text-xl font-bold">
            Request to Rent Property
          </DialogTitle>
          <DialogDescription className="text-xs">
            Submit your proposed tenancy dates for {property.title}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-xs font-semibold">
                Move-in Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                {...register("startDate")}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setValue("startDate", e.target.value, { shouldValidate: true });
                }}
                aria-invalid={Boolean(errors.startDate)}
                className={errors.startDate ? "border-destructive text-xs" : "text-xs"}
              />
              {errors.startDate && (
                <p className="text-[10px] text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-xs font-semibold">
                Lease End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                {...register("endDate")}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setValue("endDate", e.target.value, { shouldValidate: true });
                }}
                aria-invalid={Boolean(errors.endDate)}
                className={errors.endDate ? "border-destructive text-xs" : "text-xs"}
              />
              {errors.endDate && (
                <p className="text-[10px] text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Pricing Estimation Preview */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Monthly Rate:</span>
              <span className="font-semibold text-foreground">
                ${property.price.toLocaleString()} / mo
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Estimated Term:</span>
              <span className="font-semibold text-foreground">
                ~{estimatedMonths} {estimatedMonths === 1 ? "month" : "months"}
              </span>
            </div>
            <div className="border-t pt-1.5 flex justify-between font-bold text-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="size-3.5 text-primary" /> Estimated Lease Commitment:
              </span>
              <span className="text-primary">${estimatedTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Optional Message to Landlord */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs font-semibold">
              Message to Landlord <span className="font-normal text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Tell the landlord about yourself, your occupation, or special requirements..."
              rows={3}
              {...register("message")}
              className="text-xs resize-none"
            />
            {errors.message && (
              <p className="text-[10px] text-destructive">
                {errors.message.message}
              </p>
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
              disabled={requestMutation.isPending}
              className="font-bold gap-1.5"
            >
              {requestMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Calendar className="size-3.5" />
                  Confirm & Submit Inquiry
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
