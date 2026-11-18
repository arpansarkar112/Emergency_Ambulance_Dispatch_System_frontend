import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeSelectorCard } from "@/components/shared/ThemeSelectorCard";
import { Truck } from "lucide-react";

// React Server Component: static layout and fleet navigation shortcuts rendered on server
export default function ProviderSettingsPage() {
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

      <ThemeSelectorCard
        title="Display Theme (Day / Night Shift)"
        description="Dark mode reduces cabin glare during overnight emergency transport shifts."
        lightLabel="Light Mode"
        darkLabel="Night Shift (Dark)"
        systemLabel="System"
      />

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
