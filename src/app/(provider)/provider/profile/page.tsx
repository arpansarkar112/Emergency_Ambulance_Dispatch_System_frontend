"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProviderProfilePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Ambulance Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Driver Name</Label>
            <Input defaultValue="John Doe" />
          </div>
          <div className="grid gap-2">
            <Label>License Plate</Label>
            <Input defaultValue="XY-1234" />
          </div>
          <div className="grid gap-2">
            <Label>Vehicle Type</Label>
            <Input defaultValue="Advanced Life Support (ALS)" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
