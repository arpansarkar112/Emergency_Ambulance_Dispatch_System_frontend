import { ProfileManager } from "@/components/shared/ProfileManager";

// React Server Component page passing serializable props to Client Component boundary
export default function ProviderProfilePage() {
  return (
    <ProfileManager
      heading="Driver Profile"
      subtitle="Update your paramedic contact details, station address, avatar photo, and password."
    />
  );
}
