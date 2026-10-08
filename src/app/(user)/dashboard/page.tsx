"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, CreditCard, Ambulance } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function UserDashboard() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [urgency, setUrgency] = useState("HIGH");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const res = await api.get('/requests/my-requests');
      return res.data.data;
    }
  });

  const requestMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/requests', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ambulance requested successfully!");
      setIsDialogOpen(false);
      setPickup("");
      setDropoff("");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to request ambulance");
    }
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestMutation.mutate({
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      urgency
    });
  };

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

  if (isLoading) {
    return <div className="p-8">Loading your requests...</div>;
  }

  const activeRequests = Array.isArray(requests) ? requests : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className={buttonVariants()}>
            Request Ambulance
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request an Ambulance</DialogTitle>
              <DialogDescription>
                Enter your location details. An ambulance will be dispatched immediately.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRequestSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="pickup" 
                    placeholder="Enter pickup address" 
                    className="pl-9"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff">Destination</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="dropoff" 
                    placeholder="Enter hospital name" 
                    className="pl-9"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger id="urgency">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={requestMutation.isPending}>
                <Ambulance className="mr-2 h-4 w-4" />
                {requestMutation.isPending ? "Dispatching..." : "Request"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {activeRequests.length === 0 ? (
        <Card className="mt-4 p-12 flex flex-col items-center justify-center text-center">
          <Ambulance className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No requests found</h3>
          <p className="text-sm text-muted-foreground">You don't have any active or past ambulance requests.</p>
        </Card>
      ) : (
        <div className="grid gap-4 mt-4">
          {activeRequests.map((req: any) => (
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
                  Pickup: {req.pickupLocation}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Destination: {req.dropoffLocation}
                </div>
              </CardContent>
              {req.status === "COMPLETED" && (
                <CardFooter className="bg-muted/50 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium">Payment Required</span>
                  <Button 
                    size="sm" 
                    className="gap-2" 
                    onClick={() => payMutation.mutate(req.id)}
                    disabled={payMutation.isPending}
                  >
                    <CreditCard className="h-4 w-4" />
                    {payMutation.isPending ? "Connecting..." : "Pay Now with Stripe"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
