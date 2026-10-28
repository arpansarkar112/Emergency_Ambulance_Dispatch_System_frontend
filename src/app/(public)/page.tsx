import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col bg-background text-foreground">
      {/* Hero Section */}
      <section
        id="hero"
        className="w-full py-28 md:py-40 flex items-center justify-center scroll-mt-16"
      >
        <div className="container mx-auto px-4 md:px-8 flex flex-col items-center text-center space-y-6 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-muted-foreground border border-border/60 rounded-full px-4 py-1">
            24/7 Emergency Medical Dispatch
          </span>
          <h1 className="text-4xl font-medium tracking-tight sm:text-6xl leading-tight">
            Rapid medical response, callAmbulance
          </h1>
          <p className="max-w-xl text-muted-foreground md:text-lg font-light leading-relaxed">
            Connecting patients, dispatch coordinators, and certified ambulance units in real time when every second counts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full sm:w-auto">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-11 text-sm">
                Request Ambulance
              </Button>
            </Link>
            <Link href="/#services">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto rounded-full px-8 h-11 text-sm">
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="w-full border-t border-border/40 py-24 md:py-32 scroll-mt-16"
      >
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="space-y-4 mb-16">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">About</p>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight max-w-2xl">
              Built to remove friction between emergency calls and hospital arrival.
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed max-w-2xl">
              CallAmbulance streamlines triage, unit allocation, and live driver tracking into one calm, unified system—matching critical emergencies to ICU units and routine transfers to Basic Life Support.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border/40">
            <div>
              <p className="text-3xl font-medium">&lt; 8m</p>
              <p className="text-xs text-muted-foreground mt-1">Avg. Dispatch Time</p>
            </div>
            <div>
              <p className="text-3xl font-medium">99.9%</p>
              <p className="text-xs text-muted-foreground mt-1">System Reliability</p>
            </div>
            <div>
              <p className="text-3xl font-medium">24/7</p>
              <p className="text-xs text-muted-foreground mt-1">Active Coverage</p>
            </div>
            <div>
              <p className="text-3xl font-medium">100%</p>
              <p className="text-xs text-muted-foreground mt-1">Verified Units</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="w-full border-t border-border/40 py-24 md:py-32 bg-muted/15 scroll-mt-16"
      >
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="space-y-3 mb-14">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Services</p>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
              Coordinated care at every urgency level.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-2 p-6 rounded-xl border border-border/60 bg-background">
              <h3 className="text-lg font-medium">Mobile ICU</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Dedicated to Critical and High priority calls with advanced life-support equipment and paramedic crews.
              </p>
            </div>

            <div className="space-y-2 p-6 rounded-xl border border-border/60 bg-background">
              <h3 className="text-lg font-medium">Basic Life Support</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Reliable medical transport for Medium and Low priority requests and inter-hospital patient transfers.
              </p>
            </div>

            <div className="space-y-2 p-6 rounded-xl border border-border/60 bg-background">
              <h3 className="text-lg font-medium">Live Status & Billing</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Real-time driver status updates from dispatch to completion, followed by transparent digital billing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="w-full border-t border-border/40 py-24 md:py-32 scroll-mt-16"
      >
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="space-y-3 mb-14">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Pricing</p>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
              Simple, post-trip billing.
            </h2>
            <p className="text-sm text-muted-foreground font-light">
              No upfront payment required to request an ambulance. Bills are issued only after safe hospital drop-off.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-8 rounded-xl border border-border/60 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Low & Medium Priority</p>
                <h3 className="text-xl font-medium">Basic Life Support</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Standard emergency transport and hospital transfer.
                </p>
              </div>
              <div className="text-2xl font-medium">
                $50 – $120 <span className="text-xs text-muted-foreground font-light">/ completed trip</span>
              </div>
            </div>

            <div className="p-8 rounded-xl border border-border/60 bg-muted/20 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">High & Critical Priority</p>
                <h3 className="text-xl font-medium">Mobile ICU Dispatch</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Critical care ambulance with full intensive care instrumentation.
                </p>
              </div>
              <div className="text-2xl font-medium">
                $150 – $300 <span className="text-xs text-muted-foreground font-light">/ completed trip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="w-full border-t border-border/40 py-24 md:py-32 bg-muted/15 scroll-mt-16"
      >
        <div className="container mx-auto px-4 md:px-8 max-w-4xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Contact</p>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
              Need assistance or fleet access?
            </h2>
            <p className="text-sm text-muted-foreground font-light">
              hello@callambulance.com &nbsp;•&nbsp; 1-800-AMBULANCE (24/7 Command Desk)
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/register">
              <Button className="rounded-full px-7 h-10 text-sm">
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="rounded-full px-7 h-10 text-sm">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
