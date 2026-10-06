"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserProfilePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>First Name</Label>
              <Input defaultValue="Alex" />
            </div>
            <div className="grid gap-2">
              <Label>Last Name</Label>
              <Input defaultValue="Smith" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input defaultValue="alex@example.com" type="email" />
          </div>
          <div className="grid gap-2">
            <Label>Emergency Contact</Label>
            <Input defaultValue="+1 234 567 8900" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
