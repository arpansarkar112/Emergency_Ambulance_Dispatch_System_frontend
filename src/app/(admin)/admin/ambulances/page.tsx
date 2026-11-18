"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DatasetVolumeToggle } from "@/components/shared/DatasetVolumeToggle";
import { mergeWithRepresentativeAmbulances } from "@/lib/synthetic-data";
import { useHighVolumeMode } from "@/lib/store";
import { Button } from "@/components/ui/button";
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
import { Eye, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { AmbulanceItem, CategoryItem, UserRecord } from "@/types";

// Lazy-load heavy Zod + React Hook Form modal only when user opens Create/Edit Dialog
const AmbulanceFormDialog = React.lazy(
  () => import("@/components/dashboard/modals/AmbulanceFormDialog")
);

export default function AdminAmbulancesPage() {
  const queryClient = useQueryClient();
  const highVolumeMode = useHighVolumeMode();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<AmbulanceItem | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<AmbulanceItem | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: drivers } = useQuery<UserRecord[]>({
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

  const openCreateModal = useCallback(() => {
    setEditingUnit(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((unit: AmbulanceItem) => {
    setEditingUnit(unit);
    setModalOpen(true);
  }, []);

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

  const combinedAmbulances = useMemo(() => {
    const live = Array.isArray(ambulances) ? ambulances : [];
    return mergeWithRepresentativeAmbulances(live, highVolumeMode, 1200);
  }, [ambulances, highVolumeMode]);

  const rows = useMemo(() => {
    return combinedAmbulances.filter((a) => {
      if (typeFilter !== "ALL" && a.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
      return true;
    });
  }, [combinedAmbulances, typeFilter, statusFilter]);

  const driverList = useMemo(
    () => (Array.isArray(drivers) ? drivers : []),
    [drivers]
  );
  const categoryList = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  );

  const rowKey = useCallback((u: AmbulanceItem) => u.id, []);
  const searchAccessor = useCallback(
    (u: AmbulanceItem) =>
      `${u.vehicleNumber} ${u.title || ""} ${u.currentAddress} ${u.driver?.email || ""}`,
    []
  );

  const columns = useMemo<ColumnDef<AmbulanceItem>[]>(
    () => [
      {
        key: "vehicleNumber",
        header: "Unit & Plate",
        sortable: true,
        sortValue: (u) => u.vehicleNumber,
        cell: (u) => (
          <div>
            <p className="font-semibold text-foreground">
              {u.title || u.vehicleNumber}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {u.vehicleNumber}
            </p>
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
            <Badge variant={u.type === "ICU" ? "destructive" : "secondary"}>
              {u.type}
            </Badge>
            {u.category && (
              <p className="text-[11px] text-muted-foreground">
                {u.category.name}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "basePrice",
        header: "Base Rate",
        sortable: true,
        sortValue: (u) => Number(u.basePrice || 0),
        cell: (u) => (
          <span className="font-semibold text-foreground">
            ${Number(u.basePrice || 120).toFixed(0)}
          </span>
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
        cell: (u) => {
          const isSynthetic = u.id.startsWith("sim-");
          return (
            <div className="flex items-center justify-end gap-1">
              <Link href={isSynthetic ? "/explore" : `/explore/${u.id}`}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`View ${u.vehicleNumber}`}
                >
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
              {!isSynthetic && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeletingUnit(u)}
                  aria-label={`Delete ${u.vehicleNumber}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [openEditModal]
  );

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Manage Fleet Items
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, inspect, and assign ambulance units across ICU, BLS,
            and Pediatric tiers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DatasetVolumeToggle totalCount={combinedAmbulances.length} />
          <Button onClick={openCreateModal} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Ambulance Unit
          </Button>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={rowKey}
        isLoading={isPending}
        searchPlaceholder="Search plate, title, station, or driver (debounced)..."
        searchAccessor={searchAccessor}
        profilerId="AdminAmbulancesDataTable"
        filterSlot={
          <>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v || "ALL")}
            >
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
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v || "ALL")}
            >
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

      {/* Lazy-Loaded Create / Edit Ambulance Modal (State Colocated inside Modal) */}
      {modalOpen && (
        <Suspense fallback={null}>
          <AmbulanceFormDialog
            open={modalOpen}
            onOpenChange={setModalOpen}
            editingUnit={editingUnit}
            categories={categoryList}
            drivers={driverList}
          />
        </Suspense>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deletingUnit)}
        onOpenChange={(o) => !o && setDeletingUnit(null)}
      >
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Remove Ambulance Unit?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong className="text-foreground">
                {deletingUnit?.vehicleNumber}
              </strong>{" "}
              from the active dispatch catalog? Historical dispatches will
              remain intact.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeletingUnit(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deletingUnit && deleteMutation.mutate(deletingUnit.id)
              }
            >
              {deleteMutation.isPending ? "Removing..." : "Confirm Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
