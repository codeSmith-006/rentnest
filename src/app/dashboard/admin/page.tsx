"use client";

import { useAuthStore } from "@/stores/auth.store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Users, Building, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            System Administration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Platform governance, user management, and property listing moderation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Admin: {user?.name || "Root Admin"}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Users
            </CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">0</div>
            <p className="text-[11px] text-muted-foreground mt-1">Tenants & Landlords</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Live Listings
            </CardTitle>
            <Building className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">0</div>
            <p className="text-[11px] text-muted-foreground mt-1">Published properties</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reports & Flags
            </CardTitle>
            <AlertTriangle className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">0</div>
            <p className="text-[11px] text-muted-foreground mt-1">Pending review</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Platform Status
            </CardTitle>
            <ShieldCheck className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">OPERATIONAL</div>
            <p className="text-[11px] text-muted-foreground mt-1">All services healthy</p>
          </CardContent>
        </Card>
      </div>

      {/* Administration Shell */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Platform Moderation Hub
          </CardTitle>
          <CardDescription>
            Audit and moderate platform accounts and property submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed rounded-xl border-border/70">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Admin Console Connected</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Ready to manage tenant/landlord accounts, toggle user access status, and moderate property listings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
