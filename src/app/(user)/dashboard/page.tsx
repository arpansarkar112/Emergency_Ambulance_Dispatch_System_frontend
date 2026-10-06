"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export default function UserDashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
      <div className="grid gap-4 mt-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Ambulance Request #{800 + i}</CardTitle>
              <Badge variant={i === 1 ? "secondary" : "default"}>
                {i === 1 ? "Completed" : "Active"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> Requested on Oct 6, 2026, 10:0{i} AM
              </div>
              <p className="mt-2 text-sm">Destination: City General Hospital</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
