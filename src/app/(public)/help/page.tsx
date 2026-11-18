"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, PhoneCall, Search, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HELP_TOPICS = [
  {
    category: "Emergency Booking",
    q: "How quickly is an ambulance allocated after I submit a request?",
    a: "Incoming PENDING requests surface immediately in the Admin Command Console with criticality badges. Critical and High priority calls are flagged at the top of the queue for immediate Mobile ICU allocation.",
  },
  {
    category: "Emergency Booking",
    q: "Can I edit my pickup address if I made a typo?",
    a: "Yes. While your emergency request is still in PENDING status, open My Bookings in your Patient Portal and click Edit to update your pickup address, destination hospital, phone number, or priority level.",
  },
  {
    category: "Billing & Stripe",
    q: "When and how do I pay for an ambulance trip?",
    a: "You never pay upfront. Once your driver marks the trip COMPLETED at the receiving hospital, an Administrator issues an itemized bill in USD. You will see a Pay Now button in your Patient Dashboard and Payments tab linking directly to Stripe Checkout.",
  },
  {
    category: "Billing & Stripe",
    q: "How do I know my payment succeeded?",
    a: "After Stripe Checkout redirects back to CallAmbulance, our system automatically verifies the session with the backend and updates your booking to Paid (SUCCESS) across Patient, Driver, and Admin views.",
  },
  {
    category: "Drivers & Fleet",
    q: "How do drivers update live trip progress?",
    a: "Assigned drivers log into /provider and step through ASSIGNED → EN_ROUTE → PICKED_UP → COMPLETED. Completing or cancelling a dispatch automatically frees the ambulance back to AVAILABLE.",
  },
  {
    category: "Accounts & Security",
    q: "How do I update my profile photo or password?",
    a: "Navigate to Profile in your dashboard sidebar. You can upload a profile avatar, update your emergency contact and blood group, and change your password using bcrypt-verified current password confirmation.",
  },
];

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const filtered = HELP_TOPICS.filter(
    (item) =>
      !query.trim() ||
      item.q.toLowerCase().includes(query.toLowerCase()) ||
      item.a.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/70 bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 space-y-4 max-w-3xl">
          <Badge variant="outline" className="text-primary border-primary/30">
            Help & Support Center
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How can we help you today?
          </h1>
          <div className="relative max-w-lg pt-1">
            <Label htmlFor="help-search" className="sr-only">
              Search help topics
            </Label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground mt-0.5" />
            <Input
              id="help-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search booking, Stripe billing, driver dispatch, passwords..."
              className="pl-10 bg-background"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <Card key={item.q} className="rounded-xl border border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="w-fit text-[11px]">
                  {item.category}
                </Badge>
                <CardTitle className="text-base pt-1.5 flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <span>{item.q}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-xl border border-primary/25 bg-primary/[0.04] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-primary" />
              Still need direct assistance?
            </h2>
            <p className="text-sm text-muted-foreground">
              Send a tracked message directly to our dispatch operations team.
            </p>
          </div>
          <Link href="/contact">
            <Button className="gap-1.5 shrink-0">
              Open Contact Form
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
