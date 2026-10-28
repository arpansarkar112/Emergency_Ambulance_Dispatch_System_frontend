"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Clock, Truck, User, DollarSign } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const PRIORITY_RANK: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export default function AdminRequestsPage() {
  const queryClient = useQueryClient();
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<string>("NEWEST");

  const { data: requests, isPending: requestsLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const res = await api.get('/requests?limit=100');
      const data = res.data.data;
      return data?.requests || data?.data || (Array.isArray(data) ? data : []);
    },
    refetchInterval: 8000,
  });

  const { data: ambulances, isPending: ambulancesLoading } = useQuery({
    queryKey: ['admin-ambulances'],
    queryFn: async () => {
      const res = await api.get('/ambulances?limit=100');
      const data = res.data.data;
      return data?.ambulances || data?.data || (Array.isArray(data) ? data : []);
    },
    refetchInterval: 8000,
  });

  const assignMutation = useMutation({
    mutationFn: async ({ requestId, ambulanceId }: { requestId: string; ambulanceId: string }) => {
      const res = await api.patch('/requests/assign', { requestId, ambulanceId });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ambulance allocated to emergency request!");
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ambulances'] });
      queryClient.invalidateQueries({ queryKey: ['admin-requests-payments'] });
      setAssigningId(null);
    },
    onError: (error: any) => {
      const apiErr = error.response?.data;
      let msg = apiErr?.message || "Failed to assign ambulance";
      if (apiErr?.errors && apiErr.errors.length > 0) {
        msg += ` - ${apiErr.errors.map((e: any) => e.message || e.msg).join(', ')}`;
      }
      toast.error(msg);
      setAssigningId(null);
    }
  });

  if (requestsLoading || ambulancesLoading) {
    return <div className="p-8">Loading emergency requests...</div>;
  }

  let allRequests = Array.isArray(requests) ? [...requests] : [];
  const allAmbulances = Array.isArray(ambulances) ? ambulances : [];
  // Only ambulances that are AVAILABLE and have a driver assigned can be dispatched
  const dispatchableAmbulances = allAmbulances.filter(
    (a: any) => a.status === 'AVAILABLE' && Boolean(a.driverId || a.driver?.id)
  );

  if (statusFilter !== "ALL") {
    allRequests = allRequests.filter(req => req.status === statusFilter);
  }

  allRequests.sort((a, b) => {
    if (sortOrder === "CRITICALITY") {
      const rankDiff = (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
      if (rankDiff !== 0) return rankDiff;
    }
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return sortOrder === "OLDEST" ? timeA - timeB : timeB - timeA;
  });

  const getRecommendedType = (priority: string) => {
    if (priority === "CRITICAL" || priority === "HIGH") return "ICU";
    return "BASIC";
  };

  const getSortedAmbulancesForRequest = (priority: string) => {
    const recType = getRecommendedType(priority);
    return [...dispatchableAmbulances].sort((a, b) => {
      const aMatch = (a.type || a.vehicleType) === recType ? 1 : 0;
      const bMatch = (b.type || b.vehicleType) === recType ? 1 : 0;
      return bMatch - aMatch;
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Emergency Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Allocate available ambulances to patient emergency calls based on criticality.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "ALL")}>
            <SelectTrigger className="w-[165px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="EN_ROUTE">En Route</SelectItem>
              <SelectItem value="PICKED_UP">Picked Up</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v || "NEWEST")}>
            <SelectTrigger className="w-[175px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Newest First</SelectItem>
              <SelectItem value="OLDEST">Oldest First</SelectItem>
              <SelectItem value="CRITICALITY">Highest Criticality</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 mt-4">
        {allRequests.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-medium">No requests found</h3>
            <p className="text-sm text-muted-foreground">There are no emergency requests matching this filter.</p>
          </Card>
        ) : (
          allRequests.map((req: any) => {
            const recType = getRecommendedType(req.priority);
            const sortedAmbulances = getSortedAmbulancesForRequest(req.priority);
            const assignedAmb = req.ambulance || req.dispatch?.ambulance;
            const assignedDriver = req.driver || req.dispatch?.driver;
            const payment = req.payment || (Array.isArray(req.payments) ? req.payments[0] : null);
            const isPaid = payment?.status === "SUCCESS";
            const isBilled = payment && payment.amount > 0;

            return (
              <Card key={req.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gray-50/50 border-b">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">Dispatch #{req.id?.substring(0, 8).toUpperCase()}</CardTitle>
                      <Badge variant={
                        req.priority === "CRITICAL" || req.priority === "HIGH" ? "destructive" : "secondary"
                      }>
                        Criticality: {req.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Recommended Unit: {recType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {new Date(req.createdAt).toLocaleString()}
                      {req.patient?.email && (
                        <span>• Patient: {req.patient.email}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <Badge className="bg-emerald-600">Paid (${Number(payment.amount).toFixed(2)})</Badge>
                    ) : isBilled ? (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Billed: ${Number(payment.amount).toFixed(2)} (Pending)
                      </Badge>
                    ) : null}
                    <Badge variant={
                      req.status === "COMPLETED" ? "secondary" : 
                      req.status === "PENDING" ? "destructive" : "default"
                    }>
                      {req.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <span className="text-gray-600">Pickup:</span>
                      <span className="font-medium">{req.pickupAddress || req.pickupLocation}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="text-gray-600">Destination:</span>
                      <span className="font-medium">{req.destinationAddress || req.dropoffLocation}</span>
                    </div>
                    <div className="text-gray-600 pt-1">
                      Patient Phone: <span className="font-medium text-gray-900">{req.patientPhone}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end justify-end gap-2">
                    {req.status === "PENDING" ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <Select 
                          disabled={assignMutation.isPending || sortedAmbulances.length === 0}
                          onValueChange={(val: any) => {
                            if (!val) return;
                            setAssigningId(req.id);
                            assignMutation.mutate({ requestId: req.id, ambulanceId: String(val) });
                          }}
                        >
                          <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder={
                              sortedAmbulances.length === 0 
                                ? "No available ambulances with driver" 
                                : `Allocate Ambulance (Rec: ${recType})`
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {sortedAmbulances.map((amb: any) => {
                              const ambType = amb.type || amb.vehicleType || "BASIC";
                              const isRec = ambType === recType;
                              const driverEmail = amb.driver?.email || "Driver assigned";
                              return (
                                <SelectItem key={amb.id} value={amb.id}>
                                  {isRec ? "★ " : ""}{amb.vehicleNumber} [{ambType}] — {driverEmail}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {sortedAmbulances.length === 0 && (
                          <Link href="/admin/ambulances" className="text-xs text-primary underline">
                            Go to Ambulances to create/assign a driver →
                          </Link>
                        )}
                        {assigningId === req.id && (
                          <span className="text-xs text-muted-foreground">Allocating ambulance...</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-2">
                        {assignedAmb && (
                          <div className="text-xs bg-blue-50 text-blue-800 px-3 py-2 rounded-md border border-blue-100 space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold">
                              <Truck className="h-3.5 w-3.5" />
                              Ambulance: {assignedAmb.vehicleNumber} ({assignedAmb.type || "BASIC"})
                            </div>
                            {assignedDriver && (
                              <div className="flex items-center gap-1.5 text-blue-700">
                                <User className="h-3.5 w-3.5" />
                                Driver: {assignedDriver.email}
                              </div>
                            )}
                          </div>
                        )}
                        {req.status === "COMPLETED" && !isBilled && (
                          <Link href="/admin/payments">
                            <Button size="sm" variant="outline" className="gap-1.5">
                              <DollarSign className="h-4 w-4" />
                              Create Bill for Patient
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
