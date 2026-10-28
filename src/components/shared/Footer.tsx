import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-10 bg-background">
      <div className="container mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/#hero" className="font-medium tracking-tight text-sm">
          MedDispatch.
        </Link>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} MedDispatch. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <Link href="/#about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/#services" className="hover:text-foreground transition-colors">Services</Link>
          <Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/#contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
