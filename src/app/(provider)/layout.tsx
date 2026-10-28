import { ProviderSidebar } from "@/components/shared/ProviderSidebar";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-muted/40">
      <ProviderSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
