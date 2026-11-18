"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-fleet";

export default function ServicesPage() {
  const { data: categories, isPending } = useCategories();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/70 bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 space-y-3 max-w-4xl">
          <Badge variant="outline" className="text-primary border-primary/30">
            Clinical Transport Capabilities
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Emergency & Inter-Hospital Ambulance Services
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Every tier in our fleet is strictly matched to patient acuity—from rapid neighborhood
            Basic Life Support to ventilator-equipped Mobile ICU and Neonatal care.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 space-y-8">
        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(categories || []).map((cat) => (
              <Card
                key={cat.id}
                className="rounded-xl border border-border/80 bg-card overflow-hidden py-0 gap-0 shadow-xs flex flex-col"
              >
                <div className="relative aspect-[16/8] w-full bg-muted">
                  <Image
                    src={cat.imageUrl || "/images/icu-ambulance-exterior.jpg"}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <Badge className="bg-primary text-primary-foreground border-transparent">
                      {cat.ambulanceType} Tier
                    </Badge>
                    <span className="text-xs font-medium bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      {cat.availableCount ?? 0} of {cat.unitCount ?? 0} units available now
                    </span>
                  </div>
                </div>
                <CardContent className="p-6 flex flex-col flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-foreground">{cat.name}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/70 text-xs">
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-muted-foreground">Typical Rate Range</p>
                      <p className="font-bold text-sm text-foreground mt-0.5">
                        {cat.basePriceRange}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-muted-foreground">Target Dispatch SLA</p>
                      <p className="font-bold text-sm text-brand-emerald mt-0.5 inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {cat.responseSla}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-2 flex flex-wrap gap-2.5">
                    <Link href={`/explore?categoryId=${cat.id}`} className="flex-1">
                      <Button className="w-full gap-1.5">
                        Explore Units
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/dashboard/request">
                      <Button variant="outline">Request Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="rounded-xl border border-border bg-muted/30 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Strict Clinical Matching",
                desc: "High & Critical priority calls always dispatch an ICU-equipped vehicle.",
              },
              {
                title: "Post-Trip Digital Billing",
                desc: "No credit card required during an emergency. Settle securely via Stripe after drop-off.",
              },
              {
                title: "Verified Crew Credentials",
                desc: "All assigned drivers hold active EMT / NRP licensure and station assignments.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-brand-emerald mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
