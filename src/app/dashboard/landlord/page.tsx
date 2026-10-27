"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, PlusCircle, CheckCircle2, Clock } from "lucide-react";

export default function LandlordDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Landlord Hub, {user?.name?.split(" ")[0] || "Partner"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your rental portfolio, review tenant inquiries, and control property availability.
          </p>
        </div>
        <Link href="/dashboard/landlord/properties/new">
          <Button size="sm" className="gap-1.5 font-bold shadow-xs">
            <PlusCircle className="size-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Properties
            </CardTitle>
            <Building className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">0</div>
            <p className="text-[11px] text-muted-foreground mt-1">Listed under your account</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Inquiries to Review
            </CardTitle>
            <Clock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">0</div>
            <p className="text-[11px] text-muted-foreground mt-1">Pending tenant requests</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Approved Tenancies
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">0</div>
            <p className="text-[11px] text-muted-foreground mt-1">Active tenant leases</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Section Placeholder */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Building className="size-5 text-primary" />
            Your Property Portfolio
          </CardTitle>
          <CardDescription>
            Overview of your current property listings and occupancy status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed rounded-xl border-border/70">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Building className="size-6" />
            </div>
            <h3 className="font-bold text-sm text-foreground">No Listings Added Yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Start earning by publishing your rental apartment, house, or condo to thousands of verified tenants.
            </p>
            <Link href="/dashboard/landlord/properties/new" className="inline-block mt-4">
              <Button size="sm">
                <PlusCircle className="size-4 mr-1.5" />
                Publish Your First Listing
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
