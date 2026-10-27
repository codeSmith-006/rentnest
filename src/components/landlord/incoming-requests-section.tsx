"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { landlordService } from "@/services/landlord.service";
import { queryKeys } from "@/lib/query-client";
import { MOCK_RENTALS } from "@/lib/mock-data";
import { RentalRequest, RentalStatus } from "@/types";
import { AppError } from "@/lib/error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  DollarSign,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

function getStatusBadge(status: RentalStatus) {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300 text-[11px] gap-1">
          <Clock className="size-3" />
          Awaiting Decision
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-300 text-[11px] gap-1">
          <CheckCircle2 className="size-3" />
          Approved • Unpaid
        </Badge>
      );
    case "ACTIVE":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-300 text-[11px] gap-1">
          <CheckCircle2 className="size-3" />
          Active Lease
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className="text-[11px] gap-1">
          <XCircle className="size-3" />
          Declined
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function IncomingRequestsSection() {
  const queryClient = useQueryClient();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const {
    data: requestsData,
    isLoading,
  } = useQuery({
    queryKey: queryKeys.landlord.requests(),
    queryFn: async () => {
      try {
        const res = await landlordService.getIncomingRequests();
        return res?.data || [];
      } catch {
        return MOCK_RENTALS;
      }
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      setActiveActionId(id);
      return landlordService.updateRequestStatus(id, status);
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.status === "APPROVED"
          ? "Rental application approved! The tenant has been notified to proceed with payment."
          : "Rental inquiry rejected."
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.landlord.requests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.landlord.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all });
    },
    onError: (err: unknown) => {
      if (err instanceof AppError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update inquiry status.");
      }
    },
    onSettled: () => {
      setActiveActionId(null);
    },
  });

  const requests: RentalRequest[] =
    requestsData && requestsData.length > 0 ? requestsData : MOCK_RENTALS;

  return (
    <Card id="requests" className="border-border/80 shadow-xs">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Incoming Rental Applications ({requests.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Review and decision tenant booking inquiries for your properties
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs self-start sm:self-auto">
            {requests.filter((r) => r.status === "PENDING").length} Pending Review
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 w-full bg-muted/40 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border-2 border-dashed rounded-xl">
            No incoming tenant rental inquiries at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const isPending = req.status === "PENDING";
              const isUpdating = activeActionId === req.id;

              return (
                <div
                  key={req.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/10 transition-colors gap-4"
                >
                  {/* Left Column: Applicant & Property info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <User className="size-4 text-primary" />
                        {req.tenant?.name || "Verified Applicant"}
                      </span>
                      <span>for</span>
                      <Link
                        href={`/properties/${req.propertyId}`}
                        className="font-semibold text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        {req.property?.title || "Property Listing"}
                        <ExternalLink className="size-3" />
                      </Link>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {req.startDate} to {req.endDate}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <DollarSign className="size-3.5 text-primary" />
                        ${req.totalAmount.toLocaleString()} / month
                      </span>
                    </div>

                    {req.message && (
                      <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-lg border">
                        &quot;{req.message}&quot;
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    {isPending ? (
                      <>
                        <Button
                          size="sm"
                          disabled={isUpdating}
                          onClick={() =>
                            statusMutation.mutate({ id: req.id, status: "APPROVED" })
                          }
                          className="font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                        >
                          {isUpdating ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isUpdating}
                          onClick={() =>
                            statusMutation.mutate({ id: req.id, status: "REJECTED" })
                          }
                          className="font-semibold gap-1 text-xs h-8"
                        >
                          {isUpdating ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <X className="size-3.5" />
                          )}
                          Decline
                        </Button>
                      </>
                    ) : (
                      <div className="text-[11px] text-muted-foreground font-medium">
                        Decision Recorded
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
