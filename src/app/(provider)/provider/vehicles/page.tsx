"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

export default function ProviderVehiclesPage() {
  const { data: session, status: sessionStatus } = useSession();
  
  const userId = (session?.user as any)?.id;

  const { data: ambulances, isLoading: loadingAmbulances, refetch: refetchAmbulances } = useQuery({
    queryKey: ['ambulances'],
    queryFn: async () => {
      const res = await api.get('/ambulances');
      return res.data.data.ambulances;
    },
    enabled: !!userId,
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

  if (sessionStatus === "loading" || loadingAmbulances) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  const assignedAmbulances = Array.isArray(ambulances) ? ambulances.filter((amb: any) => amb.driver?.id === userId) : [];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assigned Vehicles</h2>
          <p className="text-muted-foreground mt-1">Manage the status of the ambulances assigned to you.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6">
          {assignedAmbulances.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-xl bg-gray-50/50">
              <h3 className="text-lg font-medium text-gray-900">No vehicles assigned</h3>
              <p className="text-sm text-gray-500 mt-2">You currently have no ambulances assigned to you.</p>
            </div>
          ) : (
            assignedAmbulances.map((amb: any) => {
              const isOnline = amb.status === "AVAILABLE";
              return (
                <Card key={amb.id} className="bg-gray-50/50 border-gray-100 shadow-sm">
                  <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-full shrink-0">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">Vehicle: {amb.vehicleNumber}</h3>
                      <p className="text-sm text-gray-600 capitalize">Type: {amb.type?.toLowerCase() || 'Standard'}</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col md:flex-row md:items-center gap-4 shrink-0">
                      <div className="flex flex-col md:items-end">
                         <p className="text-sm text-gray-500 mb-1">Current Status</p>
                         <Badge variant={isOnline ? "outline" : "secondary"} className={isOnline ? "border-emerald-600 text-emerald-700" : ""}>
                           {amb.status}
                         </Badge>
                      </div>
                      <Select 
                        value={amb.status} 
                        onValueChange={(val) => updateAmbulanceMutation.mutate({ ambulanceId: amb.id, status: val })}
                        disabled={updateAmbulanceMutation.isPending}
                      >
                        <SelectTrigger className="w-44 bg-white">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AVAILABLE">Available (Online)</SelectItem>
                          <SelectItem value="BUSY">Busy (Offline)</SelectItem>
                          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
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
