"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DollarSign, Eye, MapPin, Phone, Trash2, Truck, User } from "lucide-react";
import type { AmbulanceItem, DispatchRequestItem } from "@/types";

const PRIORITY_RANK: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export default function AdminRequestsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [viewingReq, setViewingReq] = useState<DispatchRequestItem | null>(null);

  const { data: requests, isPending: requestsLoading } = useQuery<DispatchRequestItem[]>({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const res = await api.get("/requests?limit=100");
      return res.data.data?.requests || [];
    },
    refetchInterval: 8000,
  });

  const { data: ambulances, isPending: ambulancesLoading } = useQuery<AmbulanceItem[]>({
    queryKey: ["admin-ambulances"],
    queryFn: async () => {
      const res = await api.get("/ambulances?limit=100");
      return res.data.data?.ambulances || [];
    },
    refetchInterval: 8000,
  });

  const assignMutation = useMutation({
    mutationFn: async ({ requestId, ambulanceId }: { requestId: string; ambulanceId: string }) => {
      const res = await api.patch("/requests/assign", { requestId, ambulanceId });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ambulance allocated to emergency request!");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to allocate ambulance");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/requests/${id}`);
    },
    onSuccess: () => {
      toast.success("Emergency request cancelled and vehicle released.");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to cancel request");
    },
  });

  const allAmbulances = Array.isArray(ambulances) ? ambulances : [];
  const dispatchableAmbulances = allAmbulances.filter(
    (a) => a.status === "AVAILABLE" && Boolean(a.driverId || a.driver?.id)
  );

  const getRecommendedType = (priority: string) =>
    priority === "CRITICAL" || priority === "HIGH" ? "ICU" : "BASIC";

  const getMatchingAmbulances = (priority: string) => {
    const rec = getRecommendedType(priority);
    return dispatchableAmbulances.filter((a) => (a.type || "BASIC") === rec);
  };

  let rows = Array.isArray(requests) ? [...requests] : [];
  if (statusFilter !== "ALL") rows = rows.filter((r) => r.status === statusFilter);
  if (priorityFilter !== "ALL") rows = rows.filter((r) => r.priority === priorityFilter);

  const columns: ColumnDef<DispatchRequestItem>[] = [
    {
      key: "id",
      header: "Dispatch",
      sortable: true,
      sortValue: (r) => new Date(r.createdAt || 0).getTime(),
      cell: (r) => (
        <div>
          <p className="font-mono font-semibold text-xs text-foreground">
            #{r.id?.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {new Date(r.createdAt).toLocaleString()}
          </p>
        </div>
      ),
    },
    {
      key: "patient",
      header: "Patient & Route",
      cell: (r) => (
        <div className="max-w-[260px] space-y-0.5">
          <p className="text-xs font-medium text-foreground truncate">
            {r.patient?.email || "Patient"} ({r.patientPhone})
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {r.pickupAddress} → {r.destinationAddress}
          </p>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Criticality",
      sortable: true,
      sortValue: (r) => PRIORITY_RANK[r.priority] || 0,
      cell: (r) => (
        <div className="flex flex-col gap-1">
          <Badge
            variant={
              r.priority === "CRITICAL" || r.priority === "HIGH" ? "destructive" : "secondary"
            }
          >
            {r.priority}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            Needs {getRecommendedType(r.priority)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (r) => r.status,
      cell: (r) => (
        <Badge
          variant={
            r.status === "COMPLETED"
              ? "secondary"
              : r.status === "PENDING"
                ? "destructive"
                : "default"
          }
        >
          {r.status}
        </Badge>
      ),
    },
    {
      key: "allocation",
      header: "Unit Allocation",
      cell: (r) => {
        const recType = getRecommendedType(r.priority);
        const matching = getMatchingAmbulances(r.priority);
        const assignedAmb = r.ambulance || r.dispatch?.ambulance;

        if (r.status === "PENDING") {
          return (
            <Select
              disabled={assignMutation.isPending || matching.length === 0}
              onValueChange={(val) => {
                if (val) assignMutation.mutate({ requestId: r.id, ambulanceId: String(val) });
              }}
            >
              <SelectTrigger className="w-[215px] h-8 rounded-lg text-xs">
                <SelectValue
                  placeholder={
                    matching.length === 0 ? `No ready ${recType} unit` : `Allocate ${recType} Unit`
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {matching.map((amb: AmbulanceItem) => (
                  <SelectItem key={amb.id} value={amb.id}>
                    {amb.vehicleNumber} ({amb.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }

        return assignedAmb ? (
          <div className="text-xs">
            <p className="font-medium text-foreground">{assignedAmb.vehicleNumber}</p>
            <p className="text-[11px] text-muted-foreground">{assignedAmb.type}</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewingReq(r)}
            aria-label="View dispatch details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {r.status === "COMPLETED" && (
            <Link href="/admin/payments">
              <Button variant="outline" size="xs" className="gap-1">
                <DollarSign className="h-3 w-3" />
                Bill
              </Button>
            </Link>
          )}
          {r.status !== "COMPLETED" && r.status !== "CANCELLED" && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => cancelMutation.mutate(r.id)}
              disabled={cancelMutation.isPending}
              aria-label="Cancel request"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Emergency Requests Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Triage patient emergencies and strictly match Critical/High calls to Mobile ICU units.
          </p>
        </div>
        <Link href="/admin/ambulances">
          <Button variant="outline" size="sm">
            Manage Fleet Readiness
          </Button>
        </Link>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        isLoading={requestsLoading || ambulancesLoading}
        searchPlaceholder="Search patient, address, or dispatch ID..."
        searchAccessor={(r) =>
          `${r.id} ${r.patient?.email || ""} ${r.patientPhone || ""} ${r.pickupAddress || ""} ${r.destinationAddress || ""}`
        }
        filterSlot={
          <>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "ALL")}>
              <SelectTrigger className="w-[150px] h-10 rounded-xl">
                <SelectValue placeholder="Status" />
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
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v || "ALL")}>
              <SelectTrigger className="w-[150px] h-10 rounded-xl">
                <SelectValue placeholder="Criticality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* View Dispatch Details Modal */}
      <Dialog open={Boolean(viewingReq)} onOpenChange={(o) => !o && setViewingReq(null)}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>
              Dispatch #{viewingReq?.id?.slice(0, 8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Full emergency call telemetry and allocation record.
            </DialogDescription>
          </DialogHeader>
          {viewingReq && (
            <div className="space-y-4 text-sm pt-2">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    viewingReq.priority === "CRITICAL" || viewingReq.priority === "HIGH"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {viewingReq.priority}
                </Badge>
                <Badge variant="outline">{viewingReq.status}</Badge>
              </div>
              <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Pickup:</strong> {viewingReq.pickupAddress}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-brand-emerald mt-0.5 shrink-0" />
                  <span>
                    <strong>Destination:</strong> {viewingReq.destinationAddress}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    <strong>Phone:</strong> {viewingReq.patientPhone}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    <strong>Patient Email:</strong> {viewingReq.patient?.email || "N/A"}
                  </span>
                </p>
                {viewingReq.ambulance && (
                  <p className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-brand-navy shrink-0" />
                    <span>
                      <strong>Assigned Unit:</strong> {viewingReq.ambulance.vehicleNumber} (
                      {viewingReq.ambulance.type})
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
