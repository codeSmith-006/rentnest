import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_TOKEN_KEY, USER_ROLE_KEY } from "@/lib/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const role = request.cookies.get(USER_ROLE_KEY)?.value;
  const isAuthenticated = Boolean(token);

  // 1. Auth routes (/auth/login, /auth/register)
  // If already authenticated, redirect to their role-specific dashboard
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    if (isAuthenticated) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      } else if (role === "LANDLORD") {
        return NextResponse.redirect(new URL("/dashboard/landlord", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/tenant", request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Protected routes: /dashboard and /payment
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isPaymentRoute = pathname.startsWith("/payment");

  if (isDashboardRoute || isPaymentRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route guard for /dashboard
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    if (pathname.startsWith("/dashboard/landlord") && role !== "LANDLORD" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    if (pathname.startsWith("/dashboard/tenant") && role !== "TENANT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    // Default dashboard redirect if /dashboard accessed directly
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      } else if (role === "LANDLORD") {
        return NextResponse.redirect(new URL("/dashboard/landlord", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/tenant", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/payment/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
