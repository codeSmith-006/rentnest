"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, Home, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  const { user, isAuthenticated } = useAuthStore();
  const role = user?.role;

  const getDashboardHref = () => {
    if (!isAuthenticated || !role) return "/auth/login";
    if (role === "ADMIN") return "/dashboard/admin";
    if (role === "LANDLORD") return "/dashboard/landlord";
    return "/dashboard/tenant";
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full text-center border-border/80 shadow-xl">
        <CardHeader className="space-y-3 pb-4">
          <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto ring-8 ring-destructive/5">
            <ShieldAlert className="size-8" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive mb-1">
              403 Forbidden
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Access Restricted
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              You do not have administrative or authorization permissions to view this resource with your current account role
              {role ? ` (${role})` : ""}.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-2 text-xs text-muted-foreground">
          <p>
            If you need access to this section, please sign in with an account that has the required role, or return to your designated dashboard.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-4 border-t">
          {isAuthenticated && (
            <Link href={getDashboardHref()} className="w-full">
              <Button className="w-full font-semibold gap-2">
                <LayoutDashboard className="size-4" />
                Go to My Dashboard ({role || "User"})
              </Button>
            </Link>
          )}
          <div className="grid grid-cols-2 gap-2 w-full">
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full text-xs gap-1.5">
                <Home className="size-3.5" />
                Return Home
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full text-xs gap-1.5">
                <ArrowLeft className="size-3.5" />
                Switch Account
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
