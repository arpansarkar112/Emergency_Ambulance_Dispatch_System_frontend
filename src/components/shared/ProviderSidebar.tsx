"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ambulance, ListTodo, DollarSign, User, LogOut, Truck, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";

const routes = [
  { label: "My Tasks", icon: ListTodo, href: "/provider" },
  { label: "My Vehicles", icon: Truck, href: "/provider/vehicles" },
  { label: "Earnings", icon: DollarSign, href: "/provider/earnings" },
  { label: "Profile", icon: User, href: "/provider/profile" },
];

export function ProviderSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen, setUserRole } = useAppStore();

  useEffect(() => {
    setUserRole("provider");
  }, [setUserRole]);

  return (
    <>
      {/* Mobile Header */}
      <div className="flex md:hidden h-14 items-center justify-between border-b bg-white px-4 shrink-0">
        <Link href="/provider" className="flex items-center gap-2 font-bold text-gray-900">
          <Ambulance className="h-5 w-5 text-primary" />
          <span>Driver Panel</span>
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
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-slate-100 border-r border-gray-200 transition-transform duration-200 md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <Link
            href="/provider"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 font-bold text-gray-900 transition-opacity hover:opacity-80"
          >
            <Ambulance className="h-6 w-6 text-primary" />
            <span>Driver Panel</span>
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
                      : "text-gray-600 hover:bg-slate-200 hover:text-gray-900"
                  }`}
                >
                  <route.icon className="h-4 w-4" />
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
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 transition-all font-medium text-sm mt-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </div>
        <div className="mt-auto border-t border-gray-200 p-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary transition-opacity hover:opacity-80">
            <Ambulance className="h-6 w-6" />
            CallAmbulance.
          </Link>
        </div>
      </aside>
    </>
  );
}
