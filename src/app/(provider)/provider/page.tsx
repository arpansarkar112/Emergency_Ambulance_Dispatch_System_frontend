"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import {
  Activity,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import type { DispatchRequestItem } from "@/types";

export default function ProviderTasksPage() {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const { data: requests, isLoading: loadingRequests, refetch: refetchRequests } = useQuery<
    DispatchRequestItem[]
  >({
    queryKey: ["provider-requests", userId],
    queryFn: async () => {
      const res = await api.get("/requests/my-requests");
      return res.data.data || [];
    },
    enabled: Boolean(userId),
    refetchInterval: 8000,
  });

  const { data: stats } = useQuery({
    queryKey: ["provider-stats", userId],
    queryFn: async () => {
      const res = await api.get("/requests/my-stats");
      return res.data.data;
    },
    enabled: Boolean(userId),
    refetchInterval: 12_000,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const res = await api.patch("/requests/status", { requestId, status });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      toast.success(`Emergency status updated to ${variables.status}!`);
      refetchRequests();
      queryClient.invalidateQueries({ queryKey: ["ambulances"] });
      queryClient.invalidateQueries({ queryKey: ["provider-stats"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update task status");
    },
  });

  if (sessionStatus === "loading" || loadingRequests) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-8">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-44 rounded-xl" />
      </div>
    );
  }

  const allRequests = Array.isArray(requests) ? [...requests] : [];
  const activeRequests = allRequests.filter(
    (req) => !["COMPLETED", "CANCELLED"].includes(req.status)
  );
  const completedRequests = allRequests.filter((req) =>
    ["COMPLETED", "CANCELLED"].includes(req.status)
  );

  const summary = stats?.summary || {};

  const renderRequestCard = (req: DispatchRequestItem) => {
    const p = req.payment || (Array.isArray(req.payments) ? req.payments[0] : null);
    const amount = Number(p?.amount || 0);
    const isPaid = p?.status === "SUCCESS";
    const amb = req.ambulance || req.dispatch?.ambulance;

    return (
      <Card key={req.id} className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-muted/30 border-b border-border/70 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-mono">
                Dispatch #{req.id?.slice(0, 8).toUpperCase()}
              </CardTitle>
              <Badge
                variant={
                  req.priority === "CRITICAL" || req.priority === "HIGH"
                    ? "destructive"
                    : "secondary"
                }
              >
                {req.priority || "MEDIUM"}
              </Badge>
              {amb && (
                <Badge variant="outline" className="gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  {amb.vehicleNumber} ({amb.type})
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Status: <span className="text-primary font-semibold">{req.status}</span>
            </div>
          </div>

          <div>
            {isPaid ? (
              <Badge className="bg-emerald-600 text-white border-transparent">
                Paid: ${amount.toFixed(2)}
              </Badge>
            ) : amount > 0 ? (
              <Badge variant="secondary">Billed: ${amount.toFixed(2)}</Badge>
            ) : req.status === "COMPLETED" ? (
              <Badge variant="outline">Awaiting Admin Bill</Badge>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Pickup Location</p>
                  <p className="text-muted-foreground">{req.pickupAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-brand-emerald mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Destination Hospital</p>
                  <p className="text-muted-foreground">{req.destinationAddress}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3 border-t md:border-t-0 md:border-l border-border/70 pt-4 md:pt-0 md:pl-6">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Update Live Mission Status
                </span>
                <Select
                  value={req.status}
                  onValueChange={(val) =>
                    val && updateRequestMutation.mutate({ requestId: req.id, status: val })
                  }
                  disabled={
                    req.status === "COMPLETED" ||
                    req.status === "CANCELLED" ||
                    updateRequestMutation.isPending
                  }
                >
                  <SelectTrigger className="w-full h-10 rounded-xl">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSIGNED">ASSIGNED — Ready to Depart</SelectItem>
                    <SelectItem value="EN_ROUTE">EN_ROUTE — En Route to Patient</SelectItem>
                    <SelectItem value="PICKED_UP">PICKED_UP — Patient Onboard</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED — Delivered to Hospital</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED — Emergency Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <a href={`tel:${req.patientPhone || req.patient?.profile?.phone}`} className="w-full">
                <Button className="w-full justify-start gap-2" variant="outline" type="button">
                  <Phone className="h-4 w-4 text-primary" />
                  Call {req.patient?.profile?.firstName || "Patient"} ({req.patientPhone || "N/A"})
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Driver Dispatch Console
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Respond to assigned missions and report real-time milestones to patients and command.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Active Assignments"
          value={summary.activeRequests ?? activeRequests.length}
          subtitle="Missions currently in progress"
          icon={Activity}
          accent="primary"
        />
        <StatCard
          title="Completed Missions"
          value={summary.completedRequests ?? completedRequests.length}
          subtitle="Lifetime hospital handovers"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          title="Paid Earnings"
          value={`$${Number(summary.totalPaid || 0).toFixed(2)}`}
          subtitle={`$${Number(summary.pendingAmount || 0).toFixed(2)} awaiting settlement`}
          icon={DollarSign}
          accent="navy"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Active Dispatches ({activeRequests.length})
        </h2>
        {activeRequests.length === 0 ? (
          <Card className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="font-medium text-foreground">No active missions assigned</p>
            <p className="text-xs text-muted-foreground mt-1">
              Keep your vehicle marked AVAILABLE in Assigned Vehicles to receive new calls.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">{activeRequests.map(renderRequestCard)}</div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Completed & Past Dispatches ({completedRequests.length})
        </h2>
        {completedRequests.length === 0 ? (
          <Card className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="font-medium text-foreground">No completed dispatches yet</p>
          </Card>
        ) : (
          <div className="grid gap-4">{completedRequests.map(renderRequestCard)}</div>
        )}
      </div>
    </div>
  );
}
