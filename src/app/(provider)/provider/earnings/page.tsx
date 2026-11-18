"use client";

import React, { Suspense, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { Clock, DollarSign, TrendingUp } from "lucide-react";
import type { DispatchRequestItem } from "@/types";

// Code-split ONLY TrendLineChart so BarChart and PieChart are excluded from /provider/earnings bundle
const TrendLineChart = React.lazy(
  () => import("@/components/shared/charts/TrendLineChart")
);

const EARNINGS_TREND_LINES = [
  { dataKey: "requests", name: "Dispatches", color: "var(--chart-1)" },
  { dataKey: "amount", name: "Trip Volume ($)", color: "var(--chart-3)" },
];

const getAmount = (r: DispatchRequestItem) =>
  Number(r.payment?.amount || r.amount || 0);
const isPaid = (r: DispatchRequestItem) =>
  r.payment?.status === "SUCCESS" || r.paymentStatus === "SUCCESS";

export default function ProviderEarningsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const { data: requests, isLoading } = useQuery<DispatchRequestItem[]>({
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
  });

  const { completedTrips, totalEarnings, pendingEarnings } = useMemo(() => {
    const completed = (Array.isArray(requests) ? requests : []).filter(
      (r) => r.status === "COMPLETED"
    );
    const paidSum = completed
      .filter(isPaid)
      .reduce((sum: number, r) => sum + getAmount(r), 0);
    const pendingSum = completed
      .filter((r) => !isPaid(r) && getAmount(r) > 0)
      .reduce((sum: number, r) => sum + getAmount(r), 0);
    return {
      completedTrips: completed,
      totalEarnings: paidSum,
      pendingEarnings: pendingSum,
    };
  }, [requests]);

  const rowKey = useCallback((r: DispatchRequestItem) => r.id, []);
  const searchAccessor = useCallback(
    (r: DispatchRequestItem) =>
      `${r.id} ${r.pickupAddress || ""} ${r.destinationAddress || ""}`,
    []
  );

  const columns = useMemo<ColumnDef<DispatchRequestItem>[]>(
    () => [
      {
        key: "id",
        header: "Dispatch",
        sortable: true,
        sortValue: (r) =>
          new Date(r.updatedAt || r.createdAt || 0).getTime(),
        cell: (r) => (
          <div>
            <p className="font-mono text-xs font-semibold">
              #{r.id?.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {new Date(r.updatedAt || r.createdAt).toLocaleDateString()}
            </p>
          </div>
        ),
      },
      {
        key: "route",
        header: "Route",
        cell: (r) => (
          <span className="text-xs text-muted-foreground block max-w-[260px] truncate">
            {r.pickupAddress} → {r.destinationAddress}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Trip Bill",
        sortable: true,
        sortValue: (r) => getAmount(r),
        cell: (r) => {
          const amt = getAmount(r);
          return amt > 0 ? (
            <span className="font-semibold text-brand-emerald">
              ${amt.toFixed(2)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Unbilled</span>
          );
        },
      },
      {
        key: "status",
        header: "Settlement",
        cell: (r) => {
          if (isPaid(r))
            return (
              <Badge className="bg-emerald-600 text-white border-transparent">
                Paid
              </Badge>
            );
          if (getAmount(r) > 0)
            return <Badge variant="secondary">Pending Patient Payment</Badge>;
          return <Badge variant="outline">Awaiting Admin Bill</Badge>;
        },
      },
    ],
    []
  );

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Earnings & Trip Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track settled Stripe trip payouts, pending patient invoices, and
          monthly volume.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Paid Earnings"
          value={`$${totalEarnings.toFixed(2)}`}
          subtitle="Verified Stripe settlements"
          icon={DollarSign}
          accent="emerald"
        />
        <StatCard
          title="Pending Patient Payments"
          value={`$${pendingEarnings.toFixed(2)}`}
          subtitle="Billed trips awaiting patient checkout"
          icon={Clock}
          accent="navy"
        />
        <StatCard
          title="Completed Trips"
          value={completedTrips.length}
          subtitle="Lifetime completed dispatches"
          icon={TrendingUp}
          accent="primary"
        />
      </div>

      <Suspense fallback={<Skeleton className="h-[366px] w-full rounded-xl" />}>
        <TrendLineChart
          title="Monthly Completed Missions & Billing ($)"
          description="Dynamic 6-month trend based on your assigned emergency missions"
          data={stats?.monthlyTrend || []}
          lines={EARNINGS_TREND_LINES}
        />
      </Suspense>

      <DataTable
        data={completedTrips}
        columns={columns}
        rowKey={rowKey}
        isLoading={isLoading}
        searchPlaceholder="Search completed trips (debounced)..."
        searchAccessor={searchAccessor}
        profilerId="ProviderEarningsDataTable"
      />
    </div>
  );
}
