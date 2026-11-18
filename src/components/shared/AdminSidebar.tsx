"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Ambulance,
  DollarSign,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Tags,
  FileBarChart2,
  Settings,
  ExternalLink,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";

const routes = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Emergency Requests", icon: AlertTriangle, href: "/admin/requests" },
  { label: "Manage Fleet", icon: Ambulance, href: "/admin/ambulances" },
  { label: "Manage Users", icon: Users, href: "/admin/users" },
  { label: "Categories", icon: Tags, href: "/admin/categories" },
  { label: "Payments & Billing", icon: DollarSign, href: "/admin/payments" },
  { label: "Reports & Messages", icon: FileBarChart2, href: "/admin/reports" },
  { label: "Profile & Settings", icon: Settings, href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen, setUserRole } = useAppStore();

  useEffect(() => {
    setUserRole("admin");
  }, [setUserRole]);

  return (
    <>
      {/* Mobile Header */}
      <div className="flex md:hidden h-14 items-center justify-between border-b border-border bg-card px-4 shrink-0">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Ambulance className="h-4 w-4" />
          </span>
          <span>Admin Command</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle admin sidebar"
            className="p-2 rounded-xl text-foreground hover:bg-muted cursor-pointer"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-200 md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5 font-bold text-sidebar-foreground hover:opacity-85 transition-opacity"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Ambulance className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <span className="block text-sm">Admin Command</span>
              <span className="block text-[10px] font-normal text-muted-foreground">Dispatch Control</span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle className="hidden md:inline-flex" />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid gap-1 px-3" aria-label="Admin navigation">
            {routes.map((route) => {
              const isActive = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all font-medium text-sm ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <route.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{route.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-sidebar-border p-3 space-y-1.5">
          <Link
            href="/"
            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <span>Public Website</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={async () => {
              setSidebarOpen(false);
              await signOut({ redirect: false });
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors font-medium text-sm cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
