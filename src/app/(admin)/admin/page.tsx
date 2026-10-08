"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ambulance, Users, CheckCircle, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

// Mock data for chart until backend provides timeseries data
const chartData = [
  { name: 'Mon', dispatches: 12 },
  { name: 'Tue', dispatches: 19 },
  { name: 'Wed', dispatches: 15 },
  { name: 'Thu', dispatches: 22 },
  { name: 'Fri', dispatches: 30 },
  { name: 'Sat', dispatches: 25 },
  { name: 'Sun', dispatches: 18 },
];

export default function AdminOverview() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard-stats');
      return res.data.data;
    }
  });

  if (isLoading) {
    return <div className="p-8">Loading dashboard statistics...</div>;
  }

  // Fallback defaults in case API returns empty or structured differently
  const stats = statsData || { totalRequests: 0, activeProviders: 0, completedRequests: 0, activeRequests: 0 };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Ambulance className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProviders || 0}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Runs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Pending or in-progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Dispatch Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="dispatches" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Emergency Call #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">Provider: Unit {i} dispatched.</p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    Just now
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
