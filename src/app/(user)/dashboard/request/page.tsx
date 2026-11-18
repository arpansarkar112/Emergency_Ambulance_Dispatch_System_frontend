"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ambulance, Loader2, MapPin, Phone, ShieldCheck } from "lucide-react";

const createRequestSchema = z.object({
  patientPhone: z.string().min(5, "Valid patient contact phone is required"),
  pickupAddress: z.string().min(3, "Pickup address is required"),
  destinationAddress: z.string().min(3, "Destination hospital or address is required"),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
});

type CreateRequestFormValues = z.infer<typeof createRequestSchema>;

function RequestFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const rawPriority = searchParams.get("priority");
  const initialPriority: CreateRequestFormValues["priority"] =
    rawPriority === "CRITICAL" ||
    rawPriority === "HIGH" ||
    rawPriority === "MEDIUM" ||
    rawPriority === "LOW"
      ? rawPriority
      : "HIGH";

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
      priority: initialPriority,
    },
  });

  const priority = watch("priority");

  const requestMutation = useMutation({
    mutationFn: async (data: CreateRequestFormValues) => {
      const res = await api.post("/requests", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Emergency request submitted! A coordinator is allocating your ambulance.");
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["patient-stats"] });
      router.push("/dashboard/bookings");
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string; errors?: Array<{ message: string }> } };
      };
      const apiErr = err.response?.data;
      toast.error(apiErr?.errors?.[0]?.message || apiErr?.message || "Failed to request ambulance");
    },
  });

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Request Emergency Ambulance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Submit your location and clinical urgency. Zero upfront payment required.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <Card className="lg:col-span-7 rounded-xl border border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle>Emergency Dispatch Form</CardTitle>
            <CardDescription>
              High & Critical priorities automatically match to ventilator-equipped Mobile ICU units.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((vals) => requestMutation.mutate(vals))}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="req-phone">Patient / Caller Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="req-phone"
                    placeholder="+1 (555) 234-5678"
                    className="pl-9"
                    aria-invalid={Boolean(errors.patientPhone)}
                    {...register("patientPhone")}
                  />
                </div>
                {errors.patientPhone && (
                  <p className="text-xs text-destructive">{errors.patientPhone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="req-pickup">Pickup Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    id="req-pickup"
                    placeholder="742 Parkview Avenue, Apt 4B"
                    className="pl-9"
                    aria-invalid={Boolean(errors.pickupAddress)}
                    {...register("pickupAddress")}
                  />
                </div>
                {errors.pickupAddress && (
                  <p className="text-xs text-destructive">{errors.pickupAddress.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="req-dropoff">Destination Hospital</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-emerald" />
                  <Input
                    id="req-dropoff"
                    placeholder="Metro General Trauma Center"
                    className="pl-9"
                    aria-invalid={Boolean(errors.destinationAddress)}
                    {...register("destinationAddress")}
                  />
                </div>
                {errors.destinationAddress && (
                  <p className="text-xs text-destructive">{errors.destinationAddress.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="req-priority">Clinical Criticality Level</Label>
                <Select
                  value={priority}
                  onValueChange={(val) =>
                    setValue("priority", (val as CreateRequestFormValues["priority"]) || "HIGH", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="req-priority" className="w-full h-10 rounded-xl">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">
                      Critical — Life-Threatening (Mobile ICU Required)
                    </SelectItem>
                    <SelectItem value="HIGH">
                      High — Urgent Clinical Stabilization (Mobile ICU Required)
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      Medium — Urgent Medical Transport (Basic Life Support)
                    </SelectItem>
                    <SelectItem value="LOW">
                      Low — Scheduled / Routine Transfer (Basic Life Support)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2 gap-2"
                disabled={requestMutation.isPending}
              >
                {requestMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Dispatching Request...
                  </>
                ) : (
                  <>
                    <Ambulance className="h-5 w-5" />
                    Submit Emergency Dispatch Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 rounded-xl border border-border bg-muted/30 shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-emerald" />
              Dispatch Protocol Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              If this is an immediate life-threatening emergency and connectivity is unstable, also
              dial your local emergency hotline (911).
            </p>
            <p>
              Once submitted, our Admin Command Desk allocates an available criticality-matched
              ambulance and certified driver. Track live milestones directly in{" "}
              <strong className="text-foreground">My Bookings</strong>.
            </p>
            <p className="text-xs pt-2 border-t border-border/70">
              No credit card is requested during booking. Bills are generated only after hospital
              handover.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RequestAmbulancePage() {
  return (
    <Suspense fallback={<div className="p-8" />}>
      <RequestFormContent />
    </Suspense>
  );
}
