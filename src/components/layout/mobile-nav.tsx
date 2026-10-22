"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { toast } from "sonner";
import {
  Menu,
  Home,
  Compass,
  Sparkles,
  HelpCircle,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  KeyRound,
  UserPlus,
} from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const handleLinkClick = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    }
    clearAuth();
    setOpen(false);
    toast.success("Successfully logged out");
    router.push("/");
  };

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/dashboard/admin"
      : user?.role === "LANDLORD"
      ? "/dashboard/landlord"
      : "/dashboard/tenant";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden size-9"
            aria-label="Open mobile navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-[85%] sm:max-w-xs flex flex-col justify-between p-6">
        <div className="space-y-6">
          <SheetHeader className="text-left pb-2 border-b">
            <SheetTitle className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <Home className="size-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">RentNest</span>
            </SheetTitle>
          </SheetHeader>

          {/* User profile card or login CTA */}
          {isAuthenticated && user ? (
            <div className="p-3 rounded-lg border bg-muted/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground truncate">
                  {user.name}
                </span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <Link href={dashboardHref} onClick={handleLinkClick}>
                <Button size="sm" className="w-full mt-1">
                  <LayoutDashboard className="size-3.5 mr-1.5" />
                  Go to {user.role} Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/auth/login" onClick={handleLinkClick}>
                <Button variant="outline" size="sm" className="w-full">
                  <KeyRound className="size-3.5 mr-1" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" onClick={handleLinkClick}>
                <Button size="sm" className="w-full">
                  <UserPlus className="size-3.5 mr-1" />
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            <Link
              href="/properties"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors text-foreground"
            >
              <Compass className="size-4 text-primary" />
              Browse Properties
            </Link>

            <Link
              href="/#featured"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors text-foreground"
            >
              <Sparkles className="size-4 text-primary" />
              Featured Rentals
            </Link>

            <Link
              href="/#how-it-works"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors text-foreground"
            >
              <HelpCircle className="size-4 text-primary" />
              How It Works
            </Link>

            <Link
              href="/dashboard/landlord/properties/create"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors text-foreground"
            >
              <PlusCircle className="size-4 text-emerald-600" />
              List a Property
            </Link>
          </nav>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Theme Mode</span>
            <ThemeToggle />
          </div>

          {isAuthenticated && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="size-4 mr-2" />
              Log Out
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
