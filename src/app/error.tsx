"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime error
    console.error("RentNest Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-muted/20">
      <Card className="max-w-md w-full text-center border-border/80 shadow-xl">
        <CardHeader className="space-y-3 pb-4">
          <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto ring-8 ring-destructive/5">
            <AlertTriangle className="size-8" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive mb-1">
              Application Error
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Something Went Wrong
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              An unexpected error occurred while rendering this page or communicating with the service.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 pt-2 text-xs text-muted-foreground">
          {error?.message && (
            <div className="p-3 rounded-lg bg-muted border font-mono text-[11px] text-left break-words">
              {error.message}
            </div>
          )}
          <p>
            You can attempt to recover this view by clicking the retry button below, or return safely to the home page.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button onClick={() => reset()} className="w-full font-bold gap-1.5">
            <RefreshCw className="size-3.5" />
            Try Again
          </Button>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full text-xs gap-1.5">
              <Home className="size-3.5" />
              Return Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
