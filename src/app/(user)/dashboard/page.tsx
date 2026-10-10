"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, CreditCard, Ambulance } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UserDashboard() {
  const [filter, setFilter] = useState("ALL");
  const { data: requests, isPending } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const res = await api.get('/requests/my-requests');
      const apiRequests = res.data.data || [];
      
      // The backend endpoint might be bugged and return [] for patients
      // We will merge with any locally cached requests from localStorage
      let localRequests = [];
      try {
        const stored = localStorage.getItem('local_patient_requests');
        if (stored) localRequests = JSON.parse(stored);
      } catch(e) {}
      
      const apiIds = new Set(apiRequests.map((r: any) => r.id));
      const missingLocalRequests = localRequests.filter((r: any) => !apiIds.has(r.id));
      
      return [...apiRequests, ...missingLocalRequests];
    }
  });

  const payMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await api.post('/payments/initiate', { requestId });
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to initiate payment");
    }
  });

  if (isPending) {
    return <div className="p-8">Loading your requests...</div>;
  }

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
        <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
        <Link href="/dashboard/request">
          <Button>
            Request Ambulance
          </Button>
        </Link>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mt-4">
        <TabsList>
          <TabsTrigger value="ALL">All Bookings</TabsTrigger>
          <TabsTrigger value="CURRENT">Current & Active</TabsTrigger>
          <TabsTrigger value="PAST">Past History</TabsTrigger>
        </TabsList>
        
        <TabsContent value={filter} className="mt-4">
          {filteredRequests.length === 0 ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center">
              <Ambulance className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No requests found</h3>
              <p className="text-sm text-muted-foreground">You don't have any {filter.toLowerCase()} ambulance requests.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((req: any) => (
                <Card key={req.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg">Dispatch #{req.id.substring(0, 8).toUpperCase()}</CardTitle>
                    <Badge variant={req.status === "COMPLETED" ? "secondary" : "default"}>
                      {req.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" /> {new Date(req.createdAt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Pickup: {(req.pickupAddress || req.pickupLocation)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Destination: {(req.destinationAddress || req.dropoffLocation)}
                    </div>
                  </CardContent>
                  {req.status === "COMPLETED" && (
                    <CardFooter className="bg-muted/50 py-3 flex justify-between items-center">
                      <span className="text-sm font-medium">Booking Completed</span>
                      <Link href="/dashboard/payments">
                        <Button size="sm" variant="outline" className="gap-2">
                          <CreditCard className="h-4 w-4" />
                          View Billing Options
                        </Button>
                      </Link>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
