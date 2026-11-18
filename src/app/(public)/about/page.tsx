"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Ambulance,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  HeartPulse,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePublicStats } from "@/hooks/use-fleet";

const LEADERSHIP = [
  {
    name: "Dr. Elena Vance, MD",
    role: "Chief Medical Dispatch Officer",
    bio: "Board-certified emergency physician with 14 years leading urban trauma triage networks and pre-hospital telemetry protocols.",
  },
  {
    name: "Marcus Chen, NRP",
    role: "Director of Mobile ICU Operations",
    bio: "Critical care flight and ground paramedic overseeing ventilator readiness, cardiac equipment calibration, and crew certification.",
  },
  {
    name: "Sarah Jenkins, EMT-P",
    role: "Fleet Readiness & Logistics Lead",
    bio: "Specializes in urban station positioning, rapid vehicle turnaround, and pediatric neonatal ambulance safety standards.",
  },
];

export default function AboutPage() {
  const { data: stats } = usePublicStats();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="border-b border-border/70 bg-muted/30 py-14 md:py-18">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <Badge variant="outline" className="text-primary border-primary/30">
              About CallAmbulance
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Removing every second of friction between emergency calls and hospital care.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              CallAmbulance was engineered to replace fragmented phone dispatching with one
              calm, unified medical transport network—connecting patients, dispatch coordinators,
              and certified paramedic drivers in real time.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/explore">
                <Button size="lg" className="gap-2">
                  Explore Our Fleet
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Contact Command Desk
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-border shadow-md">
              <Image
                src="/images/dispatch-command.jpg"
                alt="CallAmbulance 24/7 digital dispatch command center"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Live Network Numbers */}
      <section className="py-12 border-b border-border/70">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Certified Ambulances", value: stats?.totalAmbulances ?? 8 },
            { label: "Units Ready Now", value: stats?.availableAmbulances ?? 6 },
            { label: "Target Response SLA", value: "< 8 mins" },
            { label: "Completed Missions", value: stats?.completedDispatches ?? 0 },
          ].map((item) => (
            <Card key={item.label} className="rounded-xl border-border/80 bg-card shadow-xs">
              <CardContent className="p-6 text-center space-y-1">
                <p className="text-3xl font-bold text-primary">{item.value}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Clinical Standards */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-border shadow-sm">
              <Image
                src="/images/paramedic-team.jpg"
                alt="Certified CallAmbulance paramedic crew"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Clinical Integrity at Every Mile
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every ambulance in our directory undergoes daily biometric and life-support readiness
              checks. Our dispatch engine enforces strict clinical compatibility so high-acuity
              patients never receive an under-equipped vehicle.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: HeartPulse,
                  title: "Strict Criticality Matching",
                  text: "Critical and High emergencies strictly pair with ventilator-equipped Mobile ICU units.",
                },
                {
                  icon: Radio,
                  title: "Real-Time Telemetry",
                  text: "Every status transition is logged with immutable timestamps and shared across roles.",
                },
                {
                  icon: ShieldCheck,
                  title: "Zero Upfront Financial Barrier",
                  text: "Care begins immediately; Stripe digital invoices are issued only after safe hospital drop-off.",
                },
                {
                  icon: Clock,
                  title: "24/7 Urban Station Coverage",
                  text: "Distributed hubs across trauma corridors keep median dispatch arrival under 8 minutes.",
                },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                    <div className="inline-flex p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{p.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Leadership */}
      <section className="py-16 md:py-20 bg-muted/30 border-t border-border/70">
        <div className="container mx-auto px-4 md:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <Badge variant="outline" className="text-brand-emerald border-brand-emerald/30">
              Medical Advisory & Operations
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Led by Frontline Emergency Specialists
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LEADERSHIP.map((member) => (
              <Card key={member.name} className="rounded-xl border-border/80 bg-card shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">{member.name}</h3>
                    <p className="text-xs font-medium text-primary">{member.role}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs text-brand-emerald font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Certified Clinical Oversight
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Ambulance className="h-5 w-5 text-primary" />
                Partner Your Hospital or Ambulance Fleet with CallAmbulance
              </h3>
              <p className="text-sm text-muted-foreground">
                Onboard drivers, manage ICU & BLS readiness, and automate patient billing from one
                unified admin console.
              </p>
            </div>
            <Link href="/contact">
              <Button size="lg">Get in Touch</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
