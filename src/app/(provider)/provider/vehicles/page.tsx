"use client";

import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Truck } from "lucide-react";
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
import type { AmbulanceItem } from "@/types";

export default function ProviderVehiclesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const { data: ambulances, isLoading: loadingAmbulances, refetch } = useQuery<AmbulanceItem[]>({
    queryKey: ["ambulances"],
    queryFn: async () => {
      const res = await api.get("/ambulances?limit=100");
      return res.data.data?.ambulances || [];
    },
    enabled: Boolean(userId),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ ambulanceId, status }: { ambulanceId: string; status: string }) => {
      const res = await api.patch("/ambulances", { ambulanceId, status });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ambulance readiness status updated!");
      refetch();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update ambulance");
    },
  });

  if (sessionStatus === "loading" || loadingAmbulances) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-8">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    );
  }

  const assigned = (Array.isArray(ambulances) ? ambulances : []).filter(
    (amb) => amb.driver?.id === userId || amb.driverId === userId
  );

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Assigned Vehicles
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle readiness status for ambulances assigned to your driver account.
        </p>
      </div>

      {assigned.length === 0 ? (
        <Card className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="font-medium text-foreground">No ambulances assigned yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Contact an Administrator to link your account to an active ICU or BLS vehicle.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assigned.map((amb) => {
            const isOnline = amb.status === "AVAILABLE";
            return (
              <Card key={amb.id} className="rounded-xl border border-border/80 bg-card shadow-xs">
                <CardContent className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-base text-foreground">
                          {amb.title || amb.vehicleNumber}
                        </h2>
                        <Badge variant="outline" className="font-mono text-xs">
                          {amb.vehicleNumber}
                        </Badge>
                        <Badge variant={amb.type === "ICU" ? "destructive" : "secondary"}>
                          {amb.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-brand-emerald" />
                        {amb.currentAddress}
                      </p>
                    </div>
                  </div>

                  <div className="w-full lg:w-auto flex flex-wrap items-center gap-3">
                    <Badge
                      className={
                        isOnline
                          ? "bg-emerald-600 text-white border-transparent"
                          : "bg-amber-600 text-white border-transparent"
                      }
                    >
                      {amb.status}
                    </Badge>
                    <Select
                      value={amb.status}
                      onValueChange={(val) =>
                        val && updateMutation.mutate({ ambulanceId: amb.id, status: val })
                      }
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger className="w-44 h-10 rounded-xl">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available (Online)</SelectItem>
                        <SelectItem value="BUSY">Busy (Offline)</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Link href={`/explore/${amb.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Specs <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
