"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Ambulance, DollarSign, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const routes = [
  { label: "Emergency Requests", icon: LayoutDashboard, href: "/admin" },
  { label: "Users Management", icon: Users, href: "/admin/users" },
  { label: "Ambulances", icon: Ambulance, href: "/admin/ambulances" },
  { label: "Payments & Billing", icon: DollarSign, href: "/admin/payments" },
];

export function AdminSidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-slate-100 dark:bg-slate-900 border-r">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white transition-opacity hover:opacity-80">
          <Ambulance className="h-6 w-6 text-primary" />
          <span>Admin Panel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all font-medium text-sm"
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
          <button
            onClick={async () => {
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
    </div>
  );
}
