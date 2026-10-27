"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyRound, CreditCard, Compass, Clock, CheckCircle2 } from "lucide-react";

export default function TenantDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(" ")[0] || "Tenant"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track your rental applications, active tenancies, and payment transactions.
          </p>
        </div>
        <Link href="/properties">
          <Button size="sm" className="gap-1.5 font-bold shadow-xs">
            <Compass className="size-4" />
            Explore Properties
          </Button>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Requests
            </CardTitle>
            <Clock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">0</div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting landlord approval</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Rentals
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">0</div>
            <p className="text-[11px] text-muted-foreground mt-1">Currently occupied homes</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Invoiced
            </CardTitle>
            <CreditCard className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">$0.00</div>
            <p className="text-[11px] text-muted-foreground mt-1">Paid through RentNest</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Section Placeholder */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <KeyRound className="size-5 text-primary" />
            My Rental Applications
          </CardTitle>
          <CardDescription>
            Live status of your apartment and house rental inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed rounded-xl border-border/70">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <KeyRound className="size-6" />
            </div>
            <h3 className="font-bold text-sm text-foreground">No Rental Inquiries Yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Find an apartment or studio on the RentNest marketplace and submit your rental inquiry.
            </p>
            <Link href="/properties" className="inline-block mt-4">
              <Button size="sm" variant="outline">
                Browse Available Properties
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
