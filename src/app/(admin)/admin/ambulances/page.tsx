"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createAmbulanceSchema = z.object({
  vehicleNumber: z.string().min(2, "Vehicle number is required"),
  type: z.enum(["ICU", "BASIC", "PEDIATRIC"]),
  currentAddress: z.string().min(2, "Station or address is required"),
  driverId: z.string().optional(),
});

type CreateAmbulanceFormValues = z.infer<typeof createAmbulanceSchema>;

export default function AdminAmbulancesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateAmbulanceFormValues>({
    resolver: zodResolver(createAmbulanceSchema),
    defaultValues: {
      vehicleNumber: "",
      type: "ICU",
      currentAddress: "",
      driverId: "",
    },
  });

  const selectedType = watch("type");
  const selectedDriverId = watch("driverId");

  const { data: drivers } = useQuery({
    queryKey: ['admin-drivers'],
    queryFn: async () => {
      const res = await api.get('/users?role=DRIVER&limit=100');
      const allUsers = res.data.data?.users || res.data.data || [];
      return (Array.isArray(allUsers) ? allUsers : []).filter((u: any) => u.role === 'DRIVER');
    }
  });

  const { data: ambulances, isPending } = useQuery({
    queryKey: ['admin-ambulances'],
    queryFn: async () => {
      const res = await api.get('/ambulances?limit=100');
      const data = res.data.data;
      return data?.ambulances || data?.data || (Array.isArray(data) ? data : []);
    }
  });

  const formatDriverLabel = (driver: any) => {
    if (!driver) return "Unassigned";
    const fullName = [driver.profile?.firstName, driver.profile?.lastName].filter(Boolean).join(" ");
    return fullName ? `${fullName} (${driver.email})` : driver.email;
  };

  const createMutation = useMutation({
    mutationFn: async (data: CreateAmbulanceFormValues) => {
      const payload: any = {
        vehicleNumber: data.vehicleNumber.trim(),
        type: data.type || "BASIC",
        currentAddress: data.currentAddress.trim() || "Central Station",
      };
      if (data.driverId && data.driverId !== "UNASSIGNED") {
        payload.driverId = data.driverId;
      }
      const res = await api.post('/ambulances', payload);
      return res.data.data || res.data;
    },
    onSuccess: () => {
      toast.success("Ambulance created successfully");
      setOpen(false);
      reset({ vehicleNumber: "", type: "ICU", currentAddress: "", driverId: "" });
      queryClient.invalidateQueries({ queryKey: ['admin-ambulances'] });
    },
    onError: (error: any) => {
      const apiErr = error.response?.data;
      let msg = apiErr?.message || "Failed to create ambulance";
      if (apiErr?.errors && apiErr.errors.length > 0) {
        msg += `: ${apiErr.errors.map((e: any) => e.message || e.msg).join(", ")}`;
      }
      toast.error(msg);
    }
  });

  const updateAmbulanceMutation = useMutation({
    mutationFn: async (payload: { ambulanceId: string; driverId?: string | null; status?: string; type?: string }) => {
      const res = await api.patch('/ambulances', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ambulance updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-ambulances'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update ambulance");
    }
  });

  if (isPending) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="rounded-md border bg-card mt-4 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const allAmbulances = Array.isArray(ambulances) ? ambulances : [];
  const driverList = Array.isArray(drivers) ? drivers : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ambulances Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create ambulances, set vehicle criticality types (ICU, BASIC, PEDIATRIC), and assign them to individual drivers.
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={buttonVariants()}>
            + Add Ambulance
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Ambulance</DialogTitle>
            </DialogHeader>
            <form 
              onSubmit={handleSubmit((values) => createMutation.mutate(values))} 
              className="space-y-4 mt-4"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number (License Plate)</Label>
                <Input 
                  id="vehicleNumber" 
                  {...register("vehicleNumber")}
                  placeholder="e.g. DHA-11-2233"
                />
                {errors.vehicleNumber && (
                  <p className="text-xs text-destructive">{errors.vehicleNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Vehicle Type (Criticality Tier)</Label>
                <Select 
                  value={selectedType} 
                  onValueChange={(val) => setValue("type", (val as CreateAmbulanceFormValues["type"]) || "ICU", { shouldValidate: true })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select Vehicle Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ICU">ICU (Critical & High Priority)</SelectItem>
                    <SelectItem value="BASIC">BASIC (Low & Medium Priority)</SelectItem>
                    <SelectItem value="PEDIATRIC">PEDIATRIC (Specialized Care)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAddress">Current Address / Station</Label>
                <Input 
                  id="currentAddress" 
                  {...register("currentAddress")}
                  placeholder="e.g. Central Medical Station"
                />
                {errors.currentAddress && (
                  <p className="text-xs text-destructive">{errors.currentAddress.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverId">Assign Driver</Label>
                <Select 
                  value={selectedDriverId || "UNASSIGNED"} 
                  onValueChange={(val) => setValue("driverId", val === "UNASSIGNED" ? "" : (val || ""), { shouldValidate: true })}
                >
                  <SelectTrigger id="driverId">
                    <SelectValue placeholder="Select a Driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">-- Unassigned --</SelectItem>
                    {driverList.map((driver: any) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {formatDriverLabel(driver)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Ambulance"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Station / Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Driver Assigned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allAmbulances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No ambulances found. Click &quot;+ Add Ambulance&quot; to register one.
                </TableCell>
              </TableRow>
            ) : (
              allAmbulances.map((amb: any) => (
                <TableRow key={amb.id}>
                  <TableCell className="font-medium">{amb.vehicleNumber}</TableCell>
                  <TableCell>
                    <Select
                      value={amb.type || amb.vehicleType || "BASIC"}
                      onValueChange={(val) => {
                        if (val) updateAmbulanceMutation.mutate({ ambulanceId: amb.id, type: val });
                      }}
                      disabled={updateAmbulanceMutation.isPending}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ICU">ICU</SelectItem>
                        <SelectItem value="BASIC">BASIC</SelectItem>
                        <SelectItem value="PEDIATRIC">PEDIATRIC</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {amb.currentAddress || "Central Station"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={amb.status || "AVAILABLE"}
                      onValueChange={(val) => {
                        if (val) updateAmbulanceMutation.mutate({ ambulanceId: amb.id, status: val });
                      }}
                      disabled={updateAmbulanceMutation.isPending}
                    >
                      <SelectTrigger className="w-[145px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                        <SelectItem value="BUSY">BUSY</SelectItem>
                        <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={amb.driverId || amb.driver?.id || "UNASSIGNED"}
                      onValueChange={(val) => {
                        updateAmbulanceMutation.mutate({
                          ambulanceId: amb.id,
                          driverId: val === "UNASSIGNED" ? "" : (val || "")
                        });
                      }}
                      disabled={updateAmbulanceMutation.isPending}
                    >
                      <SelectTrigger className="w-[240px] h-8 text-xs">
                        <SelectValue placeholder="Assign a Driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNASSIGNED">-- Unassigned --</SelectItem>
                        {driverList.map((driver: any) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {formatDriverLabel(driver)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
