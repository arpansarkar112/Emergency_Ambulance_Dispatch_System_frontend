"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Ambulance } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10 md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 border-r-0 w-[300px]">
        <div className="flex flex-col gap-6 py-6 px-4">
          <Link
            href="/#hero"
            className="flex items-center gap-2.5 font-bold text-xl tracking-tight mb-4"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
              <Ambulance className="h-4 w-4" />
            </div>
            <span>MedDispatch Pro</span>
          </Link>
          <div className="flex flex-col gap-4">
            <Link href="/#about" className="text-base text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
              About
            </Link>
            <Link href="/#how-it-works" className="text-base text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
              How It Works
            </Link>
            <Link href="/#services" className="text-base text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
              Services & Fleet
            </Link>
            <Link href="/#pricing" className="text-base text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
              Pricing
            </Link>
            <Link href="/#contact" className="text-base text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </div>
          <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-border/40 w-4/5">
            <Link href="/login" className="text-base text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
              Sign In
            </Link>
            <Link href="/register" className="text-base text-red-600 font-semibold transition-colors" onClick={() => setOpen(false)}>
              Request Dispatch →
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
