"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Search,
  MapPin,
  Building2,
  ArrowRight,
  Sparkles,
  Users,
  Home,
} from "lucide-react";

const CATEGORIES = [
  { name: "Apartments", count: "140+ Listings", icon: Building2 },
  { name: "Villas & Luxury", count: "45+ Listings", icon: Home },
  { name: "Studio Flats", count: "80+ Listings", icon: Sparkles },
  { name: "Family Homes", count: "120+ Listings", icon: Users },
];

const FEATURED_PROPERTIES = [
  {
    id: "prop-1",
    title: "Skyline View Luxury Penthouse",
    location: "Gulshan 2, Dhaka",
    price: 1850,
    beds: 3,
    baths: 3,
    sqft: 2200,
    category: "Apartment",
    status: "Available",
    badgeColor: "default",
  },
  {
    id: "prop-2",
    title: "Greenwood Lakefront Villa",
    location: "Dhanmondi Lake Road, Dhaka",
    price: 2400,
    beds: 4,
    baths: 4,
    sqft: 3400,
    category: "Villa",
    status: "Featured",
    badgeColor: "secondary",
  },
  {
    id: "prop-3",
    title: "Modern Minimalist Studio",
    location: "Banani 11, Dhaka",
    price: 950,
    beds: 1,
    baths: 1,
    sqft: 750,
    category: "Studio",
    status: "Available",
    badgeColor: "outline",
  },
];

export default function PublicHomePage() {
  const [searchLocation, setSearchLocation] = useState("");

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-muted/50 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="size-3.5 text-primary" />
            Find Your Next Perfect Home with Confidence
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            Discover, Rent, & Manage <br className="hidden sm:inline" />
            <span className="text-primary">Premium Properties</span> with Ease.
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The modern rental marketplace connecting tenants and verified landlords.
            Browse listings, request rentals, and complete secure payments in minutes.
          </p>

          {/* Search Bar Container */}
          <div className="max-w-3xl mx-auto p-2 sm:p-3 rounded-2xl bg-card border shadow-lg ring-1 ring-black/5 dark:ring-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Where do you want to live? (e.g. Gulshan, Banani, Downtown)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-9 h-11 text-sm bg-transparent border-0 focus-visible:ring-0 shadow-none"
                />
              </div>

              <div className="h-6 w-px bg-border hidden sm:block" />

              <Link
                href={`/properties${searchLocation ? `?location=${encodeURIComponent(searchLocation)}` : ""}`}
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto h-11 px-6 shadow-sm">
                  <Search className="size-4 mr-2" />
                  Search Rentals
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-3 text-center">
              <div className="text-2xl font-bold text-foreground">1,200+</div>
              <div className="text-xs text-muted-foreground">Active Listings</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl font-bold text-foreground">98%</div>
              <div className="text-xs text-muted-foreground">Verified Landlords</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl font-bold text-foreground">4.9 / 5</div>
              <div className="text-xs text-muted-foreground">Tenant Satisfaction</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl font-bold text-foreground">Instant</div>
              <div className="text-xs text-muted-foreground">Digital Payments</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Explore Property Types
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Curated rental categories tailored to your lifestyle.
            </p>
          </div>
          <Link
            href="/properties"
            className="hidden sm:inline-flex items-center text-sm font-medium text-primary hover:underline gap-1"
          >
            All categories <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/properties?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:shadow-xs hover:border-primary/40"
              >
                <div className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.count}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              <Sparkles className="size-3.5" /> Handpicked
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Featured Listings
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Explore top-rated residences with verified landlords and immediate availability.
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline gap-1"
          >
            View all properties <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_PROPERTIES.map((prop) => (
            <Card key={prop.id} className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full bg-muted flex items-center justify-center">
                  <Building2 className="size-12 text-muted-foreground/30" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={prop.badgeColor as "default" | "secondary" | "outline"}>
                      {prop.category}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-semibold px-2 py-1 bg-background/90 backdrop-blur-xs rounded-md shadow-xs">
                      ${prop.price}/mo
                    </span>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {prop.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {prop.location}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-y">
                    <span>{prop.beds} Beds</span>
                    <span>•</span>
                    <span>{prop.baths} Baths</span>
                    <span>•</span>
                    <span>{prop.sqft} sqft</span>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-2">
                <Link href={`/properties/${prop.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    View Property Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border bg-card p-8 lg:p-12 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How RentNest Works
            </h2>
            <p className="text-sm text-muted-foreground">
              A transparent, simple 3-step rental journey for both tenants and landlords.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="space-y-3 p-4 rounded-xl bg-muted/30">
              <div className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto sm:mx-0">
                1
              </div>
              <h3 className="font-semibold text-foreground text-lg">Browse & Filter</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Search verified listings by location, price, property type, and amenities.
                Review landlord credentials and photo galleries.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-muted/30">
              <div className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto sm:mx-0">
                2
              </div>
              <h3 className="font-semibold text-foreground text-lg">Request Rental</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Submit rental dates and an inquiry message directly to the landlord.
                Track approval status directly inside your Tenant Dashboard.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-muted/30">
              <div className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto sm:mx-0">
                3
              </div>
              <h3 className="font-semibold text-foreground text-lg">Pay Securely</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once approved, complete payment via real Stripe Checkout.
                Your receipt, rental agreement, and status refresh instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Landlord CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary text-primary-foreground p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Are you a property owner or landlord?
            </h2>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              List your properties to thousands of verified tenants, review rental requests,
              and receive payments securely on RentNest.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/dashboard/landlord/properties/create" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Building2 className="size-4 mr-2" />
                List Your Property
              </Button>
            </Link>
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                Create Landlord Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
