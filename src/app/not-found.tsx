import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-muted/20">
      <Card className="max-w-md w-full text-center border-border/80 shadow-xl">
        <CardHeader className="space-y-3 pb-4">
          <div className="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5">
            <Compass className="size-10" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-1">
              404 Page Not Found
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Lost in the Neighborhood?
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              The rental page, property listing, or directory link you requested doesn&apos;t exist or has moved.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-2 text-xs text-muted-foreground">
          <p>
            Explore our curated residential catalog or return to the RentNest home page to restart your home search.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-4 border-t">
          <Link href="/properties" className="w-full">
            <Button className="w-full font-bold gap-2">
              <Compass className="size-4" />
              Browse Available Rentals
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full text-xs gap-1.5">
                <Home className="size-3.5" />
                Home
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full text-xs gap-1.5">
                <ArrowLeft className="size-3.5" />
                Dashboard
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
