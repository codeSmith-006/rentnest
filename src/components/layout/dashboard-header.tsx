"use client";

import Link from "next/link";
import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuthStore } from "@/stores/auth.store";
import { Badge } from "@/components/ui/badge";
import { Home } from "lucide-react";

export function DashboardHeader() {
  const { user } = useAuthStore();
  const role = user?.role || "TENANT";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Mobile Logo & Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-xs">
              <Home className="size-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">
              Rent<span className="text-primary">Nest</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Dashboard</span>
            <span className="text-xs text-muted-foreground">/</span>
            <Badge variant="outline" className="text-[11px] font-semibold uppercase tracking-wider">
              {role.toLowerCase()}
            </Badge>
          </div>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-3">
          <Link
            href="/properties"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground hidden sm:inline-block"
          >
            Marketplace
          </Link>
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
