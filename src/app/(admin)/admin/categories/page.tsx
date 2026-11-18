"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { CategoryItem } from "@/types";

const categorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(80),
  ambulanceType: z.enum(["ICU", "BASIC", "PEDIATRIC"]),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  basePriceRange: z.string().min(3, "Price range is required"),
  responseSla: z.string().min(3, "Target response SLA is required"),
  imageUrl: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = useState<CategoryItem | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      ambulanceType: "BASIC",
      description: "",
      basePriceRange: "$80 - $150",
      responseSla: "7-10 mins",
      imageUrl: "/images/bls-ambulance-exterior.jpg",
    },
  });

  const selectedType = watch("ambulanceType");

  const { data: categories, isPending } = useQuery<CategoryItem[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data || [];
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      name: "",
      ambulanceType: "ICU",
      description: "",
      basePriceRange: "$180 – $300",
      responseSla: "5–8 mins",
      imageUrl: "/images/icu-ambulance-exterior.jpg",
    });
    setModalOpen(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setEditing(cat);
    reset({
      name: cat.name,
      ambulanceType: cat.ambulanceType,
      description: cat.description,
      basePriceRange: cat.basePriceRange,
      responseSla: cat.responseSla,
      imageUrl: cat.imageUrl || "/images/bls-ambulance-exterior.jpg",
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (vals: CategoryFormValues) => {
      if (editing) {
        const res = await api.patch(`/categories/${editing.id}`, vals);
        return res.data;
      }
      const res = await api.post("/categories", vals);
      return res.data;
    },
    onSuccess: () => {
      toast.success(editing ? "Category updated!" : "Category created!");
      setModalOpen(false);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to save category");
    },
  });

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

  const columns: ColumnDef<CategoryItem>[] = [
    {
      key: "name",
      header: "Category Name",
      sortable: true,
      sortValue: (c) => c.name,
      cell: (c) => (
        <div className="max-w-[260px]">
          <p className="font-semibold text-foreground">{c.name}</p>
          <p className="text-xs text-muted-foreground truncate">{c.description}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Clinical Tier",
      sortable: true,
      sortValue: (c) => c.ambulanceType,
      cell: (c) => (
        <Badge variant={c.ambulanceType === "ICU" ? "destructive" : "secondary"}>
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
      cell: (c) => <span className="text-xs font-medium">{c.basePriceRange}</span>,
    },
    {
      key: "sla",
      header: "Target SLA",
      cell: (c) => <span className="text-xs text-brand-emerald font-medium">{c.responseSla}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)} aria-label="Edit category">
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
  ];

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Fleet Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize clinical ambulance categories shown across the Home, Services, and Explore pages.
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
        rowKey={(c) => c.id}
        isLoading={isPending}
        searchPlaceholder="Search categories..."
        searchAccessor={(c) => `${c.name} ${c.ambulanceType} ${c.description}`}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Create Fleet Category"}</DialogTitle>
            <DialogDescription>Configure clinical tier, rate range, and response SLA.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4 pt-2" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input id="cat-name" {...register("name")} aria-invalid={Boolean(errors.name)} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cat-type">Tier</Label>
                <Select
                  value={selectedType}
                  onValueChange={(v) =>
                    setValue("ambulanceType", (v as "ICU" | "BASIC" | "PEDIATRIC") || "BASIC")
                  }
                >
                  <SelectTrigger id="cat-type" className="w-full h-10 rounded-xl">
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
                <Label htmlFor="cat-price">Price Range</Label>
                <Input id="cat-price" {...register("basePriceRange")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-sla">Response SLA</Label>
                <Input id="cat-sla" {...register("responseSla")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                rows={3}
                {...register("description")}
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-img">Cover Image Path / URL</Label>
              <Input id="cat-img" {...register("imageUrl")} />
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
                ) : editing ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription>
              Delete <strong>{deleting?.name}</strong>? Linked ambulances will stay in the fleet
              unassigned to a category.
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
