"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProviderTasksPage() {
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['provider-requests'],
    queryFn: async () => {
      const res = await api.get('/requests/my-requests');
      return res.data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string, status: string }) => {
      const res = await api.patch('/requests/status', { requestId, status });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Status updated successfully!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  });

  if (isLoading) {
    return <div className="p-8">Loading your tasks...</div>;
  }

  const activeRequests = Array.isArray(requests) ? requests : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Driver Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage your active and completed dispatches.</p>
        </div>
        <Badge variant="default" className="text-sm px-4 py-1.5 font-medium shadow-sm bg-emerald-600 hover:bg-emerald-700">Online & Available</Badge>
      </div>

      <div className="grid gap-6 mt-8">
        {activeRequests.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-xl bg-gray-50/50">
            <h3 className="text-lg font-medium text-gray-900">No active requests</h3>
            <p className="text-sm text-gray-500 mt-2">You currently have no dispatches assigned to you.</p>
          </div>
        ) : (
          activeRequests.map((req: any) => (
            <Card key={req.id} className="overflow-hidden shadow-sm border-gray-100">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 bg-gray-50/50 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">Dispatch #{req.id.slice(-6).toUpperCase()}</CardTitle>
                    <Badge variant={
                      req.urgency === 'CRITICAL' ? 'destructive' :
                      req.urgency === 'HIGH' ? 'destructive' :
                      req.urgency === 'MEDIUM' ? 'default' : 'secondary'
                    }>
                      {req.urgency}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4 text-muted-foreground" /> 
                    Status: <span className="text-primary">{req.status}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-blue-100 p-1.5 text-blue-700">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Pickup Location</p>
                        <p className="text-gray-600">{req.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-700">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Destination (Hospital)</p>
                        <p className="text-gray-600">{req.dropoffLocation}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-end gap-3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-100">
                    <Select 
                      value={req.status} 
                      onValueChange={(val) => updateStatusMutation.mutate({ requestId: req.id, status: val })}
                      disabled={req.status === 'COMPLETED' || req.status === 'CANCELLED'}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EN_ROUTE">En Route to Patient</SelectItem>
                        <SelectItem value="ARRIVED">Arrived at Pickup</SelectItem>
                        <SelectItem value="IN_TRANSIT">In Transit to Hospital</SelectItem>
                        <SelectItem value="COMPLETED">Completed Dropoff</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Phone className="h-4 w-4" /> Contact Patient
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
