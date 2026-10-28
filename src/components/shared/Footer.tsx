import Link from "next/link";
import { Ambulance } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-12 bg-slate-950 text-slate-300">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/#hero" className="flex items-center gap-2.5 font-bold tracking-tight text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
            <Ambulance className="h-4 w-4" />
          </div>
          <span>MedDispatch Pro</span>
        </Link>
        <p className="text-center text-sm text-slate-400 md:text-left">
          &copy; {new Date().getFullYear()} MedDispatch Pro — Emergency Medical Dispatch System. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          <Link href="/#about" className="hover:text-white transition-colors">About</Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="/#services" className="hover:text-white transition-colors">Services</Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/#contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
