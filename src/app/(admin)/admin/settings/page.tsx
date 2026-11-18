"use client";

import { ProfileManager } from "@/components/shared/ProfileManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Monitor, Moon, Sun } from "lucide-react";

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 pb-10">
      <ProfileManager
        heading="Admin Profile & Settings"
        subtitle="Manage your administrator credentials, profile photo, password, and console appearance."
      />

      <div className="px-4 sm:px-8">
        <Card className="rounded-xl border border-border/80 bg-card shadow-xs max-w-2xl">
          <CardHeader>
            <CardTitle>Console Appearance</CardTitle>
            <CardDescription>
              Choose your preferred Light, Dark, or System color theme across all dashboards.
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
              Dark Mode
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("system")}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              System Default
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
