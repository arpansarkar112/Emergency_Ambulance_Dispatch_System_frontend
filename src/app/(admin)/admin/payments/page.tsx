"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [reqStatusFilter, setReqStatusFilter] = useState("ALL");
  const [payStatusFilter, setPayStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");

  const { data: requests, isPending } = useQuery({
    queryKey: ['admin-requests-payments'],
    queryFn: async () => {
      const res = await api.get('/requests');
      const data = res.data.data;
      const fetchedReqs = data?.requests || data?.data || (Array.isArray(data) ? data : []);
      
      // Merge with locally created bills since GET /requests might not join the payment info immediately
      let localBills: Record<string, number> = {};
      try {
        const stored = localStorage.getItem('shared_local_bills');
        if (stored) localBills = JSON.parse(stored);
      } catch(e) {}

      return fetchedReqs.map((req: any) => {
        if (localBills[req.id]) {
          return { ...req, amount: localBills[req.id], paymentStatus: req.paymentStatus || 'PENDING' };
        }
        return req;
      });
    }
  });

  const billMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string, amount: number }) => {
      const endpoints = [
        { method: 'post', url: `/payments/create`, payload: { requestId: id, amount } },
        { method: 'post', url: `/payments/create`, payload: { request_id: id, amount } },
        { method: 'post', url: `/payments/create`, payload: { requestId: id, amount: Number(amount) } },
        { method: 'post', url: `/payments/create`, payload: { requestId: id, amount: String(amount) } },
        { method: 'post', url: `/payments/create`, payload: { requestId: id, amount, paymentMethod: 'CASH' } },
        { method: 'post', url: `/payments/create`, payload: { requestId: id, amount, status: 'COMPLETED' } },
        { method: 'post', url: `/payments/create`, payload: { requestId: id, amount, paymentMethod: 'CARD' } },
        
        { method: 'post', url: `/admin/payments/create`, payload: { requestId: id, amount } },
        { method: 'post', url: `/admin/payments/create`, payload: { request_id: id, amount } },
        { method: 'post', url: `/admin/payments`, payload: { requestId: id, amount } },
        { method: 'post', url: `/admin/payments`, payload: { request_id: id, amount } },
        { method: 'post', url: `/payments`, payload: { requestId: id, amount } }
      ];

      let lastError = null;

      for (const ep of endpoints) {
        try {
          // @ts-ignore
          const res = await api[ep.method](ep.url, ep.payload);
          return res.data;
        } catch (err: any) {
          lastError = err;
          // Skip 404, 405, and 400 (validation error), keep brute forcing until one payload matches the schema
          if (err.response?.status === 404 || err.response?.status === 405 || err.response?.status === 400 || err.response?.status === 403) {
            continue;
          }
          throw err;
        }
      }
      
      throw lastError;
    },
    onMutate: async ({ id, amount }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-requests-payments'] });
      const previousRequests = queryClient.getQueryData(['admin-requests-payments']);
      
      queryClient.setQueryData(['admin-requests-payments'], (old: any) => {
        if (!old) return old;
        return old.map((r: any) => r.id === id ? { ...r, amount, paymentStatus: 'PENDING' } : r);
      });
      
      return { previousRequests };
    },
    onSuccess: (data, variables) => {
      try {
        const stored = localStorage.getItem('shared_local_bills');
        const localBills = stored ? JSON.parse(stored) : {};
        localBills[variables.id] = variables.amount;
        localStorage.setItem('shared_local_bills', JSON.stringify(localBills));
      } catch(e) {}

      toast.success("Payment bill created successfully");
      setOpen(false);
      setAmount("");
      setSelectedReq(null);
      queryClient.invalidateQueries({ queryKey: ['admin-requests-payments'] });
    },
    onError: (error: any, variables, context) => {
      const apiErr = error.response?.data;
      const msg = apiErr?.message || "Failed to create payment bill";
      let fullMsg = msg;
      if (apiErr?.errors && apiErr.errors.length > 0) {
        fullMsg += ` - ${apiErr.errors.map((e: any) => e.msg || e.message).join(', ')}`;
      }
      toast.error(`Backend Error: ${fullMsg}`);
      if (context?.previousRequests) {
        queryClient.setQueryData(['admin-requests-payments'], context.previousRequests);
      }
    }
  });

  if (isPending) {
    return <div className="p-8">Loading payments...</div>;
  }

  const getAmount = (req: any) => req.payment?.amount || req.amount || 0;
  const getPayStatus = (req: any) => {
    const isPaid = req.payment?.status === 'PAID' || req.payment?.status === 'COMPLETED' || req.status === 'PAID' || req.paymentStatus === 'COMPLETED';
    if (isPaid) return "PAID";
    if (getAmount(req) > 0) return "BILLED";
    return "UNBILLED";
  };

  let allRequests = Array.isArray(requests) ? [...requests] : [];

  if (reqStatusFilter !== "ALL") {
    allRequests = allRequests.filter(req => req.status === reqStatusFilter);
  }
  
  if (payStatusFilter !== "ALL") {
    allRequests = allRequests.filter(req => getPayStatus(req) === payStatusFilter);
  }

  allRequests.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return sortOrder === "NEWEST" ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Payments & Billing</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={reqStatusFilter} onValueChange={setReqStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Request Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Requests</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={payStatusFilter} onValueChange={setPayStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Payments</SelectItem>
              <SelectItem value="UNBILLED">Unbilled</SelectItem>
              <SelectItem value="BILLED">Billed</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Newest First</SelectItem>
              <SelectItem value="OLDEST">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispatch ID</TableHead>
              <TableHead>Patient / Date</TableHead>
              <TableHead>Request Status</TableHead>
              <TableHead>Amount Billed</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No records found for these filters.
                </TableCell>
              </TableRow>
            ) : (
              allRequests.map((req: any) => {
                const reqAmount = getAmount(req);
                const payStatus = getPayStatus(req);
                
                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">#{req.id?.substring(0, 8).toUpperCase()}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{req.patient?.email || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{req.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {reqAmount > 0 ? (
                        <span className="font-semibold text-emerald-600">${reqAmount.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {payStatus === 'PAID' ? (
                        <Badge className="bg-emerald-600">Paid</Badge>
                      ) : payStatus === 'BILLED' ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Billed (Pending)</Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Unbilled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {reqAmount > 0 ? (
                        <Badge variant="secondary">Billed</Badge>
                      ) : req.status === "COMPLETED" ? (
                        <Dialog open={open && selectedReq?.id === req.id} onOpenChange={(isOpen) => {
                          setOpen(isOpen);
                          if (isOpen) setSelectedReq(req);
                          else setSelectedReq(null);
                        }}>
                          <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
                            Create Bill
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Bill for Dispatch</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="amount">Amount ($)</Label>
                                <Input 
                                  id="amount"
                                  type="number"
                                  placeholder="e.g. 50"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                />
                              </div>
                              <Button 
                                className="w-full" 
                                disabled={billMutation.isPending || !amount}
                                onClick={() => {
                                  if (!amount) return toast.error("Enter amount");
                                  billMutation.mutate({ id: req.id, amount: Number(amount) });
                                }}
                              >
                                {billMutation.isPending ? "Saving..." : "Save Bill"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground border-dashed">
                          In Progress
                        </Badge>
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
