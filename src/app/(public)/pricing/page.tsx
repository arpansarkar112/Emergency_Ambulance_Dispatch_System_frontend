import Link from "next/link";
import { CheckCircle2, CreditCard, ShieldCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TIERS = [
  {
    name: "Basic Life Support (BLS)",
    priority: "Low & Medium Priority",
    price: "$75 – $130",
    description: "Emergency stabilization, oxygen delivery, and inter-hospital patient transfers.",
    includes: [
      "Certified EMT-B driver & transport crew",
      "AED defibrillator & medical oxygen supply",
      "Hydraulic stretcher & spinal immobilization",
      "Real-time patient & family dispatch tracker",
      "Post-trip Stripe digital invoice",
    ],
    href: "/explore?type=BASIC",
    featured: false,
  },
  {
    name: "Mobile ICU & Cardiac Care",
    priority: "High & Critical Priority",
    price: "$180 – $300",
    description: "Hospital-grade critical care transit for acute cardiac, stroke, and trauma emergencies.",
    includes: [
      "Hamilton transport mechanical ventilator",
      "12-lead ECG defibrillator with ER telemetry",
      "4-channel smart IV syringe infusion pumps",
      "Critical care paramedic team",
      "Priority 5–8 min target response SLA",
    ],
    href: "/explore?type=ICU",
    featured: true,
  },
  {
    name: "Pediatric & Neonatal Care",
    priority: "Infant & Child Emergencies",
    price: "$160 – $240",
    description: "Gentle thermal-regulated transport built specifically for infants and children.",
    includes: [
      "Active neonatal thermal transport incubator",
      "Pediatric-calibrated cardiac & SpO2 monitoring",
      "Low-vibration hydraulic air-ride suspension",
      "Dedicated parent companion seating onboard",
      "Direct pediatric ER pre-alert coordination",
    ],
    href: "/explore?type=PEDIATRIC",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/70 bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 space-y-3 max-w-4xl">
          <Badge variant="outline" className="text-primary border-primary/30">
            Zero Upfront Emergency Billing
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Transparent Post-Trip Pricing
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Medical care always comes first. No payment method is required to summon an ambulance—
            our billing desk generates an itemized Stripe invoice only after safe hospital delivery.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={`rounded-xl flex flex-col justify-between ${
                tier.featured ? "border-primary shadow-md bg-primary/[0.03]" : "border-border bg-card shadow-xs"
              }`}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {tier.priority}
                  </span>
                  {tier.featured && <Badge>ICU Standard</Badge>}
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <p className="text-3xl font-bold text-primary pt-1">
                  {tier.price}
                  <span className="text-xs font-normal text-muted-foreground"> / completed trip</span>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{tier.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-2.5 border-t border-border/70 pt-4">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-brand-emerald mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href={tier.href} className="block">
                  <Button variant={tier.featured ? "default" : "outline"} className="w-full gap-2">
                    View Available Units
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-emerald">
              <ShieldCheck className="h-4 w-4" />
              Powered by Stripe Checkout
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Need an itemized insurance receipt or hospital contract rate?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Every completed mission displays its verified Stripe transaction status directly in
              your Patient Payments portal, or contact our billing desk for institutional agreements.
            </p>
          </div>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="gap-2 shrink-0">
              <CreditCard className="h-4 w-4" />
              Contact Billing Desk
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
