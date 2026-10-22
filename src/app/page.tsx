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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Home,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Server,
  Sparkles,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";

export default function HomePage() {
  const [testEmail, setTestEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTestToast = () => {
    toast.success("Design system & notification system are working!", {
      description: `Connected to API Base: ${API_BASE_URL}`,
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Home className="size-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">RentNest</span>
              <span className="hidden sm:inline-block ml-2 text-xs text-muted-foreground border px-2 py-0.5 rounded-full">
                Design System v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleTestToast}>
              <Sparkles className="size-4 mr-1.5" />
              Test Toast
            </Button>
            <Link href="/auth/login">
              <Button size="sm">
                <KeyRound className="size-4 mr-1.5" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            Phase 1 Commit 03: Reusable UI Components & Backend Layer
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Find & List Rental Properties with Ease
          </h1>
          <p className="text-lg text-muted-foreground">
            Modern, accessible UI design system ready for Tenant, Landlord, and Admin
            rental marketplace features.
          </p>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Badge variant="outline" className="gap-1.5 py-1 px-3">
              <Server className="size-3 text-primary" />
              API URL: {API_BASE_URL}
            </Badge>
          </div>
        </div>

        {/* Component Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Component Showcase */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Apartment</Badge>
                <span className="text-sm font-semibold text-primary">$1,450 / mo</span>
              </div>
              <CardTitle className="mt-2">Skyline City Residence</CardTitle>
              <CardDescription>
                Modern 2 BHK apartment in Downtown with balcony and dedicated parking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 bg-muted rounded-md">2 Beds</span>
                <span className="px-2 py-1 bg-muted rounded-md">2 Baths</span>
                <span className="px-2 py-1 bg-muted rounded-md">1,120 sqft</span>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger render={<Button size="sm" className="w-full" />}>
                  View Details & Modal
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Skyline City Residence</DialogTitle>
                    <DialogDescription>
                      Request a rental visit or inspect landlord requirements.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-2 space-y-3">
                    <p className="text-sm text-foreground">
                      This dialog is fully keyboard accessible (supports Escape, focus trap, and screen reader announcements).
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Your Email</label>
                      <Input
                        type="email"
                        placeholder="tenant@rentnest.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter showCloseButton>
                    <Button
                      size="sm"
                      onClick={() => {
                        toast.success("Rental request inquiry sent!");
                        setDialogOpen(false);
                      }}
                    >
                      Submit Inquiry
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          {/* Form & Input Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Inputs & Form Controls</CardTitle>
              <CardDescription>
                Accessible, styled inputs with focus rings and validation states.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Property Location</label>
                <Input placeholder="e.g. Dhaka, Gulshan or New York" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Budget Range</label>
                <Input placeholder="$500 - $3,000" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">Search Properties</Button>
                <Button variant="outline" size="sm">Reset</Button>
              </div>
            </CardContent>
          </Card>

          {/* Roles & Badges Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Roles & Status Badges</CardTitle>
              <CardDescription>
                Visual tokens for Tenants, Landlords, Admins, and Rental statuses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User Roles
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">TENANT</Badge>
                  <Badge variant="secondary">LANDLORD</Badge>
                  <Badge variant="outline">
                    <ShieldCheck className="size-3 mr-1" /> ADMIN
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rental Statuses
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">PENDING</Badge>
                  <Badge variant="default">APPROVED</Badge>
                  <Badge variant="destructive">REJECTED</Badge>
                  <Badge variant="outline">ACTIVE</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Showcase */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Rental Requests & Activity</CardTitle>
                <CardDescription>
                  Reusable accessible table component with row hover and responsive wrapping.
                </CardDescription>
              </div>
              <Badge variant="outline">Preview Table</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Lakeview Luxury Villa</TableCell>
                  <TableCell>John Doe (Tenant)</TableCell>
                  <TableCell>12 Months</TableCell>
                  <TableCell>$2,800</TableCell>
                  <TableCell>
                    <Badge variant="default">APPROVED</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="xs">Review</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Greenwood Studio Loft</TableCell>
                  <TableCell>Sarah Jenkins (Tenant)</TableCell>
                  <TableCell>6 Months</TableCell>
                  <TableCell>$950</TableCell>
                  <TableCell>
                    <Badge variant="secondary">PENDING</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="xs">Review</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
