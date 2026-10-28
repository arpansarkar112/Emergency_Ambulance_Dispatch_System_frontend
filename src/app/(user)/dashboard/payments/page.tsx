"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

export default function UserPaymentsPage() {
  const { data: requests, isPending } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const res = await api.get('/requests/my-requests');
      return res.data.data || [];
    },
    refetchInterval: 8000,
  });

  const payMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const originUrl = typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await api.post('/payments/initiate', { requestId, originUrl });
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.success("Payment initiated successfully");
      }
    },
    onError: (error: any) => {
      const apiErr = error.response?.data;
      let msg = apiErr?.message || "Failed to initiate payment";
      if (apiErr?.errors && apiErr.errors.length > 0) {
        msg += ` - ${apiErr.errors.map((e: any) => e.message || e.msg).join(', ')}`;
      }
      toast.error(msg);
    }
  });

  if (isPending) {
    return <div className="p-8">Loading payments...</div>;
  }

  const getPaymentObj = (req: any) => {
    if (req.payment) return req.payment;
    if (Array.isArray(req.payments) && req.payments.length > 0) {
      return (
        req.payments.find((p: any) => p.status === "SUCCESS") ||
        req.payments.find((p: any) => p.status === "PENDING") ||
        req.payments[0]
      );
    }
    return null;
  };

  const allRequests = Array.isArray(requests) ? requests : [];
  const allBookings = [...allRequests].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payments & Billing</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View all current and past bookings, billed amounts from Admin, and complete your pending payments.
        </p>
      </div>

      <div className="rounded-md border bg-card mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispatch ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Request Status</TableHead>
              <TableHead>Amount Billed</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No bookings or payment records found.
                </TableCell>
              </TableRow>
            ) : (
              allBookings.map((req: any) => {
                const payment = getPaymentObj(req);
                const amount = Number(payment?.amount || req.amount || 0);
                const isPaid = payment?.status === 'SUCCESS' || payment?.status === 'PAID' || req.paymentStatus === 'SUCCESS';
                const isBilled = !isPaid && payment && amount > 0;
                
                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">#{req.id?.substring(0, 8).toUpperCase()}</TableCell>
                    <TableCell>{new Date(req.createdAt || req.updatedAt || 0).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">
                      {req.pickupAddress} → {req.destinationAddress}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{req.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {amount > 0 ? (
                        <span className="font-semibold text-emerald-600">${amount.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isPaid ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">Paid (Completed)</Badge>
                      ) : isBilled ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Billed (Needs Payment)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Unbilled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isPaid ? (
                        <Badge variant="outline" className="border-emerald-600 text-emerald-700">
                          Paid
                        </Badge>
                      ) : isBilled && req.status === "COMPLETED" ? (
                        <Button 
                          size="sm" 
                          className="gap-1.5"
                          disabled={payMutation.isPending}
                          onClick={() => payMutation.mutate(req.id)}
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Pay Now (${amount.toFixed(2)})
                        </Button>
                      ) : req.status === "COMPLETED" ? (
                        <span className="text-xs text-muted-foreground">Awaiting Admin Bill</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Trip In Progress</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
