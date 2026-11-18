"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { DispatchRequestItem } from "@/types";

const editRequestSchema = z.object({
  patientPhone: z.string().min(5, "Phone number is required"),
  pickupAddress: z.string().min(3, "Pickup address is required"),
  destinationAddress: z.string().min(3, "Destination address is required"),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
});

type EditRequestValues = z.infer<typeof editRequestSchema>;

export interface EditBookingDialogProps {
  editing: DispatchRequestItem | null;
  onClose: () => void;
}

export default function EditBookingDialog({
  editing,
  onClose,
}: EditBookingDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditRequestValues>({
    resolver: zodResolver(editRequestSchema),
    defaultValues: {
      patientPhone: "",
      pickupAddress: "",
      destinationAddress: "",
      priority: "HIGH",
    },
  });

  useEffect(() => {
    if (editing) {
      reset({
        patientPhone: editing.patientPhone || "",
        pickupAddress: editing.pickupAddress || "",
        destinationAddress: editing.destinationAddress || "",
        priority: editing.priority || "MEDIUM",
      });
    }
  }, [editing, reset]);

  const editPriority = watch("priority");

  const editMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: EditRequestValues;
    }) => {
      const res = await api.patch(`/requests/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Emergency request updated!");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update request");
    },
  });

  return (
    <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle>Edit Pending Request</DialogTitle>
          <DialogDescription>
            Update pickup details before a dispatch coordinator assigns an
            ambulance.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(
            (vals) =>
              editing && editMutation.mutate({ id: editing.id, data: vals })
          )}
          className="space-y-4 pt-2"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Patient Phone</Label>
            <Input id="edit-phone" {...register("patientPhone")} />
            {errors.patientPhone && (
              <p className="text-xs text-destructive">
                {errors.patientPhone.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-pickup">Pickup Address</Label>
            <Input id="edit-pickup" {...register("pickupAddress")} />
            {errors.pickupAddress && (
              <p className="text-xs text-destructive">
                {errors.pickupAddress.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-dest">Destination Hospital</Label>
            <Input id="edit-dest" {...register("destinationAddress")} />
            {errors.destinationAddress && (
              <p className="text-xs text-destructive">
                {errors.destinationAddress.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-priority">Criticality Level</Label>
            <Select
              value={editPriority}
              onValueChange={(v) =>
                setValue(
                  "priority",
                  (v as EditRequestValues["priority"]) || "HIGH"
                )
              }
            >
              <SelectTrigger
                id="edit-priority"
                className="w-full h-10 rounded-xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CRITICAL">Critical (ICU)</SelectItem>
                <SelectItem value="HIGH">High (ICU)</SelectItem>
                <SelectItem value="MEDIUM">Medium (Basic)</SelectItem>
                <SelectItem value="LOW">Low (Basic)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={editMutation.isPending}>
              {editMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
