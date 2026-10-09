"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Ambulance, MapPin, Phone } from "lucide-react";

export default function RequestAmbulancePage() {
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [urgency, setUrgency] = useState("HIGH");

  const requestMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/requests', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ambulance requested successfully! A provider will be assigned shortly.");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to request ambulance");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestMutation.mutate({
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      urgency
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Request Ambulance</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Dispatch</CardTitle>
            <CardDescription>
              Fill out the details below to dispatch the nearest available ambulance immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="pickup" 
                    placeholder="Enter pickup address or coordinates" 
                    className="pl-9"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dropoff">Destination (Hospital)</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="dropoff" 
                    placeholder="Enter hospital name or address" 
                    className="pl-9"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger id="urgency">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">Critical (Life-threatening)</SelectItem>
                    <SelectItem value="HIGH">High (Urgent care needed)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (Non-life threatening)</SelectItem>
                    <SelectItem value="LOW">Low (Routine transport)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6" 
                size="lg"
                disabled={requestMutation.isPending}
              >
                <Ambulance className="mr-2 h-5 w-5" />
                {requestMutation.isPending ? "Dispatching..." : "Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              If this is a life-threatening emergency and the platform is unresponsive, please immediately dial your local emergency number (e.g., 911).
            </p>
            <p>
              By clicking "Request", our system will automatically ping all available units within a 5-mile radius of your pickup location.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
