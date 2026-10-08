import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 bg-background">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-medium tracking-tight">
          <span>CallAmbulance.</span>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} CallAmbulance. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
