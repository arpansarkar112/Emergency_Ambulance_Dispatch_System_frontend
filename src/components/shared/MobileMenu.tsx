"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Ambulance, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user as { name?: string | null; email?: string | null; role?: string } | undefined;
  const role = user?.role;
  const dashboardHref =
    role === "ADMIN" ? "/admin" : role === "DRIVER" ? "/provider" : "/dashboard";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Explore Fleet", href: "/explore" },
    { label: "Clinical Services", href: "/services" },
    { label: "Pricing & Billing", href: "/pricing" },
    ...(user ? [{ label: "Dashboard", href: dashboardHref }] : []),
    { label: "Blog & Guides", href: "/blog" },
    { label: "About Us", href: "/about" },
    { label: "Contact Desk", href: "/contact" },
    { label: "Help & FAQ", href: "/help" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl text-foreground hover:bg-muted h-9 w-9 lg:hidden cursor-pointer"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[290px] p-6 bg-background border-r border-border">
        <div className="flex flex-col h-full">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg tracking-tight mb-6"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Ambulance className="h-4 w-4" />
            </span>
            <span>
              Call<span className="text-primary">Ambulance</span>
            </span>
          </Link>

          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-border space-y-2.5">
            {user ? (
              <>
                <div className="px-2 pb-2">
                  <p className="text-sm font-semibold truncate text-foreground">
                    {user.name || "Signed in"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Button
                  variant="destructive"
                  className="w-full justify-center gap-2"
                  onClick={async () => {
                    setOpen(false);
                    await signOut({ redirect: false });
                    window.location.href = "/login";
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="block">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="block">
                  <Button className="w-full">Create Account</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
