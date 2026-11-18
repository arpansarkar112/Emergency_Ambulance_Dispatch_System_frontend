"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Eye, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { AmbulanceItem, CategoryItem, UserRecord } from "@/types";

const ambulanceFormSchema = z.object({
  vehicleNumber: z.string().min(2, "License plate / unit ID is required"),
  title: z.string().min(3, "Unit title is required"),
  description: z.string().min(10, "Clinical description must be at least 10 characters"),
  type: z.enum(["ICU", "BASIC", "PEDIATRIC"]),
  status: z.enum(["AVAILABLE", "BUSY", "MAINTENANCE"]),
  basePrice: z.coerce.number().min(20, "Base price must be at least $20").max(10000),
  capacity: z.coerce.number().int().min(1).max(12),
  responseTime: z.string().min(2, "Response ETA is required"),
  currentAddress: z.string().min(3, "Station address is required"),
  categoryId: z.string().optional(),
  driverId: z.string().optional(),
  specificationsText: z.string().optional(),
  imagesText: z.string().optional(),
});

type AmbulanceFormValues = z.infer<typeof ambulanceFormSchema>;

export default function AdminAmbulancesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<AmbulanceItem | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<AmbulanceItem | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
      basePrice: 185,
      capacity: 3,
      responseTime: "6-8 mins",
      currentAddress: "",
      categoryId: "",
      driverId: "",
      specificationsText: "Transport Mechanical Ventilator, 12-Lead Cardiac Monitor, Dual Oxygen Manifolds",
      imagesText: "/images/icu-ambulance-exterior.jpg, /images/icu-ambulance-interior.jpg",
    },
  });

  const selectedType = watch("type");
  const selectedStatus = watch("status");
  const selectedCategoryId = watch("categoryId");
  const selectedDriverId = watch("driverId");

  const { data: drivers } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: async () => {
      const res = await api.get("/users?role=DRIVER&limit=100");
      return res.data.data?.users || [];
    },
  });

  const { data: categories } = useQuery<CategoryItem[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data || [];
    },
  });

  const { data: ambulances, isPending } = useQuery<AmbulanceItem[]>({
    queryKey: ["admin-ambulances"],
    queryFn: async () => {
      const res = await api.get("/ambulances?limit=100");
      return res.data.data?.ambulances || [];
    },
  });

  const openCreateModal = () => {
    setEditingUnit(null);
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
      imagesText: "/images/icu-ambulance-exterior.jpg, /images/icu-ambulance-interior.jpg",
    });
    setModalOpen(true);
  };

  const openEditModal = (unit: AmbulanceItem) => {
    setEditingUnit(unit);
    reset({
      vehicleNumber: unit.vehicleNumber,
      title: unit.title || `${unit.type} Unit ${unit.vehicleNumber}`,
      description: unit.description || "",
      type: unit.type,
      status: unit.status,
      basePrice: Number(unit.basePrice || 120),
      capacity: Number(unit.capacity || 2),
      responseTime: unit.responseTime || "6-9 mins",
      currentAddress: unit.currentAddress || "",
      categoryId: unit.categoryId || "",
      driverId: unit.driverId || unit.driver?.id || "",
      specificationsText: (unit.specifications || []).join(", "),
      imagesText: (unit.images || []).join(", "),
    });
    setModalOpen(true);
  };

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
        categoryId: values.categoryId && values.categoryId !== "NONE" ? values.categoryId : "",
        driverId: values.driverId && values.driverId !== "UNASSIGNED" ? values.driverId : "",
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
        editingUnit ? "Ambulance unit updated successfully!" : "Ambulance unit created successfully!"
      );
      setModalOpen(false);
      setEditingUnit(null);
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
      queryClient.invalidateQueries({ queryKey: ["public-fleet"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to save ambulance");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ambulances/${id}`);
    },
    onSuccess: () => {
      toast.success("Ambulance unit deleted from active fleet.");
      setDeletingUnit(null);
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
      queryClient.invalidateQueries({ queryKey: ["public-fleet"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete ambulance");
    },
  });

  let rows = Array.isArray(ambulances) ? [...ambulances] : [];
  if (typeFilter !== "ALL") rows = rows.filter((a) => a.type === typeFilter);
  if (statusFilter !== "ALL") rows = rows.filter((a) => a.status === statusFilter);

  const driverList = Array.isArray(drivers) ? drivers : [];
  const categoryList = Array.isArray(categories) ? categories : [];

  const columns: ColumnDef<AmbulanceItem>[] = [
    {
      key: "vehicleNumber",
      header: "Unit & Plate",
      sortable: true,
      sortValue: (u) => u.vehicleNumber,
      cell: (u) => (
        <div>
          <p className="font-semibold text-foreground">{u.title || u.vehicleNumber}</p>
          <p className="text-xs font-mono text-muted-foreground">{u.vehicleNumber}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tier / Category",
      sortable: true,
      sortValue: (u) => u.type,
      cell: (u) => (
        <div className="space-y-1">
          <Badge variant={u.type === "ICU" ? "destructive" : "secondary"}>{u.type}</Badge>
          {u.category && <p className="text-[11px] text-muted-foreground">{u.category.name}</p>}
        </div>
      ),
    },
    {
      key: "basePrice",
      header: "Base Rate",
      sortable: true,
      sortValue: (u) => Number(u.basePrice || 0),
      cell: (u) => (
        <span className="font-semibold text-foreground">${Number(u.basePrice || 120).toFixed(0)}</span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      sortValue: (u) => Number(u.rating || 0),
      cell: (u) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {Number(u.rating || 4.8).toFixed(1)} ({u.reviewCount || 0})
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (u) => u.status,
      cell: (u) => (
        <Badge
          className={
            u.status === "AVAILABLE"
              ? "bg-emerald-600 text-white border-transparent"
              : u.status === "BUSY"
                ? "bg-amber-600 text-white border-transparent"
                : "bg-slate-600 text-white border-transparent"
          }
        >
          {u.status}
        </Badge>
      ),
    },
    {
      key: "driver",
      header: "Assigned Driver",
      cell: (u) => (
        <span className="text-xs text-muted-foreground">
          {u.driver?.email || "Unassigned"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (u) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/explore/${u.id}`}>
            <Button variant="ghost" size="icon-sm" aria-label={`View ${u.vehicleNumber}`}>
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openEditModal(u)}
            aria-label={`Edit ${u.vehicleNumber}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeletingUnit(u)}
            aria-label={`Delete ${u.vehicleNumber}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Manage Fleet Items
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, inspect, and assign ambulance units across ICU, BLS, and Pediatric tiers.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Ambulance Unit
        </Button>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(u) => u.id}
        isLoading={isPending}
        searchPlaceholder="Search plate, title, station, or driver..."
        searchAccessor={(u) =>
          `${u.vehicleNumber} ${u.title || ""} ${u.currentAddress} ${u.driver?.email || ""}`
        }
        filterSlot={
          <>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v || "ALL")}>
              <SelectTrigger className="w-[140px] h-10 rounded-xl">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Tiers</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="BASIC">BASIC</SelectItem>
                <SelectItem value="PEDIATRIC">PEDIATRIC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "ALL")}>
              <SelectTrigger className="w-[150px] h-10 rounded-xl">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="BUSY">Busy</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* Create / Edit Ambulance Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? `Edit ${editingUnit.vehicleNumber}` : "Register New Ambulance Unit"}
            </DialogTitle>
            <DialogDescription>
              All fields validate client-side and server-side before saving to PostgreSQL.
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
                  <p className="text-xs text-destructive">{errors.vehicleNumber.message}</p>
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
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
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
                <p className="text-xs text-destructive">{errors.description.message}</p>
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
                    setValue("status", (v as "AVAILABLE" | "BUSY" | "MAINTENANCE") || "AVAILABLE")
                  }
                >
                  <SelectTrigger id="amb-status" className="w-full h-10 rounded-xl">
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
                  <p className="text-xs text-destructive">{errors.basePrice.message}</p>
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
                  <p className="text-xs text-destructive">{errors.currentAddress.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amb-sla">Response SLA</Label>
                <Input id="amb-sla" placeholder="5-8 mins" {...register("responseTime")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amb-capacity">Crew Capacity</Label>
                <Input id="amb-capacity" type="number" min={1} max={12} {...register("capacity")} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amb-category">Fleet Category</Label>
                <Select
                  value={selectedCategoryId || "NONE"}
                  onValueChange={(v) => setValue("categoryId", v === "NONE" ? "" : v || "")}
                >
                  <SelectTrigger id="amb-category" className="w-full h-10 rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-- No Category --</SelectItem>
                    {categoryList.map((c) => (
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
                  onValueChange={(v) => setValue("driverId", v === "UNASSIGNED" ? "" : v || "")}
                >
                  <SelectTrigger id="amb-driver" className="w-full h-10 rounded-xl">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">-- Unassigned --</SelectItem>
                    {driverList.map((d: UserRecord) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.profile?.firstName ? `${d.profile.firstName} (${d.email})` : d.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amb-specs">Onboard Equipment (comma-separated)</Label>
              <Input
                id="amb-specs"
                placeholder="Ventilator, 12-Lead ECG, Oxygen Supply"
                {...register("specificationsText")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amb-images">Gallery Image Paths / URLs (comma-separated)</Label>
              <Input
                id="amb-images"
                placeholder="/images/icu-ambulance-exterior.jpg, /images/icu-ambulance-interior.jpg"
                {...register("imagesText")}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
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

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deletingUnit)} onOpenChange={(o) => !o && setDeletingUnit(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Remove Ambulance Unit?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong className="text-foreground">{deletingUnit?.vehicleNumber}</strong> from the
              active dispatch catalog? Historical dispatches will remain intact.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeletingUnit(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deletingUnit && deleteMutation.mutate(deletingUnit.id)}
            >
              {deleteMutation.isPending ? "Removing..." : "Confirm Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
