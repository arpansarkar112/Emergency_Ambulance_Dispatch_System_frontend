"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, MapPin, Calendar, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

export default function EarningsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const { data: requests, isLoading } = useQuery({
    queryKey: ['provider-requests', userId],
    queryFn: async () => {
      const res = await api.get('/requests/my-requests');
      return res.data.data;
    },
    enabled: !!userId,
    refetchInterval: 8000,
  });

  if (isLoading) {
    return <div className="p-8">Loading earnings data...</div>;
  }

  const allRequests = Array.isArray(requests) ? requests : [];
  const completedTrips = allRequests.filter((req: any) => req.status === 'COMPLETED');

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

  const isPaidOrder = (req: any) => {
    const p = getPaymentObj(req);
    return p?.status === 'SUCCESS' || p?.status === 'PAID' || req.paymentStatus === 'SUCCESS';
  };

  const isPendingBillOrder = (req: any) => {
    const p = getPaymentObj(req);
    return !isPaidOrder(req) && p && Number(p.amount) > 0;
  };

  const paidOrders = completedTrips.filter(isPaidOrder);
  const pendingBillOrders = completedTrips.filter(isPendingBillOrder);

  const totalEarnings = paidOrders.reduce((sum, req) => sum + getAmount(req), 0);
  const pendingEarnings = pendingBillOrders.reduce((sum, req) => sum + getAmount(req), 0);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Earnings & Billing Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {paidOrders.length} paid trip(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Patient Payments</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${pendingEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {pendingBillOrders.length} billed trip(s) awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips.length}</div>
            <p className="text-xs text-muted-foreground">Lifetime completed dispatches</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Completed Trips & Payment Status</h3>
        <div className="grid gap-6">
          {completedTrips.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-xl bg-gray-50/50">
              <h3 className="text-lg font-medium text-gray-900">No completed trips yet</h3>
              <p className="text-sm text-gray-500 mt-2">Complete assigned dispatches to see billing and payment status here.</p>
            </div>
          ) : (
            completedTrips.map((req: any) => {
              const amount = getAmount(req);
              const paid = isPaidOrder(req);
              const billed = isPendingBillOrder(req);

              return (
                <Card key={req.id} className="overflow-hidden shadow-sm border-gray-100">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 bg-gray-50/50 border-b border-gray-100 pb-4">
                    <div>
                      <CardTitle className="text-lg">Dispatch #{req.id?.substring(0, 8).toUpperCase()}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(req.updatedAt || req.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      {amount > 0 ? (
                        <div className="text-xl font-bold text-emerald-600">
                          ${amount.toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Unbilled</div>
                      )}
                      {paid ? (
                        <Badge className="mt-1 bg-emerald-600">
                          Paid (Completed)
                        </Badge>
                      ) : billed ? (
                        <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800">
                          Billed (Pending Patient Payment)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1 text-yellow-600 border-yellow-600">
                          Awaiting Admin Bill
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium text-gray-900">{req.pickupAddress || req.pickupLocation}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium text-gray-900">{req.destinationAddress || req.dropoffLocation}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
