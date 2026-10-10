"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Clock } from "lucide-react";
import { useState } from "react";

export default function AdminRequestsPage() {
  const queryClient = useQueryClient();
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<string>("NEWEST");

  const { data: requests, isPending: requestsLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const res = await api.get('/requests');
      const data = res.data.data;
      return data?.requests || data?.data || (Array.isArray(data) ? data : []);
    }
  });

  const { data: ambulances, isPending: ambulancesLoading } = useQuery({
    queryKey: ['admin-ambulances'],
    queryFn: async () => {
      const res = await api.get('/ambulances');
      const data = res.data.data;
      return data?.ambulances || data?.data || (Array.isArray(data) ? data : []);
    }
  });

  const assignMutation = useMutation({
    mutationFn: async ({ requestId, ambulanceId }: { requestId: string, ambulanceId: string }) => {
      const endpoints = [
        { method: 'patch', url: `/requests/assign`, payload: { requestId, ambulanceId } },
        { method: 'post', url: `/requests/assign`, payload: { requestId, ambulanceId } },
        { method: 'patch', url: `/admin/requests/assign`, payload: { requestId, ambulanceId } },
        { method: 'post', url: `/admin/requests/assign`, payload: { requestId, ambulanceId } },
        { method: 'patch', url: `/requests/${requestId}/assign`, payload: { ambulanceId } },
        { method: 'post', url: `/requests/${requestId}/assign`, payload: { ambulanceId } },
        { method: 'patch', url: `/admin/requests/${requestId}/assign`, payload: { ambulanceId } },
        { method: 'post', url: `/admin/requests/${requestId}/assign`, payload: { ambulanceId } },
        { method: 'patch', url: `/requests/${requestId}`, payload: { ambulanceId, status: 'ASSIGNED' } },
        { method: 'patch', url: `/admin/requests/${requestId}`, payload: { ambulanceId, status: 'ASSIGNED' } }
      ];

      let lastError = null;

      for (const ep of endpoints) {
        try {
          // @ts-ignore
          const res = await api[ep.method](ep.url, ep.payload);
          return res.data;
        } catch (err: any) {
          lastError = err;
          if (err.response?.status === 404 || err.response?.status === 405 || err.response?.status === 400 || err.response?.status === 403) {
            continue;
          }
          throw err;
        }
      }
      throw lastError || new Error("All endpoints failed");
    },
    onSuccess: () => {
      toast.success("Ambulance assigned successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      setAssigningId(null);
    },
    onError: (error: any) => {
      const apiErr = error.response?.data;
      const msg = apiErr?.message || "Failed to assign ambulance";
      let fullMsg = msg;
      if (apiErr?.errors && apiErr.errors.length > 0) {
        fullMsg += ` - ${apiErr.errors.map((e: any) => e.msg || e.message).join(', ')}`;
      }
      toast.error(`Error: ${fullMsg}`);
      setAssigningId(null);
    }
  });

  if (requestsLoading || ambulancesLoading) {
    return <div className="p-8">Loading data...</div>;
  }

  let allRequests = Array.isArray(requests) ? [...requests] : [];
  const allAmbulances = Array.isArray(ambulances) ? ambulances : [];
  const availableAmbulances = allAmbulances.filter(a => a.status === 'AVAILABLE');

  if (statusFilter !== "ALL") {
    allRequests = allRequests.filter(req => req.status === statusFilter);
  }

  allRequests.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return sortOrder === "NEWEST" ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Emergency Requests</h2>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Newest First</SelectItem>
              <SelectItem value="OLDEST">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 mt-4">
        {allRequests.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-medium">No requests found</h3>
            <p className="text-sm text-muted-foreground">There are no emergency requests.</p>
          </Card>
        ) : (
          allRequests.map((req: any) => (
            <Card key={req.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50 border-b">
                <div>
                  <CardTitle className="text-lg">Dispatch #{req.id?.substring(0, 8).toUpperCase()}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /> {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>
                <Badge variant={
                  req.status === "COMPLETED" ? "secondary" : 
                  req.status === "ASSIGNED" ? "default" : "destructive"
                }>
                  {req.status}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium">{req.pickupAddress || req.pickupLocation}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium">{req.destinationAddress || req.dropoffLocation}</span>
                  </div>
                  <div className="text-gray-600 mt-2">
                    Patient Phone: <span className="font-medium">{req.patientPhone}</span>
                  </div>
                  <div className="text-gray-600">
                    Priority: <span className="font-medium">{req.priority}</span>
                  </div>
                </div>
                
                <div className="flex items-end">
                  {req.status === "PENDING" ? (
                    <div className="flex items-center gap-2">
                      <Select 
                        disabled={assignMutation.isPending || availableAmbulances.length === 0}
                        onValueChange={(val) => {
                          setAssigningId(req.id);
                          assignMutation.mutate({ requestId: req.id, ambulanceId: val });
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder={availableAmbulances.length === 0 ? "No available ambulances" : "Assign Ambulance"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAmbulances.map(amb => (
                            <SelectItem key={amb.id} value={amb.id}>
                              {amb.vehicleNumber} ({amb.vehicleType})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {assigningId === req.id && <span className="text-xs text-gray-500">Assigning...</span>}
                    </div>
                  ) : req.ambulanceId ? (
                    <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md border border-blue-100">
                      Assigned to Ambulance ID: {req.ambulanceId.substring(0,8)}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
