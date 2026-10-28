"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";
import { Ambulance, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const dashboardHref =
    role === "ADMIN" ? "/admin" : role === "DRIVER" ? "/provider" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Link href="/#hero" className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-foreground hover:opacity-90 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm">
              <Ambulance className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight">MedDispatch Pro</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Emergency Response
              </span>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex gap-7 items-center text-sm font-medium">
          <Link href="/#about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="/#services" className="text-muted-foreground hover:text-foreground transition-colors">
            Services & Fleet
          </Link>
          <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link href={dashboardHref}>
              <Button variant="default" className="rounded-full px-5 gap-2 bg-red-600 hover:bg-red-700 text-white">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2">
                Sign In
              </Link>
              <Link href="/register">
                <Button variant="default" className="rounded-full px-6 bg-red-600 hover:bg-red-700 text-white">
                  Request Dispatch
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
