import { ProfileManager } from "@/components/shared/ProfileManager";
import { ThemeSelectorCard } from "@/components/shared/ThemeSelectorCard";

// React Server Component: static layout shell rendered on server, interactive children isolated at leaf boundaries
export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 pb-10">
      <ProfileManager
        heading="Admin Profile & Settings"
        subtitle="Manage your administrator credentials, profile photo, password, and console appearance."
      />

      <div className="px-4 sm:px-8">
        <ThemeSelectorCard
          className="rounded-xl border border-border/80 bg-card shadow-xs max-w-2xl"
          title="Console Appearance"
          description="Choose your preferred Light, Dark, or System color theme across all dashboards."
          lightLabel="Light Mode"
          darkLabel="Dark Mode"
          systemLabel="System Default"
        />
      </div>
    </div>
  );
}
