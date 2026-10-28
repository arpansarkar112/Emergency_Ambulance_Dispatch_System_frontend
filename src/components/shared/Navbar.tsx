"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";
import { useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const dashboardHref =
    role === "ADMIN" ? "/admin" : role === "DRIVER" ? "/provider" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link href="/#hero" className="font-medium text-lg tracking-tight hover:opacity-80 transition-opacity">
            MedDispatch.
          </Link>
        </div>
        
        <nav className="hidden md:flex gap-8 items-center text-sm">
          <Link href="/#about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/#services" className="text-muted-foreground hover:text-foreground transition-colors">
            Services
          </Link>
          <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <Link href={dashboardHref}>
              <Button variant="default" className="rounded-full px-6 h-9 text-sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/register">
                <Button variant="default" className="rounded-full px-6 h-9 text-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
