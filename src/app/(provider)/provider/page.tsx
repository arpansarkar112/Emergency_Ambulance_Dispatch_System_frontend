"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Truck } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

export default function ProviderTasksPage() {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const userId = (session?.user as any)?.id;

  const { data: requests, isLoading: loadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['provider-requests', userId],
    queryFn: async () => {
      const res = await api.get('/requests/my-requests');
      return res.data.data;
    },
    enabled: !!userId,
    refetchInterval: 8000,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const res = await api.patch('/requests/status', { requestId, status });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      toast.success(`Emergency status updated to ${variables.status}!`);
      refetchRequests();
      queryClient.invalidateQueries({ queryKey: ['ambulances'] });
    },
    onError: (error: any) => {
      const apiErr = error.response?.data;
      let msg = apiErr?.message || "Failed to update task status";
      if (apiErr?.errors && apiErr.errors.length > 0) {
        msg += ` - ${apiErr.errors.map((e: any) => e.message || e.msg).join(', ')}`;
      }
      toast.error(msg);
    }
  });

  if (sessionStatus === "loading" || loadingRequests) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    );
  }

  const allRequests = Array.isArray(requests) ? [...requests] : [];
  
  const activeRequests = allRequests
    .filter((req: any) => !['COMPLETED', 'CANCELLED'].includes(req.status))
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const completedRequests = allRequests
    .filter((req: any) => ['COMPLETED', 'CANCELLED'].includes(req.status))
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const getPaymentInfo = (req: any) => {
    const p = req.payment || (Array.isArray(req.payments) ? req.payments[0] : null);
    if (!p) return { status: "UNBILLED", amount: 0 };
    return { status: p.status, amount: Number(p.amount || 0) };
  };

  const renderRequestCard = (req: any) => {
    const payInfo = getPaymentInfo(req);
    const amb = req.ambulance || req.dispatch?.ambulance;

    return (
      <Card key={req.id} className="overflow-hidden shadow-sm border-gray-100">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 bg-gray-50/50 border-b border-gray-100 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-xl">Dispatch #{req.id?.substring(0, 8).toUpperCase()}</CardTitle>
              <Badge variant={
                req.priority === 'CRITICAL' ? 'destructive' :
                req.priority === 'HIGH' ? 'destructive' :
                req.priority === 'MEDIUM' ? 'default' : 'secondary'
              }>
                Criticality: {req.priority || "MEDIUM"}
              </Badge>
              {amb && (
                <Badge variant="outline" className="gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  {amb.vehicleNumber} ({amb.type})
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4 text-muted-foreground" /> 
              Emergency Status: <span className="text-primary font-semibold">{req.status}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {payInfo.status === "SUCCESS" ? (
              <Badge className="bg-emerald-600">Paid: ${payInfo.amount.toFixed(2)}</Badge>
            ) : payInfo.amount > 0 ? (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Billed: ${payInfo.amount.toFixed(2)} (Pending Payment)
              </Badge>
            ) : req.status === "COMPLETED" ? (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                Awaiting Admin Bill
              </Badge>
            ) : null}
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
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Update Emergency Situation Status</span>
                <Select 
                  value={req.status} 
                  onValueChange={(val) => {
                    if (val) updateRequestMutation.mutate({ requestId: req.id, status: val });
                  }}
                  disabled={req.status === 'COMPLETED' || req.status === 'CANCELLED' || updateRequestMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSIGNED">ASSIGNED — Ready to Depart</SelectItem>
                    <SelectItem value="EN_ROUTE">EN_ROUTE — En Route to Patient</SelectItem>
                    <SelectItem value="PICKED_UP">PICKED_UP — Patient Picked Up</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED — Delivered to Hospital</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED — Emergency Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <a href={`tel:${req.patientPhone || req.patient?.profile?.phone}`} className="w-full">
                <Button className="w-full justify-start gap-2" variant="outline" type="button">
                  <Phone className="h-4 w-4" /> Contact {req.patient?.profile?.firstName || "Patient"} ({req.patientPhone || "N/A"})
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Driver Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Update the emergency situation status as you respond to allocated dispatches.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Active Dispatches ({activeRequests.length})</h3>
        <div className="grid gap-6">
          {activeRequests.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-xl bg-gray-50/50">
              <h3 className="text-lg font-medium text-gray-900">No active requests</h3>
              <p className="text-sm text-gray-500 mt-2">You currently have no active dispatches assigned to you.</p>
            </div>
          ) : (
            activeRequests.map(renderRequestCard)
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Completed & Past Dispatches ({completedRequests.length})</h3>
        <div className="grid gap-6">
          {completedRequests.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-xl bg-gray-50/50">
              <h3 className="text-lg font-medium text-gray-900">No completed requests</h3>
              <p className="text-sm text-gray-500 mt-2">You have not completed any dispatches yet.</p>
            </div>
          ) : (
            completedRequests.map(renderRequestCard)
          )}
        </div>
      </div>
    </div>
  );
}
