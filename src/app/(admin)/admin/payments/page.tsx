"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { DispatchRequestItem, PaymentRecord } from "@/types";

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [selectedReq, setSelectedReq] = useState<DispatchRequestItem | null>(null);
  const [amount, setAmount] = useState("");
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

  const billMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const res = await api.post("/payments/create", { requestId: id, amount: Number(amount) });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Payment bill generated for patient!");
      setSelectedReq(null);
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["admin-requests-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to generate payment bill");
    },
  });

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

  const getPayStatus = (req: DispatchRequestItem): "PAID" | "BILLED" | "UNBILLED" => {
    const p = getPaymentObj(req);
    if (p?.status === "SUCCESS" || p?.status === "PAID" || req.paymentStatus === "SUCCESS")
      return "PAID";
    if (p && Number(p.amount) > 0) return "BILLED";
    return "UNBILLED";
  };

  let rows = Array.isArray(requests) ? [...requests] : [];
  if (reqStatusFilter !== "ALL") rows = rows.filter((r) => r.status === reqStatusFilter);
  if (payStatusFilter !== "ALL") rows = rows.filter((r) => getPayStatus(r) === payStatusFilter);

  const columns: ColumnDef<DispatchRequestItem>[] = [
    {
      key: "id",
      header: "Dispatch",
      sortable: true,
      sortValue: (r) => new Date(r.createdAt || 0).getTime(),
      cell: (r) => (
        <div>
          <p className="font-mono text-xs font-semibold">#{r.id?.slice(0, 8).toUpperCase()}</p>
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
          <p className="text-xs font-medium truncate">{r.patient?.email || "Patient"}</p>
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
          variant={r.priority === "CRITICAL" || r.priority === "HIGH" ? "destructive" : "secondary"}
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
          <span className="font-semibold text-brand-emerald">${amt.toFixed(2)}</span>
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
          return <Badge className="bg-emerald-600 text-white border-transparent">Paid</Badge>;
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
          return <span className="text-xs font-medium text-brand-emerald">Settled</span>;
        }
        if (r.status === "COMPLETED") {
          return (
            <Button
              size="xs"
              variant={s === "BILLED" ? "ghost" : "outline"}
              onClick={() => {
                setSelectedReq(r);
                setAmount(amt > 0 ? String(amt) : "");
              }}
            >
              {s === "BILLED" ? "Update Bill" : "Create Bill"}
            </Button>
          );
        }
        return <span className="text-xs text-muted-foreground">In Progress</span>;
      },
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Payments & Billing
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Issue itemized post-trip invoices and monitor real-time Stripe settlement across dispatches.
        </p>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        isLoading={isPending}
        searchPlaceholder="Search patient email or dispatch ID..."
        searchAccessor={(r) => `${r.id} ${r.patient?.email || ""} ${r.pickupAddress || ""}`}
        filterSlot={
          <>
            <Select value={reqStatusFilter} onValueChange={(v) => setReqStatusFilter(v || "ALL")}>
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
            <Select value={payStatusFilter} onValueChange={(v) => setPayStatusFilter(v || "ALL")}>
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

      <Dialog open={Boolean(selectedReq)} onOpenChange={(o) => !o && setSelectedReq(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>
              Generate Invoice — #{selectedReq?.id?.slice(0, 8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              The patient will immediately receive a Stripe Checkout button in their portal.
            </DialogDescription>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1 text-muted-foreground">
                <p>
                  Patient: <strong className="text-foreground">{selectedReq.patient?.email}</strong>
                </p>
                <p>
                  Route:{" "}
                  <strong className="text-foreground">
                    {selectedReq.pickupAddress} → {selectedReq.destinationAddress}
                  </strong>
                </p>
                <p>
                  Criticality: <strong className="text-foreground">{selectedReq.priority}</strong>
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bill-amount">Invoice Amount ($ USD)</Label>
                <Input
                  id="bill-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="e.g. 185.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                disabled={billMutation.isPending || !amount || Number(amount) <= 0}
                onClick={() =>
                  billMutation.mutate({ id: selectedReq.id, amount: Number(amount) })
                }
              >
                {billMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Bill...
                  </>
                ) : (
                  "Send Invoice to Patient"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
