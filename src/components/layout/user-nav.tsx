"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  Building,
  KeyRound,
  FileText,
} from "lucide-react";

export function UserNav() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Backend logout might fail if offline or token expired; proceed with local clear
    }
    clearAuth();
    toast.success("Successfully logged out");
    router.push("/");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm">
            <KeyRound className="size-4 mr-1.5" />
            Sign In
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button size="sm">Get Started</Button>
        </Link>
      </div>
    );
  }

  const role = user.role;
  const dashboardHref =
    role === "ADMIN"
      ? "/dashboard/admin"
      : role === "LANDLORD"
      ? "/dashboard/landlord"
      : "/dashboard/tenant";

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "RN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-full p-0.5 outline-none hover:ring-2 hover:ring-primary/20 transition"
            aria-label="User profile and navigation menu"
          />
        }
      >
        <Avatar size="default" className="size-8 cursor-pointer ring-1 ring-border">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback className="font-semibold text-xs bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 p-2">
        <DropdownMenuLabel className="font-normal px-2 py-1.5">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold leading-none text-foreground truncate">
                {user.name}
              </p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {role}
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <div className="my-1 border-t border-border" />

        <DropdownMenuGroup>
          <Link href={dashboardHref}>
            <DropdownMenuItem className="cursor-pointer">
              <LayoutDashboard className="size-4 mr-2 text-muted-foreground" />
              <span>{role} Dashboard</span>
            </DropdownMenuItem>
          </Link>

          {role === "LANDLORD" && (
            <Link href="/dashboard/landlord/properties">
              <DropdownMenuItem className="cursor-pointer">
                <Building className="size-4 mr-2 text-muted-foreground" />
                <span>My Listings</span>
              </DropdownMenuItem>
            </Link>
          )}

          {role === "TENANT" && (
            <Link href="/dashboard/tenant/rentals">
              <DropdownMenuItem className="cursor-pointer">
                <FileText className="size-4 mr-2 text-muted-foreground" />
                <span>My Rentals</span>
              </DropdownMenuItem>
            </Link>
          )}

          <Link href="/dashboard/profile">
            <DropdownMenuItem className="cursor-pointer">
              <UserIcon className="size-4 mr-2 text-muted-foreground" />
              <span>Account Profile</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        <div className="my-1 border-t border-border" />

        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="cursor-pointer"
        >
          <LogOut className="size-4 mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
