import { ReactNode } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-muted/20 text-foreground relative">
      {/* Top Navbar */}
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b bg-background/60 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
            <Home className="size-4" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Rent<span className="text-primary/90">Nest</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Return to Marketplace
          </Link>
        </div>
      </header>

      {/* Center Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t bg-background/40">
        © 2026 RentNest Inc. All rights reserved.
      </footer>
    </div>
  );
}
