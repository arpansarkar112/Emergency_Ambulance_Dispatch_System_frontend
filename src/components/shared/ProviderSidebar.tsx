import Link from "next/link";
import { Ambulance, ListTodo, DollarSign, User, LogOut } from "lucide-react";

const routes = [
  { label: "My Tasks", icon: ListTodo, href: "/provider" },
  { label: "Earnings", icon: DollarSign, href: "/provider/earnings" },
  { label: "Profile", icon: User, href: "/provider/profile" },
];

export function ProviderSidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <Link href="/provider" className="flex items-center gap-2 font-bold text-white">
          <Ambulance className="h-6 w-6 text-primary" />
          <span>Provider Panel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-slate-800 p-4">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
          <LogOut className="h-5 w-5" />
          Exit to Main Site
        </Link>
      </div>
    </div>
  );
}
