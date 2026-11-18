"use client";

import { memo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell } from "lucide-react";

export const NotificationPreferencesCard = memo(
  function NotificationPreferencesCard() {
    const [smsAlerts, setSmsAlerts] = useState(true);
    const [billingReceipts, setBillingReceipts] = useState(true);

    return (
      <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Dispatch & Billing Notifications
          </CardTitle>
          <CardDescription>
            Control live alerts during emergency missions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Live Status Milestone Alerts
              </p>
              <p className="text-xs text-muted-foreground">
                Notify when an ambulance is assigned, en route, or arriving at
                pickup.
              </p>
            </div>
            <Button
              size="sm"
              variant={smsAlerts ? "default" : "outline"}
              onClick={() => {
                setSmsAlerts((v) => !v);
                toast.success("Notification preference saved");
              }}
            >
              {smsAlerts ? "Enabled" : "Muted"}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Stripe Billing Receipts
              </p>
              <p className="text-xs text-muted-foreground">
                Receive itemized post-trip invoices immediately upon bill
                creation.
              </p>
            </div>
            <Button
              size="sm"
              variant={billingReceipts ? "default" : "outline"}
              onClick={() => {
                setBillingReceipts((v) => !v);
                toast.success("Receipt preference saved");
              }}
            >
              {billingReceipts ? "Enabled" : "Muted"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);
