"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const TrendLineChart = dynamic(
  () => import("@/components/shared/DashboardCharts").then((m) => m.TrendLineChart),
  { ssr: false, loading: () => <Skeleton className="h-[340px] w-full rounded-xl" /> }
);
const CategoryBarChart = dynamic(
  () => import("@/components/shared/DashboardCharts").then((m) => m.CategoryBarChart),
  { ssr: false, loading: () => <Skeleton className="h-[340px] w-full rounded-xl" /> }
);
const BreakdownPieChart = dynamic(
  () => import("@/components/shared/DashboardCharts").then((m) => m.BreakdownPieChart),
  { ssr: false, loading: () => <Skeleton className="h-[340px] w-full rounded-xl" /> }
);

export default function AdminOverviewPage() {
  const { data: analytics, isPending } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics");
      return res.data.data;
    },
    refetchInterval: 15_000,
  });

  const { data: recentRequests } = useQuery({
    queryKey: ["admin-requests-recent"],
    queryFn: async () => {
      const res = await api.get("/requests?limit=5");
      return res.data.data?.requests || [];
    },
    refetchInterval: 10_000,
  });

  if (isPending) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-8">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const monthlyTrend = analytics?.monthlyTrend || [];
  const fleetByCategory = analytics?.fleetByCategory || [];
  const criticalityBreakdown = analytics?.criticalityBreakdown || [];
  const latestCalls = Array.isArray(recentRequests) ? recentRequests : [];

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Admin Dispatch Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time operational analytics across fleet availability, emergency demand, and billing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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

      {/* Dynamic Overview Cards */}
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
          value={`$${Number(summary.totalRevenue || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={`$${Number(summary.pendingBilling || 0).toFixed(2)} pending bills • ${summary.contactMessages ?? 0} inquiries`}
          icon={DollarSign}
          accent="emerald"
        />
      </div>

      {/* Charts Row 1: Line Chart + Bar Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TrendLineChart
          title="Monthly Dispatch & Revenue Trend"
          description="Live 6-month trajectory of emergency calls, completions, and Stripe revenue ($)"
          data={monthlyTrend}
          lines={[
            { dataKey: "requests", name: "Total Requests", color: "var(--chart-1)", yAxisId: "left" },
            { dataKey: "completed", name: "Completed Trips", color: "var(--chart-3)", yAxisId: "left" },
            { dataKey: "revenue", name: "Revenue ($)", color: "var(--chart-2)", yAxisId: "right" },
          ]}
        />

        <CategoryBarChart
          title="Fleet Readiness & Dispatches by Category"
          description="Real-time vehicle availability vs. total dispatches across clinical tiers"
          data={fleetByCategory}
          xKey="type"
          bars={[
            { dataKey: "available", name: "Available", color: "var(--chart-3)" },
            { dataKey: "busy", name: "On Dispatch", color: "var(--chart-1)" },
            { dataKey: "dispatches", name: "Total Dispatches", color: "var(--chart-2)" },
          ]}
        />
      </div>

      {/* Row 2: Pie Chart + Recent Requests */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <BreakdownPieChart
            title="Calls by Clinical Criticality"
            description="Distribution of emergency requests by triage urgency level"
            data={criticalityBreakdown}
          />
        </div>

        <Card className="lg:col-span-7 rounded-xl border border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Emergency Requests</CardTitle>
              <CardDescription>Latest incoming patient calls awaiting or in active dispatch</CardDescription>
            </div>
            <Link href="/admin/requests">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestCalls.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No emergency requests logged yet.
              </p>
            ) : (
              latestCalls.map((req: DispatchRequestItem) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/25 p-3.5 text-sm"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground font-mono text-xs">
                        #{req.id?.slice(0, 8).toUpperCase()}
                      </span>
                      <Badge
                        variant={
                          req.priority === "CRITICAL" || req.priority === "HIGH"
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
                  <Link href="/admin/requests" className="shrink-0">
                    <Button variant="outline" size="xs">
                      {req.status === "PENDING" ? "Allocate Unit" : "Inspect"}
                    </Button>
                  </Link>
                </div>
              ))
            )}

            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                {summary.contactMessages ?? 0} Contact Messages • {summary.newsletterSubscribers ?? 0}{" "}
                Newsletter Subscribers
              </span>
              <Link href="/admin/reports" className="text-primary font-medium hover:underline">
                Open Reports →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
