"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Moon, Sun, Truck } from "lucide-react";

export default function ProviderSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Driver Console Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Adjust display mode for daytime or night-shift ambulance operations.
        </p>
      </div>

      <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
        <CardHeader>
          <CardTitle>Display Theme (Day / Night Shift)</CardTitle>
          <CardDescription>
            Dark mode reduces cabin glare during overnight emergency transport shifts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2.5">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
            className="gap-2"
          >
            <Sun className="h-4 w-4" />
            Light Mode
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
            className="gap-2"
          >
            <Moon className="h-4 w-4" />
            Night Shift (Dark)
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
            <Truck className="h-4 w-4 text-primary" />
            Fleet & Account Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/provider/vehicles">
            <Button variant="outline">Manage Vehicle Availability</Button>
          </Link>
          <Link href="/provider/profile">
            <Button variant="ghost">Update Profile & Password</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
