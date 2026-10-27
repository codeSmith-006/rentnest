"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw, Home } from "lucide-react";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const rentalId = searchParams.get("rental_id");

  return (
    <Card className="max-w-md w-full text-center border-border/80 shadow-xl">
      <CardHeader className="space-y-3 pb-4">
        <div className="size-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
          <XCircle className="size-9" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 mb-1">
            Checkout Discontinued
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Payment Not Completed
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            The payment gateway transaction was cancelled or interrupted. You were not charged.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-2 text-xs text-muted-foreground">
        <p>
          Your rental approval remains preserved in your tenant portal. You can retry checkout anytime before the tenancy deadline.
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-4 border-t">
        <Link href="/dashboard/tenant" className="w-full">
          <Button className="w-full font-bold gap-2">
            <RefreshCw className="size-4" />
            Return to Dashboard & Retry
          </Button>
        </Link>
        <div className="grid grid-cols-2 gap-2 w-full">
          {rentalId ? (
            <Link href={`/properties/${rentalId}`} className="w-full">
              <Button variant="outline" className="w-full text-xs gap-1.5">
                <ArrowLeft className="size-3.5" />
                View Listing
              </Button>
            </Link>
          ) : (
            <Link href="/properties" className="w-full">
              <Button variant="outline" className="w-full text-xs gap-1.5">
                <Home className="size-3.5" />
                Marketplace
              </Button>
            </Link>
          )}
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full text-xs gap-1.5">
              Home
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="h-96 w-96 rounded-2xl bg-muted/40 animate-pulse" />}>
        <PaymentCancelContent />
      </Suspense>
    </div>
  );
}
