"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone } from "lucide-react";

export default function ProviderTasksPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Active Tasks</h2>
        <Badge variant="default" className="text-sm px-3 py-1">Online & Available</Badge>
      </div>

      <div className="grid gap-4 mt-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Emergency Dispatch #{500 + i}</CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> 456 Patient Rd, Suburb
                </div>
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button className="flex-1" variant="default">
                  Accept Dispatch
                </Button>
                <Button className="flex-1 gap-2" variant="outline">
                  <Phone className="h-4 w-4" /> Contact Caller
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
