import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeSelectorCard } from "@/components/shared/ThemeSelectorCard";
import { NotificationPreferencesCard } from "@/components/shared/NotificationPreferencesCard";
import { ShieldCheck } from "lucide-react";

// React Server Component: static headings and navigation cards stay on the server
export default function UserSettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Portal Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure appearance, emergency notification preferences, and account
          security links.
        </p>
      </div>

      <ThemeSelectorCard
        title="Appearance Theme"
        description="Choose Light Mode, Dark Mode, or sync with your OS."
        lightLabel="Light"
        darkLabel="Dark"
        systemLabel="System"
      />

      <NotificationPreferencesCard />

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
