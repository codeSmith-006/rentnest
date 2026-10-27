"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { landlordService } from "@/services/landlord.service";
import { queryKeys } from "@/lib/query-client";
import { MOCK_FEATURED_PROPERTIES } from "@/lib/mock-data";
import { Property } from "@/types";
import { AppError } from "@/lib/error";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyFormDialog } from "@/components/properties/property-form-dialog";
import { IncomingRequestsSection } from "@/components/landlord/incoming-requests-section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building,
  PlusCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  DollarSign,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export default function LandlordDashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // 1. Fetch Landlord Properties
  const {
    data: propertiesData,
    isLoading: isPropertiesLoading,
  } = useQuery({
    queryKey: queryKeys.landlord.properties(),
    queryFn: async () => {
      try {
        const res = await landlordService.getMyProperties();
        return res?.data || [];
      } catch {
        return MOCK_FEATURED_PROPERTIES.slice(0, 3);
      }
    },
  });

  // 2. Fetch Landlord Stats
  const { data: statsData } = useQuery({
    queryKey: queryKeys.landlord.stats(),
    queryFn: async () => {
      try {
        const res = await landlordService.getStats();
        return res?.data;
      } catch {
        return null;
      }
    },
  });

  // 3. Toggle Availability Mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      landlordService.updateProperty(id, { isAvailable }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.isAvailable
          ? "Property marked as available on marketplace."
          : "Property marked as unavailable."
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.landlord.properties() });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
    onError: (err: unknown) => {
      if (err instanceof AppError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update availability status.");
      }
    },
  });

  // 4. Delete Property Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => landlordService.deleteProperty(id),
    onSuccess: () => {
      toast.success("Property listing removed from RentNest.");
      queryClient.invalidateQueries({ queryKey: queryKeys.landlord.properties() });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      setPropertyToDelete(null);
    },
    onError: (err: unknown) => {
      if (err instanceof AppError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete property listing.");
      }
    },
  });

  const properties: Property[] =
    propertiesData && propertiesData.length > 0
      ? propertiesData
      : MOCK_FEATURED_PROPERTIES.slice(0, 3);

  const totalListings = statsData?.totalListings ?? properties.length;
  const activeRentals = statsData?.activeRentals ?? properties.filter((p) => !p.isAvailable).length;
  const pendingRequests = statsData?.pendingRequests ?? 1;
  const totalEarnings =
    statsData?.totalEarnings ??
    properties.reduce((sum, p) => sum + (p.isAvailable ? 0 : Number(p.price ?? p.rent ?? 0)), 0);

  const handleOpenEdit = (prop: Property) => {
    setPropertyToEdit(prop);
    setIsFormDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setPropertyToEdit(null);
    setIsFormDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Landlord Hub, {user?.name?.split(" ")[0] || "Partner"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your real estate listings, toggle rental availability, and review inquiries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 font-bold shadow-xs"
          >
            <PlusCircle className="size-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Properties
            </CardTitle>
            <Building className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{totalListings}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Listed under your portfolio</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Tenancies
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{activeRentals}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Currently occupied homes</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Inquiries to Review
            </CardTitle>
            <Clock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{pendingRequests}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting your approval</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Rental Volume
            </CardTitle>
            <DollarSign className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              ${totalEarnings.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Estimated monthly yield</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Property Listings CRUD Management */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building className="size-5 text-primary" />
              Your Property Portfolio ({properties.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Live listings with availability controls, edit access, and vacancy tracking
            </CardDescription>
          </div>
          <Button
            size="xs"
            variant="outline"
            onClick={handleOpenCreate}
            className="text-xs gap-1 self-start sm:self-auto"
          >
            <PlusCircle className="size-3.5" /> Quick Add Listing
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          {isPropertiesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 w-full bg-muted/40 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed rounded-xl border-border/70">
              <Building className="size-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-bold text-sm text-foreground">No Listings Yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Add your first rental property to start receiving verified tenant inquiries.
              </p>
              <Button size="sm" onClick={handleOpenCreate} className="mt-3">
                <PlusCircle className="size-4 mr-1.5" /> Publish Property
              </Button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/10 transition-colors gap-4"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="relative size-16 sm:size-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                      <Image
                        src={
                          prop.images?.[0] ||
                          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80"
                        }
                        alt={prop.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/properties/${prop.id}`}
                          className="font-bold text-sm text-foreground hover:text-primary transition inline-flex items-center gap-1"
                        >
                          {prop.title}
                          <ExternalLink className="size-3 text-muted-foreground" />
                        </Link>
                        <Badge
                          variant={prop.isAvailable ? "default" : "secondary"}
                          className={`text-[10px] ${
                            prop.isAvailable
                              ? "bg-emerald-600/90 text-white"
                              : "text-muted-foreground"
                          }`}
                        >
                          {prop.isAvailable ? "Available" : "Occupied / Off-Market"}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          ${Number(prop.price ?? prop.rent ?? 0).toLocaleString()} / mo
                        </span>
                        <span>•</span>
                        <span>{prop.location}</span>
                        <span>•</span>
                        <span>{prop.bedrooms} Bed, {prop.bathrooms} Bath</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Toggle Availability, Edit, Delete */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Availability Toggle */}
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={toggleAvailabilityMutation.isPending}
                      onClick={() =>
                        toggleAvailabilityMutation.mutate({
                          id: prop.id,
                          isAvailable: !prop.isAvailable,
                        })
                      }
                      className="text-xs gap-1"
                      title={prop.isAvailable ? "Mark as unavailable" : "Mark as available"}
                    >
                      {prop.isAvailable ? (
                        <>
                          <EyeOff className="size-3" />
                          Mark Rented
                        </>
                      ) : (
                        <>
                          <Eye className="size-3" />
                          Mark Available
                        </>
                      )}
                    </Button>

                    {/* Edit Listing */}
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleOpenEdit(prop)}
                      className="text-xs gap-1"
                    >
                      <Edit className="size-3" />
                      Edit
                    </Button>

                    {/* Delete Listing */}
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setPropertyToDelete(prop)}
                      className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incoming Rental Inquiries Management */}
      <IncomingRequestsSection />

      {/* Property Create/Edit Dialog */}
      <PropertyFormDialog
        propertyToEdit={propertyToEdit}
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(propertyToDelete)}
        onOpenChange={(open) => !open && setPropertyToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="size-11 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-1">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-center">
              Delete Property Listing?
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Are you sure you want to remove &quot;{propertyToDelete?.title}&quot;? This action cannot be undone and will cancel any unapproved tenant inquiries.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPropertyToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => propertyToDelete && deleteMutation.mutate(propertyToDelete.id)}
              disabled={deleteMutation.isPending}
              className="font-bold gap-1.5"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
