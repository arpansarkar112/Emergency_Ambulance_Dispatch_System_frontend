"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Truck } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";

export default function ProviderTasksPage() {
  const { data: session, status: sessionStatus } = useSession();
  
  const userId = (session?.user as any)?.id;

  const { data: requests, isLoading: loadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['provider-requests'],
    queryFn: async () => {
      const res = await api.get('/requests/my-requests');
      return res.data.data;
    },
    enabled: !!userId,
  });

  const { data: ambulances, isLoading: loadingAmbulances, refetch: refetchAmbulances } = useQuery({
    queryKey: ['ambulances'],
    queryFn: async () => {
      const res = await api.get('/ambulances');
      return res.data.data.ambulances;
    },
    enabled: !!userId,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string, status: string }) => {
      const res = await api.patch('/requests/status', { requestId, status });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Task status updated successfully!");
      refetchRequests();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update task status");
    }
  });

  const updateAmbulanceMutation = useMutation({
    mutationFn: async ({ ambulanceId, status }: { ambulanceId: string, status: string }) => {
      const res = await api.patch('/ambulances', { ambulanceId, status });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ambulance status updated!");
      refetchAmbulances();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update ambulance");
    }
  });

  if (sessionStatus === "loading" || loadingRequests || loadingAmbulances) {
    return <div className="p-8">Loading your dashboard...</div>;
  }

  const activeRequests = Array.isArray(requests) ? requests : [];
  const driverAmbulance = Array.isArray(ambulances) ? ambulances.find((amb: any) => amb.driver?.id === userId) : null;
  const isOnline = driverAmbulance?.status === "AVAILABLE";

  const toggleOnlineStatus = () => {
    if (!driverAmbulance) return;
    const newStatus = isOnline ? "BUSY" : "AVAILABLE";
    updateAmbulanceMutation.mutate({ ambulanceId: driverAmbulance.id, status: newStatus });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Driver Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage your active dispatches and vehicle status.</p>
        </div>
        <div className="flex items-center gap-4">
          {driverAmbulance ? (
            <Button 
              variant={isOnline ? "default" : "secondary"} 
              className={isOnline ? "bg-emerald-600 hover:bg-emerald-700 w-32" : "w-32"}
              onClick={toggleOnlineStatus}
              disabled={updateAmbulanceMutation.isPending}
            >
              {updateAmbulanceMutation.isPending ? "Updating..." : (isOnline ? "Online" : "Offline")}
            </Button>
          ) : (
            <Badge variant="outline" className="text-sm px-3 py-1">No Vehicle Assigned</Badge>
          )}
        </div>
      </div>

      {driverAmbulance && (
        <Card className="bg-gray-50/50 border-gray-100 shadow-sm mt-4">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Your Vehicle: {driverAmbulance.vehicleNumber}</h3>
              <p className="text-sm text-gray-600 capitalize">Type: {driverAmbulance.type.toLowerCase()}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-medium text-gray-900">Current Status</p>
              <Badge variant={isOnline ? "outline" : "secondary"} className={isOnline ? "border-emerald-600 text-emerald-700 mt-1" : "mt-1"}>
                {driverAmbulance.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 mt-8">
        <h3 className="text-xl font-semibold">Active Dispatches</h3>
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
                      req.priority === 'CRITICAL' ? 'destructive' :
                      req.priority === 'HIGH' ? 'destructive' :
                      req.priority === 'MEDIUM' ? 'default' : 'secondary'
                    }>
                      {req.priority || "NORMAL"}
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
                        <p className="text-gray-600">{req.pickupAddress || req.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-700">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Destination (Hospital)</p>
                        <p className="text-gray-600">{req.destinationAddress || req.dropoffLocation}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-end gap-3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-100">
                    <Select 
                      value={req.status} 
                      onValueChange={(val) => updateRequestMutation.mutate({ requestId: req.id, status: val })}
                      disabled={req.status === 'COMPLETED' || req.status === 'CANCELLED'}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING" disabled>Pending Assignment</SelectItem>
                        <SelectItem value="ASSIGNED">Assigned (Ready)</SelectItem>
                        <SelectItem value="EN_ROUTE">En Route to Patient</SelectItem>
                        <SelectItem value="ARRIVED">Arrived at Pickup</SelectItem>
                        <SelectItem value="IN_TRANSIT">In Transit to Hospital</SelectItem>
                        <SelectItem value="COMPLETED">Completed Dropoff</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <a href={`tel:${req.patientPhone || req.patient?.profile?.phone}`} className="w-full">
                      <Button className="w-full justify-start gap-2" variant="outline" type="button">
                        <Phone className="h-4 w-4" /> Contact {req.patient?.profile?.firstName || "Patient"}
                      </Button>
                    </a>
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
