"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UserPaymentsPage() {
  const { data: requests, isPending } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const res = await api.get('/requests/my-requests');
      const apiRequests = res.data.data || [];
      
      let localRequests = [];
      let sharedBills: Record<string, number> = {};
      try {
        const stored = localStorage.getItem('local_patient_requests');
        if (stored) localRequests = JSON.parse(stored);
        const storedBills = localStorage.getItem('shared_local_bills');
        if (storedBills) sharedBills = JSON.parse(storedBills);
      } catch(e) {}
      
      const apiIds = new Set(apiRequests.map((r: any) => r.id));
      const missingLocalRequests = localRequests.filter((r: any) => !apiIds.has(r.id));
      
      const all = [...apiRequests, ...missingLocalRequests];
      return all.map((req: any) => {
        if (sharedBills[req.id]) {
          return { ...req, payment: { amount: sharedBills[req.id], status: req.payment?.status || 'PENDING' } };
        }
        return req;
      });
    }
  });

  const payMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const endpoints = [
        { method: 'post', url: '/payments/initiate', payload: { requestId } },
        { method: 'post', url: '/payments/initiate', payload: { request_id: requestId } },
        { method: 'post', url: `/payments/${requestId}/initiate`, payload: {} },
        { method: 'post', url: `/requests/${requestId}/pay`, payload: {} },
        { method: 'post', url: '/payments/checkout', payload: { requestId } }
      ];

      let lastError = null;
      for (const ep of endpoints) {
        try {
          // @ts-ignore
          const res = await api[ep.method](ep.url, ep.payload);
          return res.data?.data || res.data;
        } catch (err: any) {
          lastError = err;
          if (err.response?.status === 404 || err.response?.status === 405 || err.response?.status === 400 || err.response?.status === 403) {
            continue;
          }
          throw err;
        }
      }
      throw lastError || new Error("All endpoints failed");
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
      const msg = apiErr?.message || "Failed to initiate payment";
      let fullMsg = msg;
      if (apiErr?.errors && apiErr.errors.length > 0) {
        fullMsg += ` - ${apiErr.errors.map((e: any) => e.msg || e.message).join(', ')}`;
      }
      toast.error(`Error: ${fullMsg}`);
    }
  });

  if (isPending) {
    return <div className="p-8">Loading payments...</div>;
  }

  const allRequests = Array.isArray(requests) ? requests : [];
  
  const getAmount = (req: any) => req.payment?.amount || req.amount || 0;
  
  // Show all bookings, current and past
  const allBookings = [...allRequests].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Payments & Billing</h2>
      <div className="rounded-md border bg-card mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispatch ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No payment records found.
                </TableCell>
              </TableRow>
            ) : (
              allBookings.map((req: any) => {
                const amount = getAmount(req);
                const isPaid = req.payment?.status === 'PAID' || req.payment?.status === 'COMPLETED' || req.status === 'PAID' || req.paymentStatus === 'COMPLETED';
                
                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">#{req.id?.substring(0, 8).toUpperCase()}</TableCell>
                    <TableCell>{new Date(req.createdAt || req.updatedAt || 0).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {amount > 0 ? (
                        <span className="font-semibold text-emerald-600">${amount.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isPaid ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">Paid</Badge>
                      ) : req.status === "COMPLETED" ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Needs Payment</Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Unbilled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === "COMPLETED" && !isPaid && (
                        <Button 
                          size="sm" 
                          disabled={payMutation.isPending}
                          onClick={() => payMutation.mutate(req.id)}
                        >
                          Pay Now
                        </Button>
                      )}
                      {isPaid && (
                        <Button size="sm" variant="outline" disabled>
                          Receipt
                        </Button>
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
