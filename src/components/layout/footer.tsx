import Link from "next/link";
import { Home, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-border/80 bg-card/40 text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <Home className="size-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                RentNest
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              RentNest is a modern rental property marketplace connecting tenants and landlords
              with transparent listings, verified rental requests, and secure payment processing.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Verified listings & secure tenant protections</span>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Marketplace
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/properties" className="hover:text-foreground transition-colors">
                  All Properties
                </Link>
              </li>
              <li>
                <Link href="/properties?category=Apartment" className="hover:text-foreground transition-colors">
                  Apartments & Condos
                </Link>
              </li>
              <li>
                <Link href="/properties?category=Villa" className="hover:text-foreground transition-colors">
                  Villas & Luxury Homes
                </Link>
              </li>
              <li>
                <Link href="/properties?category=Studio" className="hover:text-foreground transition-colors">
                  Studio Spaces
                </Link>
              </li>
            </ul>
          </div>

          {/* For Landlords */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              For Landlords
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard/landlord/properties/create" className="hover:text-foreground transition-colors">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link href="/dashboard/landlord" className="hover:text-foreground transition-colors">
                  Landlord Dashboard
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-foreground transition-colors">
                  Tenant Screening
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-foreground transition-colors">
                  Become a Host
                </Link>
              </li>
            </ul>
          </div>

          {/* Tenants & Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Platform & Legal
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#how-it-works" className="hover:text-foreground transition-colors">
                  How RentNest Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard/tenant" className="hover:text-foreground transition-colors">
                  Tenant Portal
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} RentNest Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="size-3 text-red-500 fill-red-500" /> for modern living.
          </p>
        </div>
      </div>
    </footer>
  );
}
