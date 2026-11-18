"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { AmbulanceItem, CategoryItem, UserRecord } from "@/types";

const ambulanceFormSchema = z.object({
  vehicleNumber: z.string().min(2, "License plate / unit ID is required"),
  title: z.string().min(3, "Unit title is required"),
  description: z
    .string()
    .min(10, "Clinical description must be at least 10 characters"),
  type: z.enum(["ICU", "BASIC", "PEDIATRIC"]),
  status: z.enum(["AVAILABLE", "BUSY", "MAINTENANCE"]),
  basePrice: z.coerce
    .number()
    .min(20, "Base price must be at least $20")
    .max(10000),
  capacity: z.coerce.number().int().min(1).max(12),
  responseTime: z.string().min(2, "Response ETA is required"),
  currentAddress: z.string().min(3, "Station address is required"),
  categoryId: z.string().optional(),
  driverId: z.string().optional(),
  specificationsText: z.string().optional(),
  imagesText: z.string().optional(),
});

type AmbulanceFormValues = z.infer<typeof ambulanceFormSchema>;

export interface AmbulanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUnit: AmbulanceItem | null;
  categories: CategoryItem[];
  drivers: UserRecord[];
}

export default function AmbulanceFormDialog({
  open,
  onOpenChange,
  editingUnit,
  categories,
  drivers,
}: AmbulanceFormDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AmbulanceFormValues>({
    resolver: zodResolver(ambulanceFormSchema),
    defaultValues: {
      vehicleNumber: "",
      title: "",
      description: "",
      type: "ICU",
      status: "AVAILABLE",
      basePrice: 210,
      capacity: 3,
      responseTime: "5-8 mins",
      currentAddress: "",
      categoryId: "",
      driverId: "",
      specificationsText:
        "Transport Mechanical Ventilator, 12-Lead Cardiac Defibrillator, 4-Channel Infusion Pump, Dual Oxygen Manifolds",
      imagesText:
        "/images/icu-ambulance-exterior.jpg, /images/icu-ambulance-interior.jpg",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editingUnit) {
      reset({
        vehicleNumber: editingUnit.vehicleNumber,
        title:
          editingUnit.title ||
          `${editingUnit.type} Unit ${editingUnit.vehicleNumber}`,
        description: editingUnit.description || "",
        type: editingUnit.type,
        status: editingUnit.status,
        basePrice: Number(editingUnit.basePrice || 120),
        capacity: Number(editingUnit.capacity || 2),
        responseTime: editingUnit.responseTime || "6-9 mins",
        currentAddress: editingUnit.currentAddress || "",
        categoryId: editingUnit.categoryId || "",
        driverId: editingUnit.driverId || editingUnit.driver?.id || "",
        specificationsText: (editingUnit.specifications || []).join(", "),
        imagesText: (editingUnit.images || []).join(", "),
      });
    } else {
      reset({
        vehicleNumber: "",
        title: "",
        description: "",
        type: "ICU",
        status: "AVAILABLE",
        basePrice: 210,
        capacity: 3,
        responseTime: "5-8 mins",
        currentAddress: "",
        categoryId: "",
        driverId: "",
        specificationsText:
          "Transport Mechanical Ventilator, 12-Lead Cardiac Defibrillator, 4-Channel Infusion Pump, Dual Oxygen Manifolds",
        imagesText:
          "/images/icu-ambulance-exterior.jpg, /images/icu-ambulance-interior.jpg",
      });
    }
  }, [open, editingUnit, reset]);

  const selectedType = watch("type");
  const selectedStatus = watch("status");
  const selectedCategoryId = watch("categoryId");
  const selectedDriverId = watch("driverId");

  const saveMutation = useMutation({
    mutationFn: async (values: AmbulanceFormValues) => {
      const specifications = (values.specificationsText || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const images = (values.imagesText || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        vehicleNumber: values.vehicleNumber.trim(),
        title: values.title.trim(),
        description: values.description.trim(),
        type: values.type,
        status: values.status,
        basePrice: Number(values.basePrice),
        capacity: Number(values.capacity),
        responseTime: values.responseTime.trim(),
        currentAddress: values.currentAddress.trim(),
        categoryId:
          values.categoryId && values.categoryId !== "NONE"
            ? values.categoryId
            : "",
        driverId:
          values.driverId && values.driverId !== "UNASSIGNED"
            ? values.driverId
            : "",
        specifications,
        images,
      };

      if (editingUnit) {
        const res = await api.patch(`/ambulances/${editingUnit.id}`, payload);
        return res.data;
      }
      const res = await api.post("/ambulances", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        editingUnit
          ? "Ambulance unit updated successfully!"
          : "Ambulance unit created successfully!"
      );
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
      queryClient.invalidateQueries({ queryKey: ["public-fleet"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to save ambulance");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {editingUnit
              ? `Edit ${editingUnit.vehicleNumber}`
              : "Register New Ambulance Unit"}
          </DialogTitle>
          <DialogDescription>
            All fields validate client-side and server-side before saving to
            PostgreSQL.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((vals) => saveMutation.mutate(vals))}
          className="space-y-4 pt-2"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amb-plate">License Plate / Unit ID</Label>
              <Input
                id="amb-plate"
                placeholder="MED-ICU-120"
                aria-invalid={Boolean(errors.vehicleNumber)}
                {...register("vehicleNumber")}
              />
              {errors.vehicleNumber && (
                <p className="text-xs text-destructive">
                  {errors.vehicleNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amb-title">Unit Display Title</Label>
              <Input
                id="amb-title"
                placeholder="Apex Mobile ICU Unit 120"
                aria-invalid={Boolean(errors.title)}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amb-desc">Clinical Overview & Capabilities</Label>
            <Textarea
              id="amb-desc"
              rows={3}
              placeholder="Describe onboard ventilation, cardiac telemetry, and paramedic staffing..."
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amb-type">Clinical Tier</Label>
              <Select
                value={selectedType}
                onValueChange={(v) =>
                  setValue("type", (v as "ICU" | "BASIC" | "PEDIATRIC") || "ICU")
                }
              >
                <SelectTrigger id="amb-type" className="w-full h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="BASIC">BASIC</SelectItem>
                  <SelectItem value="PEDIATRIC">PEDIATRIC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amb-status">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(v) =>
                  setValue(
                    "status",
                    (v as "AVAILABLE" | "BUSY" | "MAINTENANCE") || "AVAILABLE"
                  )
                }
              >
                <SelectTrigger
                  id="amb-status"
                  className="w-full h-10 rounded-xl"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                  <SelectItem value="BUSY">BUSY</SelectItem>
                  <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amb-price">Base Price ($ USD)</Label>
              <Input
                id="amb-price"
                type="number"
                step="1"
                aria-invalid={Boolean(errors.basePrice)}
                {...register("basePrice")}
              />
              {errors.basePrice && (
                <p className="text-xs text-destructive">
                  {errors.basePrice.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amb-address">Station Address</Label>
              <Input
                id="amb-address"
                placeholder="Midtown Trauma Hub"
                aria-invalid={Boolean(errors.currentAddress)}
                {...register("currentAddress")}
              />
              {errors.currentAddress && (
                <p className="text-xs text-destructive">
                  {errors.currentAddress.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amb-sla">Response SLA</Label>
              <Input
                id="amb-sla"
                placeholder="5-8 mins"
                {...register("responseTime")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amb-capacity">Crew Capacity</Label>
              <Input
                id="amb-capacity"
                type="number"
                min={1}
                max={12}
                {...register("capacity")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amb-category">Fleet Category</Label>
              <Select
                value={selectedCategoryId || "NONE"}
                onValueChange={(v) =>
                  setValue("categoryId", v === "NONE" ? "" : v || "")
                }
              >
                <SelectTrigger
                  id="amb-category"
                  className="w-full h-10 rounded-xl"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">-- No Category --</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amb-driver">Assigned Driver</Label>
              <Select
                value={selectedDriverId || "UNASSIGNED"}
                onValueChange={(v) =>
                  setValue("driverId", v === "UNASSIGNED" ? "" : v || "")
                }
              >
                <SelectTrigger
                  id="amb-driver"
                  className="w-full h-10 rounded-xl"
                >
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNASSIGNED">-- Unassigned --</SelectItem>
                  {drivers.map((d: UserRecord) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.profile?.firstName
                        ? `${d.profile.firstName} (${d.email})`
                        : d.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amb-specs">
              Onboard Equipment (comma-separated)
            </Label>
            <Input
              id="amb-specs"
              placeholder="Ventilator, 12-Lead ECG, Oxygen Supply"
              {...register("specificationsText")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amb-images">
              Gallery Image Paths / URLs (comma-separated)
            </Label>
            <Input
              id="amb-images"
              placeholder="/images/icu-ambulance-exterior.jpg, /images/icu-ambulance-interior.jpg"
              {...register("imagesText")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingUnit ? (
                "Save Changes"
              ) : (
                "Create Ambulance Unit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
