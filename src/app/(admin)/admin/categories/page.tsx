"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { CategoryItem } from "@/types";

// Lazy-load CategoryFormDialog with colocated Zod + React Hook Form state
const CategoryFormDialog = React.lazy(
  () => import("@/components/dashboard/modals/CategoryFormDialog")
);

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = useState<CategoryItem | null>(null);

  const { data: categories, isPending } = useQuery<CategoryItem[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data || [];
    },
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((cat: CategoryItem) => {
    setEditing(cat);
    setModalOpen(true);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      toast.success("Category deleted.");
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete category");
    },
  });

  const rowKey = useCallback((c: CategoryItem) => c.id, []);
  const searchAccessor = useCallback(
    (c: CategoryItem) => `${c.name} ${c.ambulanceType} ${c.description}`,
    []
  );

  const columns = useMemo<ColumnDef<CategoryItem>[]>(
    () => [
      {
        key: "name",
        header: "Category Name",
        sortable: true,
        sortValue: (c) => c.name,
        cell: (c) => (
          <div className="max-w-[260px]">
            <p className="font-semibold text-foreground">{c.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {c.description}
            </p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Clinical Tier",
        sortable: true,
        sortValue: (c) => c.ambulanceType,
        cell: (c) => (
          <Badge
            variant={c.ambulanceType === "ICU" ? "destructive" : "secondary"}
          >
            {c.ambulanceType}
          </Badge>
        ),
      },
      {
        key: "units",
        header: "Units",
        sortable: true,
        sortValue: (c) => c.unitCount ?? 0,
        cell: (c) => (
          <span className="text-sm font-medium">
            {c.unitCount ?? 0} ({c.availableCount ?? 0} ready)
          </span>
        ),
      },
      {
        key: "price",
        header: "Rate Range",
        cell: (c) => (
          <span className="text-xs font-medium">{c.basePriceRange}</span>
        ),
      },
      {
        key: "sla",
        header: "Target SLA",
        cell: (c) => (
          <span className="text-xs text-brand-emerald font-medium">
            {c.responseSla}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cell: (c) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => openEdit(c)}
              aria-label="Edit category"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleting(c)}
              aria-label="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [openEdit]
  );

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Fleet Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize clinical ambulance categories shown across the Home,
            Services, and Explore pages.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      </div>

      <DataTable
        data={categories || []}
        columns={columns}
        rowKey={rowKey}
        isLoading={isPending}
        searchPlaceholder="Search categories (debounced)..."
        searchAccessor={searchAccessor}
        profilerId="AdminCategoriesDataTable"
      />

      {modalOpen && (
        <Suspense fallback={null}>
          <CategoryFormDialog
            open={modalOpen}
            onOpenChange={setModalOpen}
            editing={editing}
          />
        </Suspense>
      )}

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription>
              Delete <strong>{deleting?.name}</strong>? Linked ambulances will
              stay in the fleet unassigned to a category.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
