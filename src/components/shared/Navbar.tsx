"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Ambulance,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  User as UserIcon,
  CreditCard,
  ShieldCheck,
  Activity,
  Baby,
  HeartPulse,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as
    | { name?: string | null; email?: string | null; image?: string | null; role?: string }
    | undefined;
  const role = user?.role;

  const dashboardHref =
    role === "ADMIN" ? "/admin" : role === "DRIVER" ? "/provider" : "/dashboard";
  const profileHref =
    role === "ADMIN"
      ? "/admin/settings"
      : role === "DRIVER"
        ? "/provider/profile"
        : "/dashboard/profile";
  const settingsHref =
    role === "ADMIN"
      ? "/admin/settings"
      : role === "DRIVER"
        ? "/provider/settings"
        : "/dashboard/settings";
  const paymentsHref =
    role === "ADMIN"
      ? "/admin/payments"
      : role === "DRIVER"
        ? "/provider/earnings"
        : "/dashboard/payments";

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors px-2.5 py-1.5 rounded-xl ${
      isActive(href)
        ? "text-primary bg-primary/10"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 gap-3">
        {/* Brand + Mobile Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <MobileMenu />
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Ambulance className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline-block">
              Call<span className="text-primary">Ambulance</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          <Link href="/explore" className={linkClass("/explore")}>
            Explore Fleet
          </Link>

          {/* Services Mega-Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 text-sm font-medium transition-colors px-2.5 py-1.5 rounded-xl cursor-pointer ${
                    isActive("/services") || isActive("/pricing")
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                />
              }
            >
              Services
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-2 rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground px-2 py-1">
                  Emergency Transport Tiers
                </DropdownMenuLabel>
                <DropdownMenuItem
                  render={<Link href="/explore?type=ICU" className="flex items-start gap-3 p-2 rounded-lg" />}
                >
                  <HeartPulse className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Mobile ICU & Critical Care</span>
                    <span className="text-xs text-muted-foreground">Ventilator, 12-lead ECG & ICU crew</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/explore?type=BASIC" className="flex items-start gap-3 p-2 rounded-lg" />}
                >
                  <Activity className="h-4 w-4 text-brand-navy mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Basic Life Support (BLS)</span>
                    <span className="text-xs text-muted-foreground">Rapid transport & clinic transfers</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/explore?type=PEDIATRIC" className="flex items-start gap-3 p-2 rounded-lg" />}
                >
                  <Baby className="h-4 w-4 text-brand-emerald mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Pediatric & Neonatal Care</span>
                    <span className="text-xs text-muted-foreground">Thermal incubator & child care</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/services" className="p-2 rounded-lg font-medium" />}>
                All Clinical Services
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/pricing" className="p-2 rounded-lg font-medium" />}>
                Transparent Billing & Pricing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <Link href={dashboardHref} className={linkClass(dashboardHref)}>
              Dashboard
            </Link>
          )}
          <Link href="/blog" className={linkClass("/blog")}>
            Blog
          </Link>
          <Link href="/about" className={linkClass("/about")}>
            About
          </Link>
          <Link href="/contact" className={linkClass("/contact")}>
            Contact
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:18009112273"
            className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-xl transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            24/7 Desk
          </a>

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                    aria-label="Open account menu"
                  />
                }
              >
                <span className="h-7 w-7 rounded-full overflow-hidden bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </span>
                <span className="hidden sm:inline-block max-w-[110px] truncate text-foreground">
                  {user.name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-1.5 rounded-xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 py-2">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {user.name || "CallAmbulance User"}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {role || "PATIENT"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href={dashboardHref} className="flex items-center gap-2 p-2 rounded-lg" />}
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  Dashboard Overview
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href={profileHref} className="flex items-center gap-2 p-2 rounded-lg" />}
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href={paymentsHref} className="flex items-center gap-2 p-2 rounded-lg" />}
                >
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  {role === "DRIVER" ? "Earnings & Payouts" : "Payments & Billing"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href={settingsHref} className="flex items-center gap-2 p-2 rounded-lg" />}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </DropdownMenuItem>
                {role === "ADMIN" && (
                  <DropdownMenuItem
                    render={<Link href="/admin/ambulances" className="flex items-center gap-2 p-2 rounded-lg" />}
                  >
                    <ShieldCheck className="h-4 w-4 text-brand-emerald" />
                    Manage Fleet
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={async () => {
                    await signOut({ redirect: false });
                    window.location.href = "/login";
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:inline-block">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
