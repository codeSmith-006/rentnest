"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Building,
  KeyRound,
  FileText,
  CreditCard,
  PlusCircle,
  Users,
  ShieldCheck,
  Compass,
  LayoutDashboard,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role || "TENANT";

  const getNavItems = (): NavItem[] => {
    if (role === "ADMIN") {
      return [
        {
          title: "Platform Overview",
          href: "/dashboard/admin",
          icon: LayoutDashboard,
        },
        {
          title: "Manage Users",
          href: "/dashboard/admin#users",
          icon: Users,
        },
        {
          title: "Property Moderation",
          href: "/dashboard/admin#properties",
          icon: ShieldCheck,
        },
        {
          title: "Explore Properties",
          href: "/properties",
          icon: Compass,
        },
      ];
    }

    if (role === "LANDLORD") {
      return [
        {
          title: "My Properties",
          href: "/dashboard/landlord",
          icon: Building,
        },
        {
          title: "Rental Requests",
          href: "/dashboard/landlord#requests",
          icon: FileText,
        },
        {
          title: "Add New Property",
          href: "/dashboard/landlord/properties/new",
          icon: PlusCircle,
        },
        {
          title: "Marketplace",
          href: "/properties",
          icon: Compass,
        },
      ];
    }

    // Default: TENANT
    return [
      {
        title: "Rental History",
        href: "/dashboard/tenant",
        icon: KeyRound,
      },
      {
        title: "Payment History",
        href: "/dashboard/tenant#payments",
        icon: CreditCard,
      },
      {
        title: "Browse Properties",
        href: "/properties",
        icon: Compass,
      },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 border-r border-border/80 bg-card hidden md:flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Brand & Role Identifier */}
      <div className="p-5 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2 group mb-3">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-xs transition group-hover:scale-105">
            <Home className="size-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">
            Rent<span className="text-primary">Nest</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5">
            {role} Workspace
          </Badge>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`size-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer info */}
      <div className="p-4 border-t border-border/60 text-xs text-muted-foreground">
        <div className="text-[11px] font-medium text-foreground">Connected to RentNest API</div>
        <div className="text-[10px] text-muted-foreground">Secure Role Session</div>
      </div>
    </aside>
  );
}
