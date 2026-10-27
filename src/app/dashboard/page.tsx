"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";

export default function DashboardRootPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.push("/auth/login?redirect=/dashboard");
      return;
    }

    if (user.role === "ADMIN") {
      router.push("/dashboard/admin");
    } else if (user.role === "LANDLORD") {
      router.push("/dashboard/landlord");
    } else {
      router.push("/dashboard/tenant");
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Redirecting to your role workspace...</p>
    </div>
  );
}
