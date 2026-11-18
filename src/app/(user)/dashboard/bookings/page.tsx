"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DatasetVolumeToggle } from "@/components/shared/DatasetVolumeToggle";
import { mergeWithRepresentativeRequests } from "@/lib/synthetic-data";
import { useHighVolumeMode } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CreditCard,
  Eye,
  MapPin,
  Pencil,
  PlusCircle,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import type { DispatchRequestItem } from "@/types";

// Lazy-load EditBookingDialog with colocated Zod + React Hook Form state
const EditBookingDialog = React.lazy(
  () => import("@/components/dashboard/modals/EditBookingDialog")
);

export default function PatientBookingsPage() {
  const queryClient = useQueryClient();
  const highVolumeMode = useHighVolumeMode();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewing, setViewing] = useState<DispatchRequestItem | null>(null);
  const [editing, setEditing] = useState<DispatchRequestItem | null>(null);

  const { data: requests, isPending } = useQuery<DispatchRequestItem[]>({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const res = await api.get("/requests/my-requests");
      return res.data.data || [];
    },
    refetchInterval: 8000,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/requests/${id}`);
    },
    onSuccess: () => {
      toast.success("Booking cancelled.");
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["patient-stats"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Could not cancel booking");
    },
  });

  const payMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const originUrl =
        typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await api.post("/payments/initiate", {
        requestId,
        originUrl,
      });
      return res.data.data || res.data;
    },
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to initiate Stripe checkout"
      );
    },
  });

  const combinedRequests = useMemo(() => {
    const live = Array.isArray(requests) ? requests : [];
    return mergeWithRepresentativeRequests(live, highVolumeMode, 1200);
  }, [requests, highVolumeMode]);

  const rows = useMemo(() => {
    if (statusFilter === "ACTIVE") {
      return combinedRequests.filter(
        (r) => !["COMPLETED", "CANCELLED"].includes(r.status)
      );
    }
    if (statusFilter === "PAST") {
      return combinedRequests.filter((r) =>
        ["COMPLETED", "CANCELLED"].includes(r.status)
      );
    }
    return combinedRequests;
  }, [combinedRequests, statusFilter]);

  const rowKey = useCallback((r: DispatchRequestItem) => r.id, []);
  const searchAccessor = useCallback(
    (r: DispatchRequestItem) =>
      `${r.id} ${r.pickupAddress || ""} ${r.destinationAddress || ""} ${r.status}`,
    []
  );

  const handleCloseEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const columns = useMemo<ColumnDef<DispatchRequestItem>[]>(
    () => [
      {
        key: "id",
        header: "Dispatch",
        sortable: true,
        sortValue: (r) => new Date(r.createdAt || 0).getTime(),
        cell: (r) => (
          <div>
            <p className="font-mono text-xs font-semibold">
              #{r.id?.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {new Date(r.createdAt).toLocaleString()}
            </p>
          </div>
        ),
      },
      {
        key: "route",
        header: "Route",
        cell: (r) => (
          <div className="max-w-[260px]">
            <p className="text-xs font-medium text-foreground truncate">
              {r.pickupAddress}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              → {r.destinationAddress}
            </p>
          </div>
        ),
      },
      {
        key: "priority",
        header: "Criticality",
        sortable: true,
        sortValue: (r) => r.priority,
        cell: (r) => (
          <Badge
            variant={
              r.priority === "CRITICAL" || r.priority === "HIGH"
                ? "destructive"
                : "secondary"
            }
          >
            {r.priority}
          </Badge>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        sortValue: (r) => r.status,
        cell: (r) => <Badge variant="outline">{r.status}</Badge>,
      },
      {
        key: "billing",
        header: "Billing",
        cell: (r) => {
          const amount = Number(r.payment?.amount || r.amount || 0);
          const isPaid =
            r.payment?.status === "SUCCESS" || r.paymentStatus === "SUCCESS";
          if (isPaid)
            return (
              <Badge className="bg-emerald-600 text-white border-transparent">
                Paid ${amount.toFixed(2)}
              </Badge>
            );
          if (amount > 0)
            return <Badge variant="secondary">Due ${amount.toFixed(2)}</Badge>;
          return <span className="text-xs text-muted-foreground">—</span>;
        },
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cell: (r) => {
          const amount = Number(r.payment?.amount || r.amount || 0);
          const isPaid =
            r.payment?.status === "SUCCESS" || r.paymentStatus === "SUCCESS";
          const isBilled = !isPaid && amount > 0;
          const isSynthetic = r.id.startsWith("sim-");
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setViewing(r)}
                aria-label="View booking"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {!isSynthetic && r.status === "PENDING" && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditing(r)}
                    aria-label="Edit pending booking"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={() => cancelMutation.mutate(r.id)}
                    disabled={cancelMutation.isPending}
                    aria-label="Cancel booking"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              {!isSynthetic && isBilled && r.status === "COMPLETED" && (
                <Button
                  size="xs"
                  className="gap-1"
                  disabled={payMutation.isPending}
                  onClick={() => payMutation.mutate(r.id)}
                >
                  <CreditCard className="h-3 w-3" />
                  Pay
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [cancelMutation, payMutation]
  );

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My Bookings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track live ambulance assignments, edit pending calls, and settle
            completed bills.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DatasetVolumeToggle totalCount={combinedRequests.length} />
          <Link href="/dashboard/request">
            <Button className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Request Ambulance
            </Button>
          </Link>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={rowKey}
        isLoading={isPending}
        searchPlaceholder="Search address, hospital, or dispatch ID (debounced)..."
        searchAccessor={searchAccessor}
        profilerId="PatientBookingsDataTable"
        filterSlot={
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v || "ALL")}
          >
            <SelectTrigger className="w-[165px] h-10 rounded-xl">
              <SelectValue placeholder="Filter bookings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Bookings</SelectItem>
              <SelectItem value="ACTIVE">Active Dispatches</SelectItem>
              <SelectItem value="PAST">Completed & Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
        emptyTitle="No ambulance bookings found"
        emptyDescription="Click Request Ambulance to initiate a new emergency dispatch."
      />

      {/* View Modal */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(o) => !o && setViewing(null)}
      >
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>
              Dispatch #{viewing?.id?.slice(0, 8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Real-time ambulance assignment and trip status.
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm pt-2">
              <div className="flex gap-2">
                <Badge
                  variant={
                    viewing.priority === "CRITICAL" ||
                    viewing.priority === "HIGH"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {viewing.priority}
                </Badge>
                <Badge variant="outline">{viewing.status}</Badge>
              </div>
              <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Pickup:</strong> {viewing.pickupAddress}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-brand-emerald mt-0.5 shrink-0" />
                  <span>
                    <strong>Destination:</strong> {viewing.destinationAddress}
                  </span>
                </p>
                {viewing.ambulance && (
                  <p className="flex items-center gap-2 pt-1">
                    <Truck className="h-4 w-4 text-brand-navy shrink-0" />
                    <span>
                      <strong>Ambulance:</strong>{" "}
                      {viewing.ambulance.vehicleNumber} (
                      {viewing.ambulance.type})
                    </span>
                  </p>
                )}
                {viewing.driver && (
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>
                      <strong>Driver:</strong> {viewing.driver.email}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lazy-Loaded Edit Pending Request Modal (State Colocated inside Modal) */}
      {editing && (
        <Suspense fallback={null}>
          <EditBookingDialog editing={editing} onClose={handleCloseEdit} />
        </Suspense>
      )}
    </div>
  );
}
