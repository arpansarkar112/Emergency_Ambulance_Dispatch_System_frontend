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
import type { CategoryItem } from "@/types";

const categorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(80),
  ambulanceType: z.enum(["ICU", "BASIC", "PEDIATRIC"]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500),
  basePriceRange: z.string().min(3, "Price range is required"),
  responseSla: z.string().min(3, "Target response SLA is required"),
  imageUrl: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: CategoryItem | null;
}

export default function CategoryFormDialog({
  open,
  onOpenChange,
  editing,
}: CategoryFormDialogProps) {
  const queryClient = useQueryClient();

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
      ambulanceType: "ICU",
      description: "",
      basePriceRange: "$180 – $300",
      responseSla: "5–8 mins",
      imageUrl: "/images/icu-ambulance-exterior.jpg",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        name: editing.name,
        ambulanceType: editing.ambulanceType,
        description: editing.description,
        basePriceRange: editing.basePriceRange,
        responseSla: editing.responseSla,
        imageUrl: editing.imageUrl || "/images/bls-ambulance-exterior.jpg",
      });
    } else {
      reset({
        name: "",
        ambulanceType: "ICU",
        description: "",
        basePriceRange: "$180 – $300",
        responseSla: "5–8 mins",
        imageUrl: "/images/icu-ambulance-exterior.jpg",
      });
    }
  }, [open, editing, reset]);

  const selectedType = watch("ambulanceType");

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
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to save category");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Category" : "Create Fleet Category"}
          </DialogTitle>
          <DialogDescription>
            Configure clinical tier, rate range, and response SLA.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((v) => saveMutation.mutate(v))}
          className="space-y-4 pt-2"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Category Name</Label>
            <Input
              id="cat-name"
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cat-type">Tier</Label>
              <Select
                value={selectedType}
                onValueChange={(v) =>
                  setValue(
                    "ambulanceType",
                    (v as "ICU" | "BASIC" | "PEDIATRIC") || "BASIC"
                  )
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
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-img">Cover Image Path / URL</Label>
            <Input id="cat-img" {...register("imageUrl")} />
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
  );
}
