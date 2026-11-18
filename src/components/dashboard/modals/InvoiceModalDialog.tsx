"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { DispatchRequestItem } from "@/types";

export interface InvoiceModalDialogProps {
  selectedReq: DispatchRequestItem | null;
  initialAmount: string;
  onClose: () => void;
}

export default function InvoiceModalDialog({
  selectedReq,
  initialAmount,
  onClose,
}: InvoiceModalDialogProps) {
  const queryClient = useQueryClient();
  // Colocate frequently updated input state inside the modal so typing never re-renders the parent page/table
  const [amount, setAmount] = useState(initialAmount);

  const billMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const res = await api.post("/payments/create", {
        requestId: id,
        amount: Number(amount),
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Payment bill generated for patient!");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["admin-requests-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to generate payment bill"
      );
    },
  });

  return (
    <Dialog
      open={Boolean(selectedReq)}
      onOpenChange={(o) => !o && onClose()}
    >
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>
            Generate Invoice — #{selectedReq?.id?.slice(0, 8).toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            The patient will immediately receive a Stripe Checkout button in
            their portal.
          </DialogDescription>
        </DialogHeader>
        {selectedReq && (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1 text-muted-foreground">
              <p>
                Patient:{" "}
                <strong className="text-foreground">
                  {selectedReq.patient?.email}
                </strong>
              </p>
              <p>
                Route:{" "}
                <strong className="text-foreground">
                  {selectedReq.pickupAddress} → {selectedReq.destinationAddress}
                </strong>
              </p>
              <p>
                Criticality:{" "}
                <strong className="text-foreground">
                  {selectedReq.priority}
                </strong>
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bill-amount">Invoice Amount ($ USD)</Label>
              <Input
                id="bill-amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 185.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              disabled={
                billMutation.isPending || !amount || Number(amount) <= 0
              }
              onClick={() =>
                billMutation.mutate({
                  id: selectedReq.id,
                  amount: Number(amount),
                })
              }
            >
              {billMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Bill...
                </>
              ) : (
                "Send Invoice to Patient"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
