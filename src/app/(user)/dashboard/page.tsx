"use client";

import React, { Suspense, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { StatCard } from "@/components/shared/StatCard";
import { recordProfilerCommit } from "@/lib/perf-telemetry";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Activity,
  Ambulance,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  DollarSign,
  PlusCircle,
} from "lucide-react";
import type { DispatchRequestItem } from "@/types";

// Code-split each individual Recharts module via React.lazy() + Suspense
const TrendLineChart = React.lazy(
  () => import("@/components/shared/charts/TrendLineChart")
);
const CategoryBarChart = React.lazy(
  () => import("@/components/shared/charts/CategoryBarChart")
);
const BreakdownPieChart = React.lazy(
  () => import("@/components/shared/charts/BreakdownPieChart")
);

const PATIENT_TREND_LINES = [
  {
    dataKey: "requests",
    name: "Bookings",
    color: "var(--chart-1)",
    yAxisId: "left" as const,
  },
  {
    dataKey: "amount",
    name: "Billed ($)",
    color: "var(--chart-2)",
    yAxisId: "right" as const,
  },
];

const PATIENT_STATUS_BARS = [
  { dataKey: "value", name: "Missions", color: "var(--chart-3)" },
];

export default function PatientOverviewPage() {
  const { data: stats, isPending: statsLoading } = useQuery({
    queryKey: ["patient-stats"],
    queryFn: async () => {
      const res = await api.get("/requests/my-stats");
      return res.data.data;
    },
    refetchInterval: 12_000,
  });

  const { data: requests, isPending: reqLoading } = useQuery({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const res = await api.get("/requests/my-requests");
      return res.data.data || [];
    },
    refetchInterval: 8000,
  });

  const payMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const originUrl =
        typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await api.post("/payments/initiate", {
        requestId,
        originUrl,
      });
      return res.data.data || res.data;
    },
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
      else toast.success("Payment session created");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    },
  });

  const recentList = useMemo(
    () => (Array.isArray(requests) ? requests.slice(0, 4) : []),
    [requests]
  );

  // Dimension-matched loading skeleton to avoid CLS
  if (statsLoading || reqLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-40 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[118px] rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[366px] rounded-xl" />
          <Skeleton className="h-[366px] rounded-xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-[366px] rounded-xl lg:col-span-5" />
          <Skeleton className="h-[366px] rounded-xl lg:col-span-7" />
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {};

  return (
    <React.Profiler id="PatientOverviewPage" onRender={recordProfilerCommit}>
      <div className="flex-1 space-y-6 p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Patient Dashboard Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor live ambulance dispatches, past missions, and post-trip
              Stripe billing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/request">
              <Button className="gap-1.5">
                <PlusCircle className="h-4 w-4" />
                Request Ambulance
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline">Browse Fleet</Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Dispatches"
            value={summary.totalRequests ?? 0}
            subtitle="All submitted ambulance calls"
            icon={Ambulance}
            accent="primary"
          />
          <StatCard
            title="Active Missions"
            value={summary.activeRequests ?? 0}
            subtitle="Currently pending or in transit"
            icon={Activity}
            accent="amber"
          />
          <StatCard
            title="Completed Trips"
            value={summary.completedRequests ?? 0}
            subtitle="Safely delivered to hospital"
            icon={CheckCircle2}
            accent="emerald"
          />
          <StatCard
            title="Total Paid"
            value={`$${Number(summary.totalPaid || 0).toFixed(2)}`}
            subtitle={`$${Number(summary.pendingAmount || 0).toFixed(2)} awaiting payment`}
            icon={DollarSign}
            accent="navy"
          />
        </div>

        {/* 3 Dynamic Charts (Code-Split via React.lazy + Suspense) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense
            fallback={<Skeleton className="h-[366px] w-full rounded-xl" />}
          >
            <TrendLineChart
              title="Monthly Dispatch Activity"
              description="Your emergency bookings and billing volume over the last 6 months"
              data={stats?.monthlyTrend || []}
              lines={PATIENT_TREND_LINES}
            />
          </Suspense>

          <Suspense
            fallback={<Skeleton className="h-[366px] w-full rounded-xl" />}
          >
            <CategoryBarChart
              title="Dispatches by Status"
              description="Live breakdown of your emergency missions across dispatch milestones"
              data={stats?.statusBreakdown || []}
              xKey="name"
              bars={PATIENT_STATUS_BARS}
            />
          </Suspense>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Suspense
              fallback={<Skeleton className="h-[366px] w-full rounded-xl" />}
            >
              <BreakdownPieChart
                title="Requests by Criticality"
                description="Urgency tiers selected across your bookings"
                data={stats?.criticalityBreakdown || []}
              />
            </Suspense>
          </div>

          <Card className="lg:col-span-7 min-h-[366px] rounded-xl border border-border/80 bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Recent Bookings
                </CardTitle>
                <CardDescription>
                  Live ambulance status and billing actions
                </CardDescription>
              </div>
              <Link href="/dashboard/bookings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-primary"
                >
                  All Bookings
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentList.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    No ambulance bookings yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submit an emergency request anytime — zero upfront payment
                    required.
                  </p>
                  <Link href="/dashboard/request">
                    <Button size="sm" className="mt-2">
                      Request Emergency Ambulance
                    </Button>
                  </Link>
                </div>
              ) : (
                recentList.map((req: DispatchRequestItem) => {
                  const amount = Number(req.payment?.amount || req.amount || 0);
                  const isPaid =
                    req.payment?.status === "SUCCESS" ||
                    req.paymentStatus === "SUCCESS";
                  const isBilled = !isPaid && amount > 0;
                  return (
                    <div
                      key={req.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/25 p-3.5 text-sm"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold">
                            #{req.id?.slice(0, 8).toUpperCase()}
                          </span>
                          <Badge
                            variant={
                              req.priority === "CRITICAL" ||
                              req.priority === "HIGH"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {req.priority}
                          </Badge>
                          <Badge variant="outline">{req.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {req.pickupAddress} → {req.destinationAddress}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isPaid ? (
                          <Badge className="bg-emerald-600 text-white border-transparent">
                            Paid ${amount.toFixed(2)}
                          </Badge>
                        ) : isBilled && req.status === "COMPLETED" ? (
                          <Button
                            size="xs"
                            disabled={payMutation.isPending}
                            onClick={() => payMutation.mutate(req.id)}
                            className="gap-1"
                          >
                            <CreditCard className="h-3 w-3" />
                            Pay ${amount.toFixed(2)}
                          </Button>
                        ) : (
                          <Link href="/dashboard/bookings">
                            <Button size="xs" variant="outline">
                              Details
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </React.Profiler>
  );
}
