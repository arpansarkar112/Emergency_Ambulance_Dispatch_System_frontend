"use client";

import { memo } from "react";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Moon, Sun } from "lucide-react";

interface ThemeSelectorCardProps {
  title?: string;
  description?: string;
  lightLabel?: string;
  darkLabel?: string;
  systemLabel?: string;
  className?: string;
}

export const ThemeSelectorCard = memo(function ThemeSelectorCard({
  title = "Console Appearance",
  description = "Choose your preferred Light, Dark, or System color theme across all dashboards.",
  lightLabel = "Light Mode",
  darkLabel = "Dark Mode",
  systemLabel = "System Default",
  className = "rounded-xl border border-border/80 bg-card shadow-xs",
}: ThemeSelectorCardProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2.5">
        <Button
          variant={theme === "light" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("light")}
          className="gap-2"
        >
          <Sun className="h-4 w-4" />
          {lightLabel}
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("dark")}
          className="gap-2"
        >
          <Moon className="h-4 w-4" />
          {darkLabel}
        </Button>
        <Button
          variant={theme === "system" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("system")}
          className="gap-2"
        >
          <Monitor className="h-4 w-4" />
          {systemLabel}
        </Button>
      </CardContent>
    </Card>
  );
});
