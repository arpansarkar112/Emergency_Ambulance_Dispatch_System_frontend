"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, MapPin, Calendar } from "lucide-react";
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
  });

  if (isLoading) {
    return <div className="p-8">Loading earnings data...</div>;
  }

  const allRequests = Array.isArray(requests) ? requests : [];
  
  // Filter for completed orders
  const completedTrips = allRequests.filter((req: any) => req.status === 'COMPLETED');
  
  const getAmount = (req: any) => req.payment?.amount || req.amount || 0;
  
  // Try to find paid orders
  const paidOrders = completedTrips.filter((req: any) => {
    const isExplicitlyPaid = req.payment?.status === 'PAID' || req.payment?.status === 'COMPLETED' || req.status === 'PAID';
    const hasAmount = getAmount(req) > 0;
    return isExplicitlyPaid || hasAmount || req.payment;
  });
  
  // Sum up earnings
  const totalEarnings = paidOrders.reduce((sum, req) => sum + getAmount(req), 0);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Earnings Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all paid trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips.length}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Completed Paid Orders</h3>
        <div className="grid gap-6">
          {paidOrders.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-xl bg-gray-50/50">
              <h3 className="text-lg font-medium text-gray-900">No paid orders yet</h3>
              <p className="text-sm text-gray-500 mt-2">You don't have any completed orders with payment data.</p>
            </div>
          ) : (
            paidOrders.map((req: any) => (
              <Card key={req.id} className="overflow-hidden shadow-sm border-gray-100">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 bg-gray-50/50 border-b border-gray-100 pb-4">
                  <div>
                    <CardTitle className="text-lg">Order #{req.id?.slice(-6).toUpperCase()}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(req.updatedAt || req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-600">
                      ${getAmount(req).toFixed(2)}
                    </div>
                    <Badge variant="outline" className="mt-1 border-emerald-600 text-emerald-700 bg-emerald-50">
                      Paid
                    </Badge>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
