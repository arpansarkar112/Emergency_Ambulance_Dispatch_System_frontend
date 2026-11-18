"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Ambulance,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  HeartPulse,
  Loader2,
  Mail,
  MapPin,
  PhoneCall,
  Radio,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AmbulanceCard, AmbulanceCardSkeleton } from "@/components/shared/AmbulanceCard";
import {
  useBlogs,
  useCategories,
  usePublicFleet,
  usePublicStats,
  useRecentReviews,
} from "@/hooks/use-fleet";
import { api } from "@/lib/axios";
import { toast } from "sonner";

const HERO_SLIDES = [
  {
    src: "/images/icu-ambulance-exterior.jpg",
    tag: "Mobile ICU — Critical & High Priority",
    title: "Hospital-Grade Intensive Care on Wheels",
    subtitle: "Equipped with Hamilton ventilators, 12-lead ECG telemetry, and critical care paramedics.",
    sla: "5–8 min ETA",
  },
  {
    src: "/images/icu-ambulance-interior.jpg",
    tag: "Live Telemetry Cabin",
    title: "Pre-Hospital Stabilization Before ER Arrival",
    subtitle: "Multi-channel infusion pumps and live hospital ER pre-alert channels onboard every ICU unit.",
    sla: "24/7 Clinical Ready",
  },
  {
    src: "/images/pediatric-ambulance.jpg",
    tag: "Pediatric & Neonatal Fleet",
    title: "Gentle Critical Transport for Infants & Children",
    subtitle: "Thermal transport incubators, low-vibration air suspension, and dedicated parent seating.",
    sla: "6–9 min ETA",
  },
  {
    src: "/images/dispatch-command.jpg",
    tag: "Digital Dispatch Command",
    title: "Zero-Friction Triage & Real-Time Allocation",
    subtitle: "Coordinators match every emergency call strictly by clinical criticality and station proximity.",
    sla: "99.9% Uptime",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Submit Emergency Request",
    description:
      "Provide pickup address, destination hospital, phone number, and clinical criticality level in under 30 seconds.",
  },
  {
    step: "02",
    title: "Criticality-Matched Triage",
    description:
      "Dispatch coordinators strictly match Critical & High calls to Mobile ICU units and Medium & Low calls to BLS units.",
  },
  {
    step: "03",
    title: "Instant Unit Allocation",
    description:
      "An available certified ambulance and assigned paramedic driver receive the dispatch immediately with live confirmation.",
  },
  {
    step: "04",
    title: "Live En-Route Milestones",
    description:
      "Follow real-time progression from ASSIGNED → EN_ROUTE → PICKED_UP → COMPLETED with one-tap driver contact.",
  },
  {
    step: "05",
    title: "Safe Hospital Handover",
    description:
      "Crew completes clinical handover at the destination ER, automatically releasing the unit back to available readiness.",
  },
  {
    step: "06",
    title: "Transparent Post-Trip Billing",
    description:
      "No upfront payment during an emergency. Receive an itemized digital invoice and settle safely via Stripe Checkout.",
  },
];

const PLATFORM_FEATURES = [
  {
    icon: HeartPulse,
    title: "Strict ICU / BLS Matching",
    description:
      "Automated criticality guardrails prevent under-equipped vehicles from being dispatched to high-acuity cardiac or trauma calls.",
  },
  {
    icon: Radio,
    title: "Live Status Synchronization",
    description:
      "Patients, drivers, and dispatch administrators view unified real-time status badges across every active mission.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Paramedic Crews",
    description:
      "Every driver and fleet unit is vetted, assigned to a home trauma station, and tracked for clinical maintenance status.",
  },
  {
    icon: CreditCard,
    title: "Zero Upfront Emergency Fee",
    description:
      "Focus on patient stabilization first. Invoices are generated only after hospital drop-off and settled via Stripe.",
  },
  {
    icon: Stethoscope,
    title: "Complete Clinical Specs",
    description:
      "Inspect onboard ventilators, defibrillators, oxygen manifolds, and verified patient reviews before scheduled transfers.",
  },
  {
    icon: Building2,
    title: "Hospital Network Pre-Alert",
    description:
      "Coordinated routing to partner trauma centers, pediatric wings, and cardiac cath-labs across the metropolitan region.",
  },
];

const PARTNER_HOSPITALS = [
  "Metro General Trauma Center",
  "St. Jude Children's Wing",
  "Heart & Vascular Institute",
  "Riverside University Hospital",
  "Northgate Urgent Care Network",
  "Westbrook Medical Plaza",
];

const FAQS = [
  {
    q: "Do I need to pay before an ambulance is dispatched?",
    a: "Never. CallAmbulance requires zero upfront payment or credit card to submit an emergency request. Itemized bills are issued by our billing desk only after safe hospital delivery, and can be paid online via Stripe.",
  },
  {
    q: "How does criticality-based ambulance matching work?",
    a: "CRITICAL and HIGH priority emergencies strictly allocate a Mobile ICU ambulance equipped with a ventilator, 12-lead cardiac defibrillator, and ICU crew. MEDIUM and LOW priority requests allocate certified Basic Life Support (BLS) units.",
  },
  {
    q: "Can I view available units and onboard medical equipment publicly?",
    a: "Yes. Our Explore Fleet catalog and individual unit detail pages are publicly accessible without signing in, displaying station location, onboard equipment lists, base rates, availability, and verified reviews.",
  },
  {
    q: "How do I track my ambulance after submitting a request?",
    a: "Once logged in as a Patient, your Dashboard updates automatically across every milestone—PENDING, ASSIGNED, EN_ROUTE, PICKED_UP, and COMPLETED—alongside your assigned vehicle plate and driver contact.",
  },
  {
    q: "Can hospitals or clinics register fleet drivers on CallAmbulance?",
    a: "Yes. Emergency medical drivers can register directly on the platform, or hospital fleet managers can reach out through our Contact Desk for multi-unit dispatch onboarding.",
  },
];

export function HomeClient() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);

  const { data: stats, isPending: statsLoading } = usePublicStats();
  const { data: fleetData, isPending: fleetLoading } = usePublicFleet({
    limit: 4,
    sortBy: "rating",
    sortOrder: "desc",
  });
  const { data: categories, isPending: categoriesLoading } = useCategories();
  const { data: reviews, isPending: reviewsLoading } = useRecentReviews(3);
  const { data: blogsData, isPending: blogsLoading } = useBlogs({ limit: 3 });

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = HERO_SLIDES[slideIndex];
  const featuredUnits = fleetData?.ambulances || [];
  const latestPosts = blogsData?.posts || [];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setNewsletterLoading(true);
    setNewsletterMessage(null);
    try {
      const res = await api.post("/newsletter", { email });
      const msg = res.data?.message || "Subscribed to CallAmbulance safety dispatches!";
      setNewsletterMessage(msg);
      toast.success(msg);
      setNewsletterEmail("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to subscribe right now.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-background text-foreground">
      {/* 1. HERO SECTION — Constrained to 60–70% Viewport Height */}
      <section className="relative w-full min-h-[60vh] lg:min-h-[66vh] flex items-center border-b border-border/70 bg-gradient-to-b from-primary/[0.04] via-background to-background py-10 lg:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Hero Copy & CTA */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                24/7 Criticality-Matched Emergency Dispatch
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] text-foreground">
                Rapid medical response,{" "}
                <span className="text-primary">when every second matters.</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                CallAmbulance connects patients, trauma coordinators, and certified Mobile ICU,
                Basic Life Support, and Pediatric ambulances in real time—with zero upfront deposit
                and live arrival telemetry.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link href="/dashboard/request">
                  <Button size="lg" className="w-full sm:w-auto gap-2 shadow-sm">
                    <Ambulance className="h-4 w-4" />
                    Request Emergency Dispatch
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                    Explore Ready Fleet
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Dynamic Backend Hero Stats Strip */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/70 max-w-lg">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {statsLoading ? "—" : stats?.availableAmbulances ?? 0}
                    <span className="text-xs font-normal text-muted-foreground">
                      /{stats?.totalAmbulances ?? 0}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">Units Ready Now</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-brand-emerald">
                    &lt; {stats?.avgResponseMinutes ?? 7.4}m
                  </p>
                  <p className="text-xs text-muted-foreground">Avg. Response ETA</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground inline-flex items-center gap-1">
                    {statsLoading ? "—" : (stats?.averageRating ?? 4.9).toFixed(1)}
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </p>
                  <p className="text-xs text-muted-foreground">Verified Fleet Rating</p>
                </div>
              </div>
            </div>

            {/* Interactive Fleet Showcase Carousel */}
            <div className="lg:col-span-6">
              <div className="relative rounded-xl overflow-hidden border border-border shadow-lg bg-card aspect-[16/10] w-full">
                <Image
                  src={currentSlide.src}
                  alt={currentSlide.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {/* Top Overlay Pill */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <Badge className="bg-primary text-primary-foreground border-transparent shadow-xs">
                    {currentSlide.tag}
                  </Badge>
                  <Badge className="bg-black/60 text-white backdrop-blur-xs border-white/15 gap-1">
                    <Clock className="h-3 w-3 text-emerald-400" />
                    {currentSlide.sla}
                  </Badge>
                </div>

                {/* Bottom Overlay Info + Slider Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="space-y-1 max-w-md">
                    <h2 className="text-base sm:text-lg font-semibold text-white leading-snug">
                      {currentSlide.title}
                    </h2>
                    <p className="text-xs text-white/80 line-clamp-2">{currentSlide.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                      }
                      aria-label="Previous fleet showcase slide"
                      className="h-8 w-8 rounded-xl bg-black/55 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-xs border border-white/15 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                      aria-label="Next fleet showcase slide"
                      className="h-8 w-8 rounded-xl bg-black/55 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-xs border border-white/15 cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => setSlideIndex(idx)}
                    aria-label={`View slide ${idx + 1}: ${s.title}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === slideIndex ? "w-7 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC NETWORK STATISTICS SECTION (Backend Live Data) */}
      <section className="w-full py-12 bg-muted/30 border-b border-border/70">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="rounded-xl border-border/80 bg-card shadow-xs">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Ambulance className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.totalAmbulances ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Certified Fleet Units</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/80 bg-card shadow-xs">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <Skeleton className="h-7 w-12" />
                    ) : (
                      stats?.availableAmbulances ?? 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Available for Dispatch</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/80 bg-card shadow-xs">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-brand-navy/10 text-brand-navy shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.totalUsers ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Registered Members & Crew</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/80 bg-card shadow-xs">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <Skeleton className="h-7 w-12" />
                    ) : (
                      stats?.completedDispatches ?? 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed Safe Transfers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. CORE LISTING / FEATURED AMBULANCE UNITS (4 Cards per Row on Desktop, Backend Data) */}
      <section className="w-full py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="text-primary border-primary/30">
                Active Medical Fleet
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Top-Rated Emergency Units Ready Now
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Every unit is clinically inspected, GPS-stationed, and matched with certified
                drivers. Inspect onboard life-support equipment before requesting dispatch.
              </p>
            </div>
            <Link href="/explore">
              <Button variant="outline" className="gap-2 shrink-0">
                Browse All Units
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fleetLoading
              ? Array.from({ length: 4 }).map((_, i) => <AmbulanceCardSkeleton key={i} />)
              : featuredUnits.map((unit) => <AmbulanceCard key={unit.id} unit={unit} />)}
          </div>
        </div>
      </section>

      {/* 4. FLEET CATEGORIES (Dynamic from Backend) */}
      <section className="w-full py-16 md:py-20 bg-muted/30 border-y border-border/70">
        <div className="container mx-auto px-4 md:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <Badge variant="outline" className="text-brand-navy border-brand-navy/30">
              Specialized Fleet Categories
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Purpose-Built Care for Every Acuity Level
            </h2>
            <p className="text-sm text-muted-foreground">
              Filter our live ambulance network by clinical category—from intensive cardiac support
              to pediatric neonatal transport.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))
              : (categories || []).slice(0, 4).map((cat) => (
                  <Link key={cat.id} href={`/explore?categoryId=${cat.id}`} className="group block">
                    <Card className="h-full flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden py-0 gap-0 hover:border-primary/40 hover:shadow-md transition-all">
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                        <Image
                          src={cat.imageUrl || "/images/bls-ambulance-exterior.jpg"}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
                          <Badge className="bg-primary/90 text-white border-transparent">
                            {cat.ambulanceType}
                          </Badge>
                          <span>{cat.unitCount ?? 0} Units</span>
                        </div>
                      </div>
                      <CardContent className="p-4 flex flex-col flex-1 space-y-2">
                        <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                          {cat.description}
                        </p>
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{cat.basePriceRange}</span>
                          <span className="text-brand-emerald font-medium">SLA: {cat.responseSla}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (6-Step End-to-End Dispatch Workflow) */}
      <section className="w-full py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="text-primary border-primary/30">
              End-to-End Dispatch Lifecycle
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How CallAmbulance Coordinates Every Mission
            </h2>
            <p className="text-sm text-muted-foreground">
              Built to remove ambiguity between an urgent medical call, paramedic arrival, and
              hospital intake.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORKFLOW_STEPS.map((item) => (
              <Card
                key={item.step}
                className="rounded-xl border border-border/80 bg-card shadow-xs hover:border-primary/30 transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                      STEP {item.step}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold pt-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PLATFORM FEATURES & CLINICAL CAPABILITIES */}
      <section className="w-full py-16 md:py-20 bg-muted/30 border-y border-border/70">
        <div className="container mx-auto px-4 md:px-6 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <Badge variant="outline" className="text-brand-emerald border-brand-emerald/30">
                Built for Clinical Reliability
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Designed for Patients, Drivers & Hospital Dispatchers
              </h2>
            </div>
            <Link href="/services">
              <Button variant="outline" className="gap-2">
                View All Clinical Services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} className="rounded-xl border border-border/80 bg-card shadow-xs">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">{feat.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. TRANSPARENT POST-TRIP PRICING PREVIEW */}
      <section className="w-full py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="text-primary border-primary/30">
              Transparent Post-Trip Billing
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Zero Upfront Payment. Clear Clinical Rates.
            </h2>
            <p className="text-sm text-muted-foreground">
              An ambulance is dispatched first—always. Itemized bills are issued only after safe
              hospital handover.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tier: "Low & Medium Priority",
                name: "Basic Life Support (BLS)",
                price: "$75 – $130",
                features: [
                  "Certified EMT-B paramedic driver",
                  "AED defibrillator & medical oxygen",
                  "Live patient dashboard status tracking",
                  "Post-trip Stripe digital receipt",
                ],
                href: "/explore?type=BASIC",
                highlighted: false,
              },
              {
                tier: "High & Critical Priority",
                name: "Mobile ICU Dispatch",
                price: "$180 – $300",
                features: [
                  "Hamilton mechanical ventilator onboard",
                  "12-lead ECG cardiac telemetry to ER",
                  "4-channel infusion pumps & trauma pack",
                  "Priority dispatch with 5–8 min target ETA",
                ],
                href: "/explore?type=ICU",
                highlighted: true,
              },
              {
                tier: "Infant & Child Care",
                name: "Pediatric & Neonatal",
                price: "$160 – $240",
                features: [
                  "Active thermal neonatal incubator",
                  "Pediatric-calibrated cardiac & SpO2 gear",
                  "Low-vibration hydraulic air-ride cabin",
                  "Dedicated companion seat for parent",
                ],
                href: "/explore?type=PEDIATRIC",
                highlighted: false,
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={`rounded-xl flex flex-col justify-between p-6 border ${
                  plan.highlighted
                    ? "border-primary bg-primary/[0.03] shadow-md"
                    : "border-border/80 bg-card shadow-xs"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {plan.tier}
                    </span>
                    {plan.highlighted && <Badge>Most Critical</Badge>}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-2xl font-bold text-primary mt-2">
                      {plan.price}{" "}
                      <span className="text-xs font-normal text-muted-foreground">/ trip</span>
                    </p>
                  </div>
                  <ul className="space-y-2.5 pt-2 border-t border-border/70">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-brand-emerald mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-6">
                  <Link href={plan.href} className="block">
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      className="w-full"
                    >
                      Inspect {plan.name.split(" ")[0]} Units
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8. VERIFIED TESTIMONIALS / PATIENT REVIEWS (Backend Live Data) */}
      <section className="w-full py-16 md:py-20 bg-muted/30 border-y border-border/70">
        <div className="container mx-auto px-4 md:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="text-brand-emerald border-brand-emerald/30">
                Verified Dispatch Feedback
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Trusted by Families & Hospital Teams
              </h2>
            </div>
            <Link href="/explore">
              <Button variant="ghost" className="gap-1.5 text-primary">
                Read Unit Reviews
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-52 rounded-xl" />
                ))
              : (reviews || []).map((rev) => {
                  const reviewerName =
                    [rev.user?.profile?.firstName, rev.user?.profile?.lastName]
                      .filter(Boolean)
                      .join(" ") ||
                    rev.user?.email?.split("@")[0] ||
                    "Verified Member";
                  return (
                    <Card
                      key={rev.id}
                      className="rounded-xl border border-border/80 bg-card shadow-xs flex flex-col justify-between"
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={`h-4 w-4 ${
                                  idx < rev.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="secondary" className="text-[11px]">
                            Verified Mission
                          </Badge>
                        </div>

                        {rev.title && (
                          <h3 className="font-semibold text-sm text-foreground">{rev.title}</h3>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                          &ldquo;{rev.comment}&rdquo;
                        </p>

                        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <p className="font-semibold text-foreground">{reviewerName}</p>
                            <p className="text-muted-foreground">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {rev.ambulance && (
                            <Link
                              href={`/explore/${rev.ambulance.id}`}
                              className="font-mono text-[11px] text-primary hover:underline"
                            >
                              {rev.ambulance.vehicleNumber}
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
          </div>
        </div>
      </section>

      {/* 9. EMERGENCY MEDICAL BLOG PREVIEW (Backend Live Data) */}
      <section className="w-full py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="text-brand-navy border-brand-navy/30">
                Clinical Briefings & Safety Guides
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Latest from Our Medical Dispatch Desk
              </h2>
            </div>
            <Link href="/blog">
              <Button variant="outline" className="gap-2">
                All Articles
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))
              : latestPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                    <Card className="h-full flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden py-0 gap-0 hover:border-primary/40 hover:shadow-md transition-all">
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-5 flex flex-col flex-1 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <Badge variant="secondary">{post.category}</Badge>
                          <span>{post.readTime}</span>
                        </div>
                        <h3 className="font-semibold text-base leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{post.authorName}</span>
                          <span className="text-primary font-medium inline-flex items-center gap-1">
                            Read guide <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* 10. HOSPITAL PARTNERS + FAQ + NEWSLETTER + FINAL CTA */}
      <section className="w-full py-16 md:py-20 bg-muted/30 border-t border-border/70">
        <div className="container mx-auto px-4 md:px-6 space-y-16">
          {/* Partner Hospitals Strip */}
          <div className="space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Receiving Hospital & Clinical Network Partners
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {PARTNER_HOSPITALS.map((partner) => (
                <div
                  key={partner}
                  className="rounded-xl border border-border/70 bg-card px-3 py-3 text-xs font-medium text-muted-foreground flex items-center justify-center text-center gap-1.5"
                >
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{partner}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive FAQ + Newsletter Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* FAQ Accordion */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Clear answers about emergency booking, triage rules, and Stripe post-trip billing.
                </p>
              </div>
              <div className="space-y-2.5">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={faq.q}
                      className="rounded-xl border border-border/80 bg-card overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                            isOpen ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Newsletter & Emergency CTA Panel */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    Emergency Preparedness Briefings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Receive quarterly family safety checklists, regional trauma hub updates, and
                    fleet readiness alerts from our medical officers.
                  </p>
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3" noValidate>
                    <div className="space-y-1.5">
                      <Label htmlFor="newsletter-email">Email Address</Label>
                      <Input
                        id="newsletter-email"
                        type="email"
                        placeholder="you@example.com"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={newsletterLoading}>
                      {newsletterLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        "Subscribe to Safety Updates"
                      )}
                    </Button>
                  </form>
                  {newsletterMessage && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {newsletterMessage}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-primary/30 bg-primary text-primary-foreground shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/85">
                    <PhoneCall className="h-4 w-4" />
                    24/7 Dispatch Access
                  </div>
                  <h3 className="text-xl font-bold leading-snug">
                    Ready to set up your emergency profile before you need it?
                  </h3>
                  <p className="text-sm text-primary-foreground/85 leading-relaxed">
                    Save your pickup address, blood group, and emergency contact once so you can
                    summon an ambulance in seconds.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <Link href="/register">
                      <Button variant="secondary" className="font-semibold">
                        Create Free Account
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        variant="outline"
                        className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                      >
                        Contact Command Desk
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
