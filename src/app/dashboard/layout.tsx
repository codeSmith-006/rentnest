import { ReactNode, Suspense } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Suspense fallback={<div className="h-16 w-full border-b bg-background animate-pulse" />}>
        <DashboardHeader />
      </Suspense>

      <div className="flex-1 flex">
        <Suspense fallback={<div className="w-64 border-r bg-card hidden md:block animate-pulse" />}>
          <DashboardSidebar />
        </Suspense>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
