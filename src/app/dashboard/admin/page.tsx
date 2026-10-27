"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { queryKeys } from "@/lib/query-client";
import { MOCK_USERS, MOCK_FEATURED_PROPERTIES } from "@/lib/mock-data";
import { User, Property } from "@/types";
import { AppError } from "@/lib/error";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Users,
  Building,
  DollarSign,
  Search,
  ExternalLink,
  Trash2,
  UserX,
  UserCheck,
  Loader2,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [userToToggleBan, setUserToToggleBan] = useState<User | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // 1. Fetch Global Stats
  const { data: statsData } = useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: async () => {
      try {
        const res = await adminService.getPlatformStats();
        return res?.data;
      } catch {
        return null;
      }
    },
  });

  // 2. Fetch Users
  const {
    data: usersData,
    isLoading: isUsersLoading,
  } = useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: async () => {
      try {
        const res = await adminService.getUsers();
        return res?.data || [];
      } catch {
        return MOCK_USERS;
      }
    },
  });

  // 3. Fetch Properties
  const {
    data: propertiesData,
    isLoading: isPropertiesLoading,
  } = useQuery({
    queryKey: queryKeys.admin.properties(),
    queryFn: async () => {
      try {
        const res = await adminService.getAllProperties();
        return res?.data || [];
      } catch {
        return MOCK_FEATURED_PROPERTIES;
      }
    },
  });

  // Toggle Ban User Mutation
  const toggleBanMutation = useMutation({
    mutationFn: ({ id, isBanned }: { id: string; isBanned: boolean }) =>
      adminService.toggleBanUser(id, isBanned),
    onSuccess: (_, vars) => {
      toast.success(
        vars.isBanned
          ? "User account has been suspended and restricted from logging in."
          : "User account access restored."
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      setUserToToggleBan(null);
    },
    onError: (err: unknown) => {
      if (err instanceof AppError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update user account status.");
      }
    },
  });

  // Delete Property Mutation
  const deletePropertyMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteProperty(id),
    onSuccess: () => {
      toast.success("Listing delisted and purged from platform catalog.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.properties() });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      setPropertyToDelete(null);
    },
    onError: (err: unknown) => {
      if (err instanceof AppError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to moderate property listing.");
      }
    },
  });

  const users: User[] = usersData && usersData.length > 0 ? usersData : MOCK_USERS;
  const properties: Property[] =
    propertiesData && propertiesData.length > 0 ? propertiesData : MOCK_FEATURED_PROPERTIES;

  const totalUsers = statsData?.totalUsers ?? users.length;
  const totalProperties = statsData?.totalProperties ?? properties.length;
  const totalRentals = statsData?.totalRentals ?? 12;
  const totalVolume = statsData?.totalVolume ?? 24500;

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRoleFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldCheck className="size-8 text-primary" />
            Platform Governance Console
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            System administration, user verification & account access, and property catalog moderation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-2.5 py-1 bg-primary/5 text-primary border-primary/20">
            Admin: {currentAdmin?.name || "Root Admin"}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Registered Accounts
            </CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{totalUsers}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Tenants & Landlords</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Properties
            </CardTitle>
            <Building className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{totalProperties}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Catalog listings</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Leases
            </CardTitle>
            <KeyRound className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{totalRentals}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Created on RentNest</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Gross Volume
            </CardTitle>
            <DollarSign className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              ${totalVolume.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Processed payments</p>
          </CardContent>
        </Card>
      </div>

      {/* 1. User Management Section */}
      <Card id="users" className="border-border/80 shadow-xs">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="size-5 text-primary" />
                User Account Governance ({filteredUsers.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect accounts, filter by role, and manage user access permissions
              </CardDescription>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search user or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>

              <div className="flex items-center gap-1">
                {(["ALL", "TENANT", "LANDLORD"] as const).map((role) => (
                  <Button
                    key={role}
                    size="xs"
                    variant={selectedRoleFilter === role ? "default" : "outline"}
                    onClick={() => setSelectedRoleFilter(role)}
                    className="text-[11px] h-8"
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {isUsersLoading ? (
            <div className="h-40 w-full bg-muted/40 animate-pulse rounded-lg" />
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No users matching &quot;{searchQuery}&quot; found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Phone</TableHead>
                    <TableHead className="text-xs">Joined</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Access Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const isBanned = Boolean(u.isBanned);
                    const isSelf = u.id === currentAdmin?.id;

                    return (
                      <TableRow key={u.id}>
                        <TableCell className="text-xs font-semibold">
                          <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-foreground">{u.name}</div>
                              <div className="text-[11px] font-normal text-muted-foreground">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.phone || "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isBanned ? "destructive" : "outline"}
                            className={
                              isBanned
                                ? "text-[10px]"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-300 text-[10px]"
                            }
                          >
                            {isBanned ? "Suspended" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!isSelf && u.role !== "ADMIN" && (
                            <Button
                              size="xs"
                              variant={isBanned ? "outline" : "destructive"}
                              onClick={() => setUserToToggleBan(u)}
                              className="text-[11px] gap-1 h-7"
                            >
                              {isBanned ? (
                                <>
                                  <UserCheck className="size-3" /> Unban Account
                                </>
                              ) : (
                                <>
                                  <UserX className="size-3" /> Suspend
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Property Moderation Section */}
      <Card id="properties" className="border-border/80 shadow-xs">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Building className="size-5 text-primary" />
            Property Listing Moderation ({properties.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Audit public listings, verify content accuracy, and remove fraudulent posts
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {isPropertiesLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 w-full bg-muted/40 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No property listings to moderate.
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative size-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                      <Image
                        src={
                          prop.images?.[0] ||
                          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80"
                        }
                        alt={prop.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {prop.title}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          ${Number(prop.price ?? prop.rent ?? 0).toLocaleString()}/mo
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {prop.location} • Host: {prop.landlord?.name || "Verified Landlord"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link href={`/properties/${prop.id}`} target="_blank">
                      <Button size="xs" variant="outline" className="text-xs gap-1">
                        <ExternalLink className="size-3" /> Inspect
                      </Button>
                    </Link>

                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => setPropertyToDelete(prop)}
                      className="text-xs gap-1"
                    >
                      <Trash2 className="size-3" /> Delist
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Ban/Unban Confirmation Dialog */}
      <Dialog
        open={Boolean(userToToggleBan)}
        onOpenChange={(open) => !open && setUserToToggleBan(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="size-11 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-1">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-center">
              {userToToggleBan?.isBanned ? "Unban Account?" : "Suspend User Account?"}
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              {userToToggleBan?.isBanned
                ? `Restore full marketplace and login access for ${userToToggleBan?.name} (${userToToggleBan?.email})?`
                : `Are you sure you want to suspend ${userToToggleBan?.name} (${userToToggleBan?.email})? The user will be immediately logged out and forbidden from taking actions.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUserToToggleBan(null)}
              disabled={toggleBanMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={userToToggleBan?.isBanned ? "default" : "destructive"}
              size="sm"
              onClick={() =>
                userToToggleBan &&
                toggleBanMutation.mutate({
                  id: userToToggleBan.id,
                  isBanned: !userToToggleBan.isBanned,
                })
              }
              disabled={toggleBanMutation.isPending}
              className="font-bold gap-1.5"
            >
              {toggleBanMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Updating...
                </>
              ) : userToToggleBan?.isBanned ? (
                "Confirm Unban"
              ) : (
                "Confirm Suspension"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Moderation Delete Dialog */}
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
              Delist Listing Permanently?
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Are you sure you want to delist &quot;{propertyToDelete?.title}&quot; from the public directory?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPropertyToDelete(null)}
              disabled={deletePropertyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => propertyToDelete && deletePropertyMutation.mutate(propertyToDelete.id)}
              disabled={deletePropertyMutation.isPending}
              className="font-bold gap-1.5"
            >
              {deletePropertyMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Delisting...
                </>
              ) : (
                "Confirm Delist"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
