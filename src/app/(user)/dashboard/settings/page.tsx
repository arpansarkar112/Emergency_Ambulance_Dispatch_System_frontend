"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Monitor, Moon, ShieldCheck, Sun } from "lucide-react";

export default function UserSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [billingReceipts, setBillingReceipts] = useState(true);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Portal Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure appearance, emergency notification preferences, and account security links.
        </p>
      </div>

      <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
        <CardHeader>
          <CardTitle>Appearance Theme</CardTitle>
          <CardDescription>Choose Light Mode, Dark Mode, or sync with your OS.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2.5">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
            className="gap-2"
          >
            <Sun className="h-4 w-4" />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
            className="gap-2"
          >
            <Moon className="h-4 w-4" />
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("system")}
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            System
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Dispatch & Billing Notifications
          </CardTitle>
          <CardDescription>Control live alerts during emergency missions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Live Status Milestone Alerts</p>
              <p className="text-xs text-muted-foreground">
                Notify when an ambulance is assigned, en route, or arriving at pickup.
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
              <p className="text-sm font-medium text-foreground">Stripe Billing Receipts</p>
              <p className="text-xs text-muted-foreground">
                Receive itemized post-trip invoices immediately upon bill creation.
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

      <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-emerald" />
            Security & Emergency Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/dashboard/profile">
            <Button variant="outline">Update Password & Avatar</Button>
          </Link>
          <Link href="/help">
            <Button variant="ghost">Help & FAQ Center</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
