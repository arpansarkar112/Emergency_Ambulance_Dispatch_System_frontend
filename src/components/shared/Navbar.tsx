import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link href="/" className="flex items-center gap-2 font-medium text-lg tracking-tight">
            <span className="hidden sm:inline-block">CallAmbulance.</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex gap-8 items-center text-sm font-medium">
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors">Services</Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link href="/register">
            <Button variant="default" className="rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
