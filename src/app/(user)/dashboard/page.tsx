"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, CreditCard, Ambulance, Truck, User } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboard() {
  const [filter, setFilter] = useState("ALL");

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
      return res.data.data || res.data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.success("Payment initiated");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to initiate payment");
    }
  });

  if (isPending) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-10 w-80 mt-4" />
        <div className="grid gap-4 mt-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
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

  let filteredRequests = Array.isArray(requests) ? [...requests] : [];
  filteredRequests.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  if (filter === "CURRENT") {
    filteredRequests = filteredRequests.filter(req => !['COMPLETED', 'CANCELLED'].includes(req.status));
  } else if (filter === "PAST") {
    filteredRequests = filteredRequests.filter(req => ['COMPLETED', 'CANCELLED'].includes(req.status));
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your active emergency ambulance dispatches and view past booking history.
          </p>
        </div>
        <Link href="/dashboard/request">
          <Button>
            + Request Ambulance
          </Button>
        </Link>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mt-4">
        <TabsList>
          <TabsTrigger value="ALL">All Bookings ({Array.isArray(requests) ? requests.length : 0})</TabsTrigger>
          <TabsTrigger value="CURRENT">
            Current & Active ({Array.isArray(requests) ? requests.filter((r: any) => !['COMPLETED', 'CANCELLED'].includes(r.status)).length : 0})
          </TabsTrigger>
          <TabsTrigger value="PAST">
            Past History ({Array.isArray(requests) ? requests.filter((r: any) => ['COMPLETED', 'CANCELLED'].includes(r.status)).length : 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={filter} className="mt-4">
          {filteredRequests.length === 0 ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center">
              <Ambulance className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No bookings found</h3>
              <p className="text-sm text-muted-foreground">You don&apos;t have any {filter.toLowerCase()} ambulance bookings yet.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((req: any) => {
                const payment = getPaymentObj(req);
                const amount = Number(payment?.amount || req.amount || 0);
                const isPaid = payment?.status === "SUCCESS" || payment?.status === "PAID" || req.paymentStatus === "SUCCESS";
                const isBilled = !isPaid && payment && amount > 0;
                const assignedAmb = req.ambulance || req.dispatch?.ambulance;
                const assignedDriver = req.driver || req.dispatch?.driver;

                return (
                  <Card key={req.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg">Dispatch #{req.id?.substring(0, 8).toUpperCase()}</CardTitle>
                        <Badge variant={req.priority === "CRITICAL" || req.priority === "HIGH" ? "destructive" : "outline"}>
                          {req.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPaid ? (
                          <Badge className="bg-emerald-600">Paid: ${amount.toFixed(2)}</Badge>
                        ) : isBilled ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Bill Due: ${amount.toFixed(2)}
                          </Badge>
                        ) : null}
                        <Badge variant={req.status === "COMPLETED" ? "secondary" : "default"}>
                          {req.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" /> {new Date(req.createdAt).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-muted-foreground">Pickup:</span>
                        <span className="font-medium">{req.pickupAddress || req.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span className="text-muted-foreground">Destination:</span>
                        <span className="font-medium">{req.destinationAddress || req.dropoffLocation}</span>
                      </div>
                      {assignedAmb && (
                        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-blue-800 bg-blue-50/80 px-3 py-2 rounded-md border border-blue-100">
                          <span className="flex items-center gap-1 font-medium">
                            <Truck className="h-3.5 w-3.5" />
                            Ambulance: {assignedAmb.vehicleNumber} ({assignedAmb.type})
                          </span>
                          {assignedDriver && (
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              Driver: {assignedDriver.profile?.firstName ? `${assignedDriver.profile.firstName} (${assignedDriver.email})` : assignedDriver.email}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                    {req.status === "COMPLETED" && (
                      <CardFooter className="bg-muted/50 py-3 flex flex-wrap justify-between items-center gap-2">
                        {isPaid ? (
                          <span className="text-sm font-medium text-emerald-600">
                            Payment Completed (${amount.toFixed(2)})
                          </span>
                        ) : isBilled ? (
                          <span className="text-sm font-medium text-blue-700">
                            Admin generated a bill of ${amount.toFixed(2)}. Ready for payment.
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Trip Completed — Waiting for Admin to generate bill
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          {isBilled && (
                            <Button
                              size="sm"
                              className="gap-1.5"
                              disabled={payMutation.isPending}
                              onClick={() => payMutation.mutate(req.id)}
                            >
                              <CreditCard className="h-4 w-4" />
                              Pay Now (${amount.toFixed(2)})
                            </Button>
                          )}
                          <Link href="/dashboard/payments">
                            <Button size="sm" variant="outline" className="gap-1.5">
                              View in Payments
                            </Button>
                          </Link>
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
