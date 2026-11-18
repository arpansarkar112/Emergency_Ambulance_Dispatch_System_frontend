import Link from "next/link";
import { Ambulance, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Ambulance className="h-5 w-5" />
              </span>
              <span>
                Call<span className="text-primary">Ambulance</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              24/7 criticality-matched emergency ambulance dispatch connecting patients, trauma coordinators, and certified Mobile ICU, BLS, and Pediatric units in real time.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-brand-emerald bg-emerald-500/10 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="h-4 w-4" />
              HIPAA-Aware Dispatch & Stripe Verified Billing
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Platform</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/explore" className="hover:text-primary transition-colors">
                  Explore Ambulance Fleet
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary transition-colors">
                  Clinical Transport Services
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Transparent Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Emergency Safety Blog
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Request Dispatch Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Company & Support</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About CallAmbulance
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Command Desk
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">24/7 Dispatch Desk</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <a href="tel:18009112273" className="hover:text-foreground transition-colors">
                  1-800-911-CARE (24/7 Emergency)
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <a
                  href="mailto:dispatch@callambulance.health"
                  className="hover:text-foreground transition-colors"
                >
                  dispatch@callambulance.health
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>410 Medical Plaza, Suite 400, Metro City</span>
              </li>
            </ul>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://github.com/arpansarkar112/Emergency_Ambulance_Dispatch_System_frontend"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                X / Status
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {year} CallAmbulance Emergency Medical Systems. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/help" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
