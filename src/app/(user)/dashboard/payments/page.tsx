"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import type { DispatchRequestItem } from "@/types";

const getPayInfo = (req: DispatchRequestItem) => {
  const p =
    req.payment ||
    (Array.isArray(req.payments)
      ? req.payments.find((x) => x.status === "SUCCESS") ||
        req.payments.find((x) => x.status === "PENDING") ||
        req.payments[0]
      : null);
  const amount = Number(p?.amount || req.amount || 0);
  const isPaid =
    p?.status === "SUCCESS" ||
    p?.status === "PAID" ||
    req.paymentStatus === "SUCCESS";
  const isBilled = !isPaid && amount > 0;
  return {
    amount,
    isPaid,
    isBilled,
    state: isPaid ? "PAID" : isBilled ? "BILLED" : "UNBILLED",
  };
};

export default function UserPaymentsPage() {
  const [filter, setFilter] = useState("ALL");

  const { data: requests, isPending } = useQuery<DispatchRequestItem[]>({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const res = await api.get("/requests/my-requests");
      return res.data.data || [];
    },
    refetchInterval: 8000,
  });

  const payMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const originUrl =
        typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await api.post("/payments/initiate", {
        requestId,
        originUrl,
      });
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
      else toast.success("Payment initiated");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    },
  });

  const rows = useMemo(() => {
    const all = Array.isArray(requests) ? requests : [];
    if (filter === "ALL") return all;
    return all.filter((r) => getPayInfo(r).state === filter);
  }, [requests, filter]);

  const rowKey = useCallback((r: DispatchRequestItem) => r.id, []);
  const searchAccessor = useCallback(
    (r: DispatchRequestItem) =>
      `${r.id} ${r.pickupAddress || ""} ${r.destinationAddress || ""}`,
    []
  );

  const columns = useMemo<ColumnDef<DispatchRequestItem>[]>(
    () => [
      {
        key: "id",
        header: "Dispatch ID",
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
        key: "route",
        header: "Route",
        cell: (r) => (
          <span className="text-xs text-muted-foreground block max-w-[240px] truncate">
            {r.pickupAddress} → {r.destinationAddress}
          </span>
        ),
      },
      {
        key: "status",
        header: "Trip Status",
        cell: (r) => <Badge variant="outline">{r.status}</Badge>,
      },
      {
        key: "amount",
        header: "Amount",
        sortable: true,
        sortValue: (r) => getPayInfo(r).amount,
        cell: (r) => {
          const { amount } = getPayInfo(r);
          return amount > 0 ? (
            <span className="font-semibold text-brand-emerald">
              ${amount.toFixed(2)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        key: "payStatus",
        header: "Payment Status",
        cell: (r) => {
          const { isPaid, isBilled } = getPayInfo(r);
          if (isPaid)
            return (
              <Badge className="bg-emerald-600 text-white border-transparent">
                Paid
              </Badge>
            );
          if (isBilled) return <Badge variant="secondary">Billed (Due)</Badge>;
          return <Badge variant="outline">Unbilled</Badge>;
        },
      },
      {
        key: "action",
        header: "Action",
        className: "text-right",
        cell: (r) => {
          const { amount, isPaid, isBilled } = getPayInfo(r);
          if (isPaid)
            return (
              <span className="text-xs font-medium text-brand-emerald">
                Paid
              </span>
            );
          if (isBilled && r.status === "COMPLETED") {
            return (
              <Button
                size="xs"
                className="gap-1"
                disabled={payMutation.isPending}
                onClick={() => payMutation.mutate(r.id)}
              >
                <CreditCard className="h-3.5 w-3.5" />
                Pay ${amount.toFixed(2)}
              </Button>
            );
          }
          return (
            <span className="text-xs text-muted-foreground">
              {r.status === "COMPLETED" ? "Awaiting Admin Bill" : "In Progress"}
            </span>
          );
        },
      },
    ],
    [payMutation]
  );

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Payments & Billing
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View itemized post-trip invoices and complete pending payments
          securely via Stripe.
        </p>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={rowKey}
        isLoading={isPending}
        searchPlaceholder="Search dispatch ID or route (debounced)..."
        searchAccessor={searchAccessor}
        profilerId="UserPaymentsDataTable"
        filterSlot={
          <Select value={filter} onValueChange={(v) => setFilter(v || "ALL")}>
            <SelectTrigger className="w-[155px] h-10 rounded-xl">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Records</SelectItem>
              <SelectItem value="BILLED">Due for Payment</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="UNBILLED">Unbilled</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
