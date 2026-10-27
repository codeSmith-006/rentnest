import { ReactNode, Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface PaymentLayoutProps {
  children: ReactNode;
}

export default function PaymentLayout({ children }: PaymentLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Suspense fallback={<div className="h-16 w-full border-b bg-background animate-pulse" />}>
        <Header />
      </Suspense>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
