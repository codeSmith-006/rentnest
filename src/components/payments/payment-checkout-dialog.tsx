"use client";

import { useState } from "react";
import { RentalRequest } from "@/types";
import { paymentsService } from "@/services/payments.service";
import { AppError } from "@/lib/error";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CreditCard,
  Building,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Calendar,
  Lock,
} from "lucide-react";

interface PaymentCheckoutDialogProps {
  rental: RentalRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentCheckoutDialog({
  rental,
  open,
  onOpenChange,
}: PaymentCheckoutDialogProps) {
  const [gateway, setGateway] = useState<"stripe" | "sslcommerz">("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!rental) return null;

  const property = rental.property;

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Initiate real checkout session via backend API: POST /api/payments/create
      const response = await paymentsService.createSession({
        rentalRequestId: rental.id,
        gateway,
      });

      if (response?.data?.checkoutUrl) {
        toast.success("Payment session generated! Redirecting to secure gateway...");
        // Direct redirection to the real gateway checkout URL
        window.location.assign(response.data.checkoutUrl);
      } else {
        throw new Error("Invalid response from payment provider. No checkout URL.");
      }
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setErrorMessage(err.message);
        toast.error(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
        toast.error(err.message);
      } else {
        const msg = "Unable to initialize payment session. Please try again later.";
        setErrorMessage(msg);
        toast.error(msg);
      }
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isProcessing && onOpenChange(val)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <CreditCard className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Secure Checkout
            </span>
          </div>
          <DialogTitle className="text-xl font-bold">
            Settle Rental Lease Payment
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review lease details and proceed to the encrypted payment gateway.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Property Summary */}
          <div className="p-3.5 rounded-xl border bg-muted/30 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Building className="size-4 text-primary shrink-0" />
                  <span className="line-clamp-1">{property?.title || "Rental Property"}</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" />
                  <span>{rental.startDate} to {rental.endDate}</span>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-300 text-[10px]">
                Approved
              </Badge>
            </div>

            <div className="border-t pt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Invoiced Amount:</span>
              <span className="text-base font-extrabold text-foreground">
                ${rental.totalAmount.toLocaleString()} USD
              </span>
            </div>
          </div>

          {/* Gateway Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGateway("stripe")}
                disabled={isProcessing}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  gateway === "stripe"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs"
                    : "border-border/80 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <CreditCard className={`size-4 ${gateway === "stripe" ? "text-primary" : "text-muted-foreground"}`} />
                  {gateway === "stripe" && <span className="size-2 rounded-full bg-primary" />}
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">Stripe Checkout</div>
                  <div className="text-[10px] text-muted-foreground">Credit / Debit Card</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGateway("sslcommerz")}
                disabled={isProcessing}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  gateway === "sslcommerz"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs"
                    : "border-border/80 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Lock className={`size-4 ${gateway === "sslcommerz" ? "text-primary" : "text-muted-foreground"}`} />
                  {gateway === "sslcommerz" && <span className="size-2 rounded-full bg-primary" />}
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">SSLCommerz</div>
                  <div className="text-[10px] text-muted-foreground">Local & Regional Cards</div>
                </div>
              </button>
            </div>
          </div>

          {/* Security Assurance */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs">
            <ShieldCheck className="size-4 shrink-0" />
            <span>256-bit TLS encrypted session via verified payment partner.</span>
          </div>
        </div>

        <DialogFooter className="pt-3 flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleInitiatePayment}
            disabled={isProcessing}
            className="font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Connecting to Gateway...
              </>
            ) : (
              <>
                <CreditCard className="size-3.5" />
                Proceed to Pay (${rental.totalAmount})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
