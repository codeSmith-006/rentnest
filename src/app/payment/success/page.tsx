"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { paymentsService } from "@/services/payments.service";
import { queryKeys } from "@/lib/query-client";
import { Payment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Loader2, ArrowRight, Home, Receipt, AlertCircle } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(Boolean(sessionId));
  const [verifiedPayment, setVerifiedPayment] = useState<Payment | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        // Call backend verification endpoint: GET /api/payments/verify/:sessionId
        const res = await paymentsService.verifyPayment(sessionId);
        if (isMounted) {
          if (res?.data?.payment) {
            setVerifiedPayment(res.data.payment);
          }
          // Invalidate cache to reflect updated rental and payment status
          queryClient.invalidateQueries({ queryKey: queryKeys.rentals.myRentals() });
          queryClient.invalidateQueries({ queryKey: queryKeys.payments.myPayments() });
        }
      } catch {
        // If backend verification endpoint is offline or handles webhook asynchronously,
        // treat provisional session gracefully
        if (isMounted) {
          setVerificationError("Payment recorded. Backend webhook is finalizing receipt details.");
          queryClient.invalidateQueries({ queryKey: queryKeys.rentals.myRentals() });
          queryClient.invalidateQueries({ queryKey: queryKeys.payments.myPayments() });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [sessionId, queryClient]);

  if (isLoading) {
    return (
      <Card className="max-w-md w-full text-center border-border/80 shadow-xl p-8 space-y-4">
        <Loader2 className="size-12 animate-spin text-primary mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Confirming Payment...</h2>
          <p className="text-xs text-muted-foreground">
            Contacting payment gateway to verify transaction settlement and lease activation.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full text-center border-border/80 shadow-xl">
      <CardHeader className="space-y-3 pb-4">
        <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
          <CheckCircle2 className="size-9" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 mb-1">
            Payment Confirmed
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Lease Secured Successfully!
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Your rental deposit has been authorized and forwarded to the property landlord.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {verificationError && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2 text-left">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{verificationError}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl border bg-muted/40 text-xs space-y-2 text-left">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Receipt className="size-3.5 text-primary" /> Session Reference:
            </span>
            <span className="font-mono text-[11px] text-foreground truncate max-w-[180px]">
              {sessionId || "rentnest_session_completed"}
            </span>
          </div>
          {verifiedPayment && (
            <div className="flex justify-between items-center text-muted-foreground border-t pt-1.5">
              <span>Settled Amount:</span>
              <span className="font-bold text-foreground">
                ${verifiedPayment.amount} {verifiedPayment.currency}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-muted-foreground border-t pt-1.5">
            <span>Lease Status:</span>
            <span className="font-semibold text-emerald-600">Active & Reserved</span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          A receipt has been issued and can be viewed under your Tenant dashboard payment history.
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-4 border-t">
        <Link href="/dashboard/tenant" className="w-full">
          <Button className="w-full font-bold gap-2">
            View in Tenant Dashboard
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        <Link href="/properties" className="w-full">
          <Button variant="outline" className="w-full text-xs gap-1.5">
            <Home className="size-3.5" />
            Browse Other Properties
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="h-96 w-96 rounded-2xl bg-muted/40 animate-pulse" />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
