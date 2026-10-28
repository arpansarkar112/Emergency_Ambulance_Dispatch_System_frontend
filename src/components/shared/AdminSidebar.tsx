"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Ambulance, DollarSign, LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";

const routes = [
  { label: "Emergency Requests", icon: LayoutDashboard, href: "/admin" },
  { label: "Users Management", icon: Users, href: "/admin/users" },
  { label: "Ambulances", icon: Ambulance, href: "/admin/ambulances" },
  { label: "Payments & Billing", icon: DollarSign, href: "/admin/payments" },
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
      <div className="flex md:hidden h-14 items-center justify-between border-b bg-white px-4 shrink-0">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-gray-900">
          <Ambulance className="h-5 w-5 text-primary" />
          <span>Admin Panel</span>
        </Link>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 rounded-md text-gray-600 hover:bg-slate-100"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-slate-100 dark:bg-slate-900 border-r transition-transform duration-200 md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 font-bold text-gray-900 dark:text-white transition-opacity hover:opacity-80"
          >
            <Ambulance className="h-6 w-6 text-primary" />
            <span>Admin Panel</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded text-gray-500 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-4">
            {routes.map((route) => {
              const isActive = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all font-medium text-sm ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </Link>
              );
            })}
            <button
              onClick={async () => {
                setSidebarOpen(false);
                await signOut({ redirect: false });
                window.location.href = "/login";
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all font-medium text-sm mt-2"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
        <div className="mt-auto border-t p-4 flex justify-center">
          <Link href="/" className="flex items-center gap-2 font-medium text-lg tracking-tight hover:opacity-80 transition-opacity text-primary">
            <Ambulance className="h-6 w-6" />
            CallAmbulance.
          </Link>
        </div>
      </aside>
    </>
  );
}
