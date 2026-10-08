"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
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
        <div className="flex flex-col gap-6 py-6 px-2">
          <Link href="/" className="font-medium text-xl tracking-tight mb-4" onClick={() => setOpen(false)}>
            CallAmbulance.
          </Link>
          <div className="flex flex-col gap-4">
            <Link href="/about" className="text-lg text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>About</Link>
            <Link href="/services" className="text-lg text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>Services</Link>
            <Link href="/pricing" className="text-lg text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>Pricing</Link>
            <Link href="/contact" className="text-lg text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>Contact</Link>
          </div>
          <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-border/40 w-3/4">
            <Link href="/login" className="text-lg text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>Sign in</Link>
            <Link href="/register" className="text-lg text-foreground font-medium transition-colors" onClick={() => setOpen(false)}>Get Started</Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
