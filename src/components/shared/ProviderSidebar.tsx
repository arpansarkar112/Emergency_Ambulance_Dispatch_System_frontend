"use client";

import Link from "next/link";
import { Ambulance, ListTodo, DollarSign, User, LogOut, Truck } from "lucide-react";
import { signOut } from "next-auth/react";

const routes = [
  { label: "My Tasks", icon: ListTodo, href: "/provider" },
  { label: "My Vehicles", icon: Truck, href: "/provider/vehicles" },
  { label: "Earnings", icon: DollarSign, href: "/provider/earnings" },
  { label: "Profile", icon: User, href: "/provider/profile" },
];

export function ProviderSidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-slate-100 border-r border-gray-200">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/provider" className="flex items-center gap-2 font-bold text-gray-900 transition-opacity hover:opacity-80">
          <Ambulance className="h-6 w-6 text-primary" />
          <span>Driver Panel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-slate-200 hover:text-gray-900 transition-all font-medium text-sm"
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
          <button
            onClick={async () => {
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
    </div>
  );
}
