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
      const res = await api.get('/requests?limit=100');
      const data = res.data.data;
      return data?.requests || data?.data || (Array.isArray(data) ? data : []);
    },
    refetchInterval: 8000,
  });

  const billMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const res = await api.post('/payments/create', { requestId: id, amount: Number(amount) });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Payment bill generated for patient! Status is Pending until patient pays.");
      setOpen(false);
      setAmount("");
      setSelectedReq(null);
      queryClient.invalidateQueries({ queryKey: ['admin-requests-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
    },
    onError: (error: any) => {
      const apiErr = error.response?.data;
      let msg = apiErr?.message || "Failed to create payment bill";
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

  const getAmount = (req: any) => {
    const p = getPaymentObj(req);
    return Number(p?.amount || req.amount || 0);
  };

  const getPayStatus = (req: any): "PAID" | "BILLED" | "UNBILLED" => {
    const p = getPaymentObj(req);
    if (p?.status === "SUCCESS" || p?.status === "PAID" || req.paymentStatus === "SUCCESS") {
      return "PAID";
    }
    if (p && Number(p.amount) > 0) {
      return "BILLED";
    }
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments & Billing</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate bills for completed emergency dispatches and track patient payment status.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={reqStatusFilter} onValueChange={(v) => setReqStatusFilter(v || "ALL")}>
            <SelectTrigger className="w-[155px]">
              <SelectValue placeholder="Request Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Requests</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="EN_ROUTE">En Route</SelectItem>
              <SelectItem value="PICKED_UP">Picked Up</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={payStatusFilter} onValueChange={(v) => setPayStatusFilter(v || "ALL")}>
            <SelectTrigger className="w-[155px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Payments</SelectItem>
              <SelectItem value="UNBILLED">Unbilled</SelectItem>
              <SelectItem value="BILLED">Billed (Pending)</SelectItem>
              <SelectItem value="PAID">Paid (Completed)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v || "NEWEST")}>
            <SelectTrigger className="w-[135px]">
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
              <TableHead>Criticality</TableHead>
              <TableHead>Request Status</TableHead>
              <TableHead>Amount Billed</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                      <div className="text-sm font-medium">{req.patient?.email || "Patient"}</div>
                      <div className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={req.priority === "CRITICAL" || req.priority === "HIGH" ? "destructive" : "secondary"}>
                        {req.priority}
                      </Badge>
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
                        <Badge className="bg-emerald-600">Paid (Completed)</Badge>
                      ) : payStatus === 'BILLED' ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Billed (Pending Payment)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Unbilled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {payStatus === 'PAID' ? (
                        <Badge className="bg-emerald-600">Paid</Badge>
                      ) : req.status === "COMPLETED" ? (
                        <Dialog
                          open={open && selectedReq?.id === req.id}
                          onOpenChange={(isOpen) => {
                            setOpen(isOpen);
                            if (isOpen) {
                              setSelectedReq(req);
                              setAmount(reqAmount > 0 ? String(reqAmount) : "");
                            } else {
                              setSelectedReq(null);
                              setAmount("");
                            }
                          }}
                        >
                          <DialogTrigger className={buttonVariants({ variant: payStatus === "BILLED" ? "ghost" : "outline", size: "sm" })}>
                            {payStatus === "BILLED" ? "Update Bill" : "Create Bill"}
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {payStatus === "BILLED" ? "Update Bill" : "Create Bill"} for Dispatch #{req.id?.substring(0, 8).toUpperCase()}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Patient: <span className="font-medium text-foreground">{req.patient?.email}</span></p>
                                <p>Route: <span className="font-medium text-foreground">{req.pickupAddress} → {req.destinationAddress}</span></p>
                                <p>Criticality: <span className="font-medium text-foreground">{req.priority}</span></p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="amount">Bill Amount ($ USD)</Label>
                                <Input 
                                  id="amount"
                                  type="number"
                                  min="1"
                                  step="0.01"
                                  placeholder="e.g. 150"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                />
                              </div>
                              <Button 
                                className="w-full" 
                                disabled={billMutation.isPending || !amount || Number(amount) <= 0}
                                onClick={() => {
                                  if (!amount || Number(amount) <= 0) return toast.error("Please enter a valid positive amount");
                                  billMutation.mutate({ id: req.id, amount: Number(amount) });
                                }}
                              >
                                {billMutation.isPending ? "Generating Bill..." : "Send Bill to Patient"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : null}
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
