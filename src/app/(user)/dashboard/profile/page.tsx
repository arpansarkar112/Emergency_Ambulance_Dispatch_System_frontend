import { ProfileManager } from "@/components/shared/ProfileManager";

// React Server Component page passing serializable props to Client Component boundary
export default function UserProfilePage() {
  return (
    <ProfileManager
      heading="My Patient Profile"
      subtitle="Keep your emergency contact, blood group, pickup address, avatar, and password up to date."
    />
  );
}
