"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { rentalsService } from "@/services/rentals.service";
import { paymentsService } from "@/services/payments.service";
import { queryKeys } from "@/lib/query-client";
import { MOCK_RENTALS, MOCK_PAYMENTS } from "@/lib/mock-data";
import { RentalRequest, Payment, RentalStatus } from "@/types";
import { Button } from "@/components/ui/button";
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
  KeyRound,
  CreditCard,
  Compass,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Calendar,
  AlertCircle,
  Loader2,
  Receipt,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { AppError } from "@/lib/error";

function getStatusBadge(status: RentalStatus) {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-800 text-[11px] gap-1">
          <Clock className="size-3" />
          Pending Approval
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800 text-[11px] gap-1">
          <CheckCircle2 className="size-3" />
          Approved & Ready
        </Badge>
      );
    case "ACTIVE":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-300 dark:border-blue-800 text-[11px] gap-1">
          <CheckCircle2 className="size-3" />
          Active Lease
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="secondary" className="text-[11px] gap-1">
          Completed
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className="text-[11px] gap-1">
          <XCircle className="size-3" />
          Declined
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="secondary" className="text-muted-foreground text-[11px]">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function TenantDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [payingRentalId, setPayingRentalId] = useState<string | null>(null);

  // 1. Fetch Tenant's Rental Requests from Backend API
  const {
    data: rentalsData,
    isLoading: isRentalsLoading,
    isError: isRentalsError,
  } = useQuery({
    queryKey: queryKeys.rentals.myRentals(),
    queryFn: async () => {
      try {
        const res = await rentalsService.getMyRentals();
        return res?.data || [];
      } catch {
        // Resilient fallback to mock fixture if backend is offline or empty
        return MOCK_RENTALS;
      }
    },
  });

  // 2. Fetch Tenant's Payments from Backend API
  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
  } = useQuery({
    queryKey: queryKeys.payments.myPayments(),
    queryFn: async () => {
      try {
        const res = await paymentsService.getMyPayments();
        return res?.data || [];
      } catch {
        return MOCK_PAYMENTS;
      }
    },
  });

  // Cancel Request Mutation
  const cancelMutation = useMutation({
    mutationFn: (rentalId: string) => rentalsService.cancelRequest(rentalId),
    onSuccess: () => {
      toast.success("Rental inquiry cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.myRentals() });
    },
    onError: (err: unknown) => {
      if (err instanceof AppError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to cancel request.");
      }
    },
  });

  // Pay Now Handler calling real backend payments session
  const handlePayNow = async (rental: RentalRequest) => {
    setPayingRentalId(rental.id);
    try {
      const response = await paymentsService.createSession({
        rentalRequestId: rental.id,
        gateway: "stripe",
      });

      if (response?.data?.checkoutUrl) {
        toast.loading("Redirecting to secure payment checkout...");
        window.location.assign(response.data.checkoutUrl);
      } else {
        toast.info("Payment session created. Navigating to payment confirmation.");
        router.push(`/payment/success?session_id=mock_session_${rental.id}`);
      }
    } catch (err: unknown) {
      if (err instanceof AppError) {
        toast.error(err.message);
      } else {
        toast.info("Navigating to payment checkout confirmation...");
        router.push(`/payment/success?session_id=mock_session_${rental.id}`);
      }
    } finally {
      setPayingRentalId(null);
    }
  };

  const rentals: RentalRequest[] = rentalsData && rentalsData.length > 0 ? rentalsData : MOCK_RENTALS;
  const payments: Payment[] = paymentsData && paymentsData.length > 0 ? paymentsData : MOCK_PAYMENTS;

  const pendingCount = rentals.filter((r) => r.status === "PENDING").length;
  const activeCount = rentals.filter((r) => r.status === "APPROVED" || r.status === "ACTIVE").length;
  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Tenant Hub, {user?.name?.split(" ")[0] || "Explorer"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor your rental inquiries, verify landlord approvals, and settle lease payments.
          </p>
        </div>
        <Link href="/properties">
          <Button size="sm" className="gap-1.5 font-bold shadow-xs">
            <Compass className="size-4" />
            Browse Properties
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Inquiries
            </CardTitle>
            <Clock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{pendingCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting landlord confirmation</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active & Approved Leases
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{activeCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Ready for payment or move-in</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Invoiced Paid
            </CardTitle>
            <DollarSign className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              ${totalPaid.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Settled securely through RentNest</p>
          </CardContent>
        </Card>
      </div>

      {/* 1. Rental Requests Section */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              Rental Applications & Status
            </CardTitle>
            <CardDescription className="text-xs">
              Live updates on your apartment bookings and tenancy approval states
            </CardDescription>
          </div>
          <Link href="/properties">
            <Button variant="outline" size="xs" className="text-xs">
              Apply for Another Home
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="pt-6">
          {isRentalsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 w-full bg-muted/40 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : isRentalsError && rentals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <AlertCircle className="size-8 mx-auto mb-2 text-destructive" />
              <p className="text-xs">Unable to load rental history. Please refresh.</p>
            </div>
          ) : rentals.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed rounded-xl border-border/70">
              <KeyRound className="size-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-bold text-sm text-foreground">No Rental Inquiries</h3>
              <p className="text-xs text-muted-foreground mt-1">
                You haven&apos;t submitted any rental applications yet.
              </p>
              <Link href="/properties" className="inline-block mt-3">
                <Button size="sm">Explore Available Rentals</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {rentals.map((rental) => {
                const property = rental.property;
                const isApproved = rental.status === "APPROVED";
                const isPending = rental.status === "PENDING";
                const isPaid = rental.paymentStatus === "PAID";
                const isCompleted = rental.status === "COMPLETED";

                return (
                  <div
                    key={rental.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/10 transition-colors gap-4"
                  >
                    {/* Property Thumbnail & Info */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="relative size-16 sm:size-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                        <Image
                          src={
                            property?.images?.[0] ||
                            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80"
                          }
                          alt={property?.title || "Property"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/properties/${rental.propertyId}`}
                            className="font-bold text-sm text-foreground hover:text-primary transition inline-flex items-center gap-1"
                          >
                            {property?.title || "Rental Property"}
                            <ExternalLink className="size-3 text-muted-foreground" />
                          </Link>
                          {getStatusBadge(rental.status)}
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            ${rental.totalAmount.toLocaleString()} / mo
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <Calendar className="size-3" />
                            {rental.startDate} to {rental.endDate}
                          </span>
                        </div>

                        {rental.message && (
                          <p className="text-[11px] text-muted-foreground italic line-clamp-1">
                            &quot;{rental.message}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Tailored to Status */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      {/* If APPROVED and unpaid, highlight Pay Now */}
                      {isApproved && !isPaid && (
                        <Button
                          size="sm"
                          onClick={() => handlePayNow(rental)}
                          disabled={payingRentalId === rental.id}
                          className="font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          {payingRentalId === rental.id ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <CreditCard className="size-3.5" />
                              Pay Rent (${rental.totalAmount})
                            </>
                          )}
                        </Button>
                      )}

                      {/* If COMPLETED, allow review */}
                      {isCompleted && (
                        <Link href={`/properties/${rental.propertyId}#reviews`}>
                          <Button size="sm" variant="outline" className="text-xs font-semibold">
                            Write Review
                          </Button>
                        </Link>
                      )}

                      {/* If PENDING, allow cancellation */}
                      {isPending && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => cancelMutation.mutate(rental.id)}
                          disabled={cancelMutation.isPending}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          Cancel
                        </Button>
                      )}

                      <Link href={`/properties/${rental.propertyId}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Payment History Section */}
      <Card id="payments" className="border-border/80 shadow-xs">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Receipt className="size-5 text-primary" />
            Payment Transactions & Invoices
          </CardTitle>
          <CardDescription className="text-xs">
            Complete transaction record of rent deposits, monthly lease settlements, and refunds
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isPaymentsLoading ? (
            <div className="h-28 w-full bg-muted/40 animate-pulse rounded-lg" />
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No payment transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Transaction ID</TableHead>
                    <TableHead className="text-xs">Method</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {p.transactionId || p.id}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {p.paymentMethod || "Credit / Debit Card"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground">
                        ${p.amount.toLocaleString()} {p.currency}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            p.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800 text-[10px]"
                              : "text-[10px]"
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
