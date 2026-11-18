"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import type { DispatchRequestItem, PaymentRecord } from "@/types";

// Lazy-load Invoice Modal Dialog so form input updates are colocated inside the dialog
const InvoiceModalDialog = React.lazy(
  () => import("@/components/dashboard/modals/InvoiceModalDialog")
);

const getPaymentObj = (req: DispatchRequestItem): PaymentRecord | null => {
  if (req.payment) return req.payment;
  if (Array.isArray(req.payments) && req.payments.length > 0) {
    return (
      req.payments.find((p) => p.status === "SUCCESS") ||
      req.payments.find((p) => p.status === "PENDING") ||
      req.payments[0]
    );
  }
  return null;
};

const getAmount = (req: DispatchRequestItem) =>
  Number(getPaymentObj(req)?.amount || req.amount || 0);

const getPayStatus = (
  req: DispatchRequestItem
): "PAID" | "BILLED" | "UNBILLED" => {
  const p = getPaymentObj(req);
  if (
    p?.status === "SUCCESS" ||
    p?.status === "PAID" ||
    req.paymentStatus === "SUCCESS"
  )
    return "PAID";
  if (p && Number(p.amount) > 0) return "BILLED";
  return "UNBILLED";
};

export default function AdminPaymentsPage() {
  const highVolumeMode = useHighVolumeMode();
  const [selectedReq, setSelectedReq] = useState<DispatchRequestItem | null>(
    null
  );
  const [initialAmount, setInitialAmount] = useState("");
  const [reqStatusFilter, setReqStatusFilter] = useState("ALL");
  const [payStatusFilter, setPayStatusFilter] = useState("ALL");

  const { data: requests, isPending } = useQuery<DispatchRequestItem[]>({
    queryKey: ["admin-requests-payments"],
    queryFn: async () => {
      const res = await api.get("/requests?limit=100");
      return res.data.data?.requests || [];
    },
    refetchInterval: 8000,
  });

  const combinedRequests = useMemo(() => {
    const live = Array.isArray(requests) ? requests : [];
    return mergeWithRepresentativeRequests(live, highVolumeMode, 1200);
  }, [requests, highVolumeMode]);

  const rows = useMemo(() => {
    return combinedRequests.filter((r) => {
      if (reqStatusFilter !== "ALL" && r.status !== reqStatusFilter)
        return false;
      if (payStatusFilter !== "ALL" && getPayStatus(r) !== payStatusFilter)
        return false;
      return true;
    });
  }, [combinedRequests, reqStatusFilter, payStatusFilter]);

  const rowKey = useCallback((r: DispatchRequestItem) => r.id, []);
  const searchAccessor = useCallback(
    (r: DispatchRequestItem) =>
      `${r.id} ${r.patient?.email || ""} ${r.pickupAddress || ""}`,
    []
  );

  const openBillModal = useCallback((r: DispatchRequestItem, amt: number) => {
    setSelectedReq(r);
    setInitialAmount(amt > 0 ? String(amt) : "");
  }, []);

  const closeBillModal = useCallback(() => {
    setSelectedReq(null);
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
              {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
        ),
      },
      {
        key: "patient",
        header: "Patient",
        cell: (r) => (
          <div className="max-w-[210px]">
            <p className="text-xs font-medium truncate">
              {r.patient?.email || "Patient"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {r.pickupAddress} → {r.destinationAddress}
            </p>
          </div>
        ),
      },
      {
        key: "priority",
        header: "Criticality",
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
        header: "Trip Status",
        sortable: true,
        sortValue: (r) => r.status,
        cell: (r) => <Badge variant="outline">{r.status}</Badge>,
      },
      {
        key: "amount",
        header: "Amount",
        sortable: true,
        sortValue: (r) => getAmount(r),
        cell: (r) => {
          const amt = getAmount(r);
          return amt > 0 ? (
            <span className="font-semibold text-brand-emerald">
              ${amt.toFixed(2)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        key: "payStatus",
        header: "Payment Status",
        sortable: true,
        sortValue: (r) => getPayStatus(r),
        cell: (r) => {
          const s = getPayStatus(r);
          if (s === "PAID")
            return (
              <Badge className="bg-emerald-600 text-white border-transparent">
                Paid
              </Badge>
            );
          if (s === "BILLED")
            return <Badge variant="secondary">Billed (Pending)</Badge>;
          return <Badge variant="outline">Unbilled</Badge>;
        },
      },
      {
        key: "actions",
        header: "Action",
        className: "text-right",
        cell: (r) => {
          const s = getPayStatus(r);
          const amt = getAmount(r);
          if (s === "PAID") {
            return (
              <span className="text-xs font-medium text-brand-emerald">
                Settled
              </span>
            );
          }
          if (r.status === "COMPLETED") {
            return (
              <Button
                size="xs"
                variant={s === "BILLED" ? "ghost" : "outline"}
                onClick={() => openBillModal(r, amt)}
              >
                {s === "BILLED" ? "Update Bill" : "Create Bill"}
              </Button>
            );
          }
          return (
            <span className="text-xs text-muted-foreground">In Progress</span>
          );
        },
      },
    ],
    [openBillModal]
  );

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Payments & Billing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Issue itemized post-trip invoices and monitor real-time Stripe
            settlement across dispatches.
          </p>
        </div>
        <DatasetVolumeToggle totalCount={combinedRequests.length} />
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={rowKey}
        isLoading={isPending}
        searchPlaceholder="Search patient email or dispatch ID (debounced)..."
        searchAccessor={searchAccessor}
        profilerId="AdminPaymentsDataTable"
        filterSlot={
          <>
            <Select
              value={reqStatusFilter}
              onValueChange={(v) => setReqStatusFilter(v || "ALL")}
            >
              <SelectTrigger className="w-[150px] h-10 rounded-xl">
                <SelectValue placeholder="Trip Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Trips</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="EN_ROUTE">En Route</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={payStatusFilter}
              onValueChange={(v) => setPayStatusFilter(v || "ALL")}
            >
              <SelectTrigger className="w-[150px] h-10 rounded-xl">
                <SelectValue placeholder="Billing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Billing</SelectItem>
                <SelectItem value="UNBILLED">Unbilled</SelectItem>
                <SelectItem value="BILLED">Billed</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {selectedReq && (
        <Suspense fallback={null}>
          <InvoiceModalDialog
            key={selectedReq.id}
            selectedReq={selectedReq}
            initialAmount={initialAmount}
            onClose={closeBillModal}
          />
        </Suspense>
      )}
    </div>
  );
}
