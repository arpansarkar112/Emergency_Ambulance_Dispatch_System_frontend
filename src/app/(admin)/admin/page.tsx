"use client";

import React, { Suspense, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { StatCard } from "@/components/shared/StatCard";
import { VirtualizedDispatchFeed } from "@/components/shared/VirtualizedDispatchFeed";
import { DatasetVolumeToggle } from "@/components/shared/DatasetVolumeToggle";
import { mergeWithRepresentativeRequests } from "@/lib/synthetic-data";
import { useHighVolumeMode } from "@/lib/store";
import { recordProfilerCommit } from "@/lib/perf-telemetry";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Ambulance,
  ArrowRight,
  DollarSign,
  Mail,
  Users,
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

const TREND_LINES = [
  {
    dataKey: "requests",
    name: "Total Requests",
    color: "var(--chart-1)",
    yAxisId: "left" as const,
  },
  {
    dataKey: "completed",
    name: "Completed Trips",
    color: "var(--chart-3)",
    yAxisId: "left" as const,
  },
  {
    dataKey: "revenue",
    name: "Revenue ($)",
    color: "var(--chart-2)",
    yAxisId: "right" as const,
  },
];

const CATEGORY_BARS = [
  { dataKey: "available", name: "Available", color: "var(--chart-3)" },
  { dataKey: "busy", name: "On Dispatch", color: "var(--chart-1)" },
  { dataKey: "dispatches", name: "Total Dispatches", color: "var(--chart-2)" },
];

export default function AdminOverviewPage() {
  const highVolumeMode = useHighVolumeMode();

  const { data: analytics, isPending: analyticsPending } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics");
      return res.data.data;
    },
    refetchInterval: 15_000,
  });

  const { data: recentRequests, isPending: requestsPending } = useQuery<
    DispatchRequestItem[]
  >({
    queryKey: ["admin-requests-recent"],
    queryFn: async () => {
      const res = await api.get("/requests?limit=50");
      return res.data.data?.requests || [];
    },
    refetchInterval: 10_000,
  });

  const feedItems = useMemo(() => {
    const base = Array.isArray(recentRequests) ? recentRequests : [];
    return mergeWithRepresentativeRequests(base, highVolumeMode, 1200);
  }, [recentRequests, highVolumeMode]);

  const summary = analytics?.summary || {};
  const monthlyTrend = useMemo(
    () => analytics?.monthlyTrend || [],
    [analytics?.monthlyTrend]
  );
  const fleetByCategory = useMemo(
    () => analytics?.fleetByCategory || [],
    [analytics?.fleetByCategory]
  );
  const criticalityBreakdown = useMemo(
    () => analytics?.criticalityBreakdown || [],
    [analytics?.criticalityBreakdown]
  );

  // Dimension-matched loading skeleton to eliminate Cumulative Layout Shift (CLS = 0)
  if (analyticsPending) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-40 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
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

  return (
    <React.Profiler id="AdminOverviewPage" onRender={recordProfilerCommit}>
      <div className="flex-1 space-y-6 p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Admin Dispatch Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time operational analytics across fleet availability,
              emergency demand, and billing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DatasetVolumeToggle totalCount={feedItems.length} />
            <Link href="/admin/requests">
              <Button size="sm" className="gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Dispatch Queue ({summary.pendingRequests ?? 0})
              </Button>
            </Link>
            <Link href="/admin/ambulances">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Ambulance className="h-4 w-4" />
                Manage Fleet
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Overview Cards (Memoized StatCard) */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Fleet Units"
            value={summary.totalAmbulances ?? 0}
            subtitle={`${summary.availableAmbulances ?? 0} ready for immediate dispatch`}
            icon={Ambulance}
            accent="primary"
          />
          <StatCard
            title="Registered Users"
            value={summary.totalUsers ?? 0}
            subtitle={`${summary.categoriesCount ?? 0} active fleet categories`}
            icon={Users}
            accent="navy"
          />
          <StatCard
            title="Emergency Dispatches"
            value={summary.totalRequests ?? 0}
            subtitle={`${summary.pendingRequests ?? 0} pending • ${summary.completedRequests ?? 0} completed`}
            icon={AlertTriangle}
            accent="amber"
          />
          <StatCard
            title="Collected Revenue"
            value={`$${Number(summary.totalRevenue || 0).toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`}
            subtitle={`$${Number(summary.pendingBilling || 0).toFixed(2)} pending bills • ${summary.contactMessages ?? 0} inquiries`}
            icon={DollarSign}
            accent="emerald"
          />
        </div>

        {/* Charts Row 1: Line Chart + Bar Chart (Code-Split via React.lazy + Suspense) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense
            fallback={<Skeleton className="h-[366px] w-full rounded-xl" />}
          >
            <TrendLineChart
              title="Monthly Dispatch & Revenue Trend"
              description="Live 6-month trajectory of emergency calls, completions, and Stripe revenue ($)"
              data={monthlyTrend}
              lines={TREND_LINES}
            />
          </Suspense>

          <Suspense
            fallback={<Skeleton className="h-[366px] w-full rounded-xl" />}
          >
            <CategoryBarChart
              title="Fleet Readiness & Dispatches by Category"
              description="Real-time vehicle availability vs. total dispatches across clinical tiers"
              data={fleetByCategory}
              xKey="type"
              bars={CATEGORY_BARS}
            />
          </Suspense>
        </div>

        {/* Row 2: Pie Chart + Virtualized Emergency Dispatch Stream */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Suspense
              fallback={<Skeleton className="h-[366px] w-full rounded-xl" />}
            >
              <BreakdownPieChart
                title="Calls by Clinical Criticality"
                description="Distribution of emergency requests by triage urgency level"
                data={criticalityBreakdown}
              />
            </Suspense>
          </div>

          <Card className="lg:col-span-7 min-h-[366px] rounded-xl border border-border/80 bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Recent & Historical Emergency Requests Stream
                </CardTitle>
                <CardDescription>
                  Virtualized live dispatch feed ({feedItems.length.toLocaleString()}{" "}
                  records with debounced filtering)
                </CardDescription>
              </div>
              <Link href="/admin/requests">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-primary"
                >
                  View All
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {requestsPending ? (
                <Skeleton className="h-[240px] w-full rounded-xl" />
              ) : (
                <VirtualizedDispatchFeed
                  items={feedItems}
                  height={210}
                  estimateItemHeight={74}
                  overscan={5}
                  actionHref="/admin/requests"
                  profilerId="AdminOverviewDispatchFeed"
                />
              )}

              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  {summary.contactMessages ?? 0} Contact Messages •{" "}
                  {summary.newsletterSubscribers ?? 0} Newsletter Subscribers
                </span>
                <Link
                  href="/admin/reports"
                  className="text-primary font-medium hover:underline"
                >
                  Open Reports →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </React.Profiler>
  );
}
