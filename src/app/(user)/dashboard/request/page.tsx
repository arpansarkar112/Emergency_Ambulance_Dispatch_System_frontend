"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Ambulance, MapPin, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createRequestSchema = z.object({
  patientPhone: z.string().min(5, "Patient phone number is required"),
  pickupAddress: z.string().min(3, "Pickup address is required"),
  destinationAddress: z.string().min(3, "Destination hospital or address is required"),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
});

type CreateRequestFormValues = z.infer<typeof createRequestSchema>;

export default function RequestAmbulancePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      patientPhone: "",
      pickupAddress: "",
      destinationAddress: "",
      priority: "HIGH",
    },
  });

  const priority = watch("priority");

  const requestMutation = useMutation({
    mutationFn: async (data: CreateRequestFormValues) => {
      const res = await api.post('/requests', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Emergency request submitted! An admin will allocate an ambulance shortly.");
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const apiError = error.response?.data;
      let errorMessage = apiError?.message || "Failed to request ambulance";
      if (apiError?.errors && apiError.errors.length > 0) {
        errorMessage = apiError.errors[0].message;
      }
      toast.error(errorMessage);
    }
  });

  const onSubmit = (values: CreateRequestFormValues) => {
    requestMutation.mutate(values);
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="phone">Patient Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    placeholder="e.g. +1 234 567 890" 
                    className="pl-9"
                    {...register("patientPhone")}
                  />
                </div>
                {errors.patientPhone && (
                  <p className="text-xs text-destructive">{errors.patientPhone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="pickup" 
                    placeholder="Enter pickup address or coordinates" 
                    className="pl-9"
                    {...register("pickupAddress")}
                  />
                </div>
                {errors.pickupAddress && (
                  <p className="text-xs text-destructive">{errors.pickupAddress.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dropoff">Destination (Hospital)</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="dropoff" 
                    placeholder="Enter hospital name or address" 
                    className="pl-9"
                    {...register("destinationAddress")}
                  />
                </div>
                {errors.destinationAddress && (
                  <p className="text-xs text-destructive">{errors.destinationAddress.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Criticality / Urgency Level</Label>
                <Select
                  value={priority}
                  onValueChange={(val) => setValue("priority", (val as CreateRequestFormValues["priority"]) || "HIGH", { shouldValidate: true })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">Critical (Life-threatening — ICU Unit)</SelectItem>
                    <SelectItem value="HIGH">High (Urgent care needed — ICU Unit)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (Non-life threatening — Basic Unit)</SelectItem>
                    <SelectItem value="LOW">Low (Routine transport — Basic Unit)</SelectItem>
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
                {requestMutation.isPending ? "Dispatching..." : "Request Emergency Ambulance"}
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
              Once you submit your request, an administrator will allocate an ambulance based on your criticality level, and your assigned driver will update your trip status in real time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
