import Link from "next/link";
import { Ambulance } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2 font-semibold">
          <Ambulance className="h-5 w-5 text-primary" />
          <span>SwiftRescue</span>
        </div>
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built for emergency response. &copy; {new Date().getFullYear()} SwiftRescue Inc.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
