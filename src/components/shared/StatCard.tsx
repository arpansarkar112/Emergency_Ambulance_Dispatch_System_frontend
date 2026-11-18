import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: "primary" | "navy" | "emerald" | "amber";
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  navy: "bg-brand-navy/10 text-brand-navy",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

export const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "primary",
}: StatCardProps) {
  return (
    <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-xl", ACCENT_STYLES[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
});
