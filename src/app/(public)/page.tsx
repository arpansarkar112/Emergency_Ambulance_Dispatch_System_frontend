import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Ambulance,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Radio,
  ShieldCheck,
  Siren,
  Stethoscope,
  Truck,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col bg-background text-foreground">
      {/* HERO SECTION */}
      <section
        id="hero"
        className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-red-50/40 via-background to-background py-20 md:py-28 lg:py-36 scroll-mt-16"
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                24/7 Critical Care & Emergency Medical Dispatch Network
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Rapid Emergency Medical Dispatch{" "}
                <span className="text-red-600">When Every Second Matters.</span>
              </h1>

              <p className="mx-auto lg:mx-0 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                MedDispatch Pro connects patients, command-center administrators, and certified ambulance drivers on a single real-time platform—ensuring criticality-matched ICU and Basic Life Support deployment within minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full px-8 h-12 text-base font-semibold bg-red-600 hover:bg-red-700 text-white gap-2 shadow-md"
                  >
                    <Siren className="h-5 w-5" />
                    Request Emergency Ambulance
                  </Button>
                </Link>
                <Link href="/#how-it-works" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full px-8 h-12 text-base font-medium gap-2"
                  >
                    See How It Works
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ICU & Basic Life Support Units
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Live Driver Status Telemetry
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Post-Trip Digital Billing
                </span>
              </div>
            </div>

            {/* Live Command Center Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                      <Radio className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Live Dispatch Command</p>
                      <p className="text-xs text-muted-foreground">Criticality Triage & Fleet Allocation</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white">System Online</Badge>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                        Priority: CRITICAL
                      </span>
                      <Badge variant="destructive" className="text-[11px]">
                        ICU Unit Required
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold">Cardiac Emergency — Downtown Sector 4</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5 text-red-600" />
                        Allocated: AMB-ICU-104
                      </span>
                      <span className="font-medium text-emerald-700">Status: EN_ROUTE</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Priority: MEDIUM
                      </span>
                      <Badge variant="secondary" className="text-[11px]">
                        BASIC Unit Required
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold">Patient Transfer — City General Hospital</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5 text-blue-600" />
                        Allocated: AMB-BLS-209
                      </span>
                      <span className="font-medium text-blue-700">Status: COMPLETED</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="rounded-lg bg-muted/50 p-2.5">
                    <p className="text-lg font-bold text-foreground">&lt; 8m</p>
                    <p className="text-[11px] text-muted-foreground">Avg Dispatch</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2.5">
                    <p className="text-lg font-bold text-foreground">99.9%</p>
                    <p className="text-[11px] text-muted-foreground">Fleet Uptime</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2.5">
                    <p className="text-lg font-bold text-foreground">24/7</p>
                    <p className="text-[11px] text-muted-foreground">ICU Coverage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-20 md:py-28 border-b border-border/50 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-3 py-1 text-xs uppercase tracking-wider text-red-600 border-red-200">
              About MedDispatch Pro
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Engineered for Zero-Friction Emergency Coordination
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Traditional ambulance dispatching suffers from manual phone delays, mismatched vehicle types, and opaque billing. MedDispatch Pro unifies patients, dispatch administrators, and ambulance drivers into one synchronized command ecosystem.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <HeartPulse className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Criticality-Driven Triage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every emergency call is categorized as Critical, High, Medium, or Low—strictly pairing life-threatening emergencies with Mobile ICU ambulances and routine transports with Basic Life Support units.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Dedicated Driver & Fleet Sync</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Administrators register ambulances, assign individual certified drivers, and monitor real-time vehicle availability. Completed trips automatically release units for the next emergency call.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Verified Post-Trip Billing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No upfront payment barriers during an emergency. Bills are generated by administrators only after safe hospital drop-off, with instant Stripe checkout and real-time status updates across all roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 md:py-28 bg-muted/30 border-b border-border/50 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-3 py-1 text-xs uppercase tracking-wider text-red-600 border-red-200">
              End-to-End Workflow
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How the Dispatch Process Works
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              A seamless four-stage lifecycle connecting Patient, Admin, and Driver from initial emergency call to completed hospital transport.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative rounded-2xl border border-border bg-background p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">Step 01 • Patient</span>
                <PhoneCall className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold">Call Emergency Request</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The patient submits pickup coordinates, destination hospital, contact number, and urgency level (Critical, High, Medium, or Low).
              </p>
            </div>

            <div className="relative rounded-2xl border border-border bg-background p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 02 • Admin</span>
                <Ambulance className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold">Allocate by Criticality</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The administrator allocates an available ambulance with an assigned driver matching the call&apos;s criticality (ICU for Critical/High, BASIC for Medium/Low).
              </p>
            </div>

            <div className="relative rounded-2xl border border-border bg-background p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Step 03 • Driver</span>
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold">Update Live Status</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The assigned driver responds and updates the live emergency status from <code className="text-xs">ASSIGNED</code> → <code className="text-xs">EN_ROUTE</code> → <code className="text-xs">PICKED_UP</code> → <code className="text-xs">COMPLETED</code>.
              </p>
            </div>

            <div className="relative rounded-2xl border border-border bg-background p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Step 04 • Billing</span>
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold">Bill & Instant Payment</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once the trip is completed, the admin generates the patient&apos;s bill. The patient pays online via Stripe, updating payment status across all roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES & FLEET TIERS SECTION */}
      <section id="services" className="py-20 md:py-28 border-b border-border/50 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-3 py-1 text-xs uppercase tracking-wider text-red-600 border-red-200">
              Services & Fleet Tiers
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Specialized Emergency Response Units
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Our fleet is segmented by clinical capability so every patient receives the exact level of medical intervention required.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border-2 border-red-200 bg-card p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <Badge variant="destructive">ICU Unit</Badge>
                <Stethoscope className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold">Mobile ICU (ALS)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dedicated to <strong>CRITICAL</strong> and <strong>HIGH</strong> priority emergencies. Equipped with cardiac monitors, ventilators, defibrillators, and critical care paramedics.
              </p>
              <ul className="space-y-2 pt-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" />
                  Cardiac & Trauma Life Support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" />
                  On-board Ventilator & Telemetry
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" />
                  Priority Hospital ER Hand-off
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">BASIC Unit</Badge>
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold">Basic Life Support (BLS)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Designed for <strong>MEDIUM</strong> and <strong>LOW</strong> urgency medical transport, non-life-threatening injuries, and inter-hospital patient transfers.
              </p>
              <ul className="space-y-2 pt-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  Certified EMT Crew & Oxygen Support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  Safe Immobilization & Stretcher Care
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  Rapid Inter-Facility Transfers
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <Badge variant="outline">PEDIATRIC Unit</Badge>
                <HeartPulse className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold">Pediatric & Specialized</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Outfitted with neonatal incubators and pediatric-calibrated life support instruments for safe infant and child emergency transport.
              </p>
              <ul className="space-y-2 pt-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Neonatal Incubator & Monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Pediatric Specialist Paramedics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Family-Accompanied Cabin Space
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 md:py-28 bg-muted/30 border-b border-border/50 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-3 py-1 text-xs uppercase tracking-wider text-red-600 border-red-200">
              Transparent Billing
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Clear, Post-Completion Medical Transport Pricing
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Requesting an ambulance is always $0 upfront. Administrators generate the official bill only after your trip is marked completed.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-border bg-background p-8 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <Badge variant="secondary">Low & Medium Priority</Badge>
                <h3 className="text-2xl font-bold">Basic Life Support</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">$50–$120</span>
                  <span className="text-sm text-muted-foreground">/ completed trip</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Standard medical transport billed upon safe arrival at the destination hospital.
                </p>
                <ul className="space-y-2.5 pt-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    $0 Upfront Dispatch Request
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    BASIC Ambulance Allocation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Online Stripe Checkout Receipt
                  </li>
                </ul>
              </div>
              <Link href="/register">
                <Button variant="outline" className="w-full rounded-full">
                  Book BLS Transport
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border-2 border-red-600 bg-background p-8 flex flex-col justify-between space-y-6 shadow-md relative">
              <div className="space-y-4">
                <Badge className="bg-red-600 text-white">High & Critical Priority</Badge>
                <h3 className="text-2xl font-bold">Mobile ICU Dispatch</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">$150–$300</span>
                  <span className="text-sm text-muted-foreground">/ completed trip</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Immediate ICU ambulance allocation with full life-support equipment and paramedic crew.
                </p>
                <ul className="space-y-2.5 pt-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-red-600" />
                    Immediate Priority Triage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-red-600" />
                    Dedicated ICU Ambulance & Driver
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-red-600" />
                    Billed Only After Completion
                  </li>
                </ul>
              </div>
              <Link href="/register">
                <Button className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white">
                  Request ICU Emergency
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-background p-8 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <Badge variant="outline">Drivers & Fleet Operators</Badge>
                <h3 className="text-2xl font-bold">Driver Network</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">100%</span>
                  <span className="text-sm text-muted-foreground">real-time earnings tracking</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Register as a certified driver, get assigned to an ambulance by Admin, and manage dispatches.
                </p>
                <ul className="space-y-2.5 pt-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Dedicated Vehicle Assignment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    One-Click Status Progression
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Live Paid & Pending Earnings Dashboard
                  </li>
                </ul>
              </div>
              <Link href="/register">
                <Button variant="outline" className="w-full rounded-full">
                  Join as Ambulance Driver
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 md:py-28 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="outline" className="px-3 py-1 text-xs uppercase tracking-wider text-red-600 border-red-200">
                24/7 Command & Support
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Contact Our Dispatch & Medical Coordination Center
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Need immediate assistance, hospital fleet onboarding, or billing support? Reach our 24/7 coordination desk or sign in directly to dispatch an ambulance online.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-xl border border-border p-5 space-y-2">
                  <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <Phone className="h-4 w-4" />
                    <span>Emergency Hotline</span>
                  </div>
                  <p className="text-lg font-bold">1-800-MED-911</p>
                  <p className="text-xs text-muted-foreground">Available 24/7 for critical dispatch</p>
                </div>

                <div className="rounded-xl border border-border p-5 space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 font-semibold">
                    <Mail className="h-4 w-4" />
                    <span>Operations & Billing</span>
                  </div>
                  <p className="text-lg font-bold">dispatch@meddispatch.pro</p>
                  <p className="text-xs text-muted-foreground">Hospital partnerships & billing</p>
                </div>

                <div className="rounded-xl border border-border p-5 space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                    <MapPin className="h-4 w-4" />
                    <span>Central Dispatch Headquarters</span>
                  </div>
                  <p className="text-sm font-medium">Central Medical Command Plaza, Sector 7, Healthcare District</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-border bg-slate-950 text-white p-8 md:p-10 space-y-6 shadow-xl">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Ready to Access the Platform?</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Sign in to your role-specific portal—Patient, Ambulance Driver, or Dispatch Administrator—to manage emergency requests in real time.
                  </p>
                </div>

                <div className="grid gap-3 pt-2">
                  <Link href="/register">
                    <Button size="lg" className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold h-12">
                      Create an Account (Patient or Driver)
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full rounded-full border-slate-700 bg-transparent text-white hover:bg-slate-900 hover:text-white h-12"
                    >
                      Sign In to Existing Account
                    </Button>
                  </Link>
                </div>

                <div className="border-t border-slate-800 pt-6 grid grid-cols-3 gap-4 text-center text-xs text-slate-400">
                  <div>
                    <p className="font-semibold text-white">Patients</p>
                    <p>Request & Pay Bills</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Drivers</p>
                    <p>Update Live Status</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Admins</p>
                    <p>Allocate & Bill</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
