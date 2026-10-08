"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="flex flex-col gap-4 py-4">
          <Link href="/" className="font-bold text-xl text-primary mb-4" onClick={() => setOpen(false)}>
            SwiftRescue
          </Link>
          <Link href="/about" className="text-sm font-medium" onClick={() => setOpen(false)}>About</Link>
          <Link href="/services" className="text-sm font-medium" onClick={() => setOpen(false)}>Services</Link>
          <Link href="/pricing" className="text-sm font-medium" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/contact" className="text-sm font-medium" onClick={() => setOpen(false)}>Contact</Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
