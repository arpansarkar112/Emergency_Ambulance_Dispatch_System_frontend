"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ambulance,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  ShieldCheck,
  Star,
  User as UserIcon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AmbulanceCard } from "@/components/shared/AmbulanceCard";
import { usePublicAmbulanceDetail } from "@/hooks/use-fleet";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120, "Title cannot exceed 120 characters").optional(),
  comment: z.string().min(5, "Please share at least 5 characters about your experience").max(1000),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function AmbulanceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { data: unit, isPending, isError } = usePublicAmbulanceDetail(id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, title: "", comment: "" },
  });

  const ratingValue = watch("rating");

  const reviewMutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      const res = await api.post(`/ambulances/${id}/reviews`, values);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Thank you! Your verified review has been published.");
      setReviewSubmitted(true);
      reset({ rating: 5, title: "", comment: "" });
      queryClient.invalidateQueries({ queryKey: ["public-ambulance", id] });
      queryClient.invalidateQueries({ queryKey: ["public-fleet"] });
      queryClient.invalidateQueries({ queryKey: ["recent-reviews"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to publish review");
    },
  });

  if (isPending) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-10 space-y-8">
        <Skeleton className="h-6 w-36" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton className="lg:col-span-7 aspect-[16/10] rounded-xl" />
          <Skeleton className="lg:col-span-5 h-[420px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-20 text-center space-y-4">
        <Ambulance className="h-14 w-14 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold">Ambulance unit not found</h1>
        <p className="text-sm text-muted-foreground">
          This fleet record may have been retired or removed from active dispatch.
        </p>
        <Link href="/explore">
          <Button variant="outline">Return to Explore Fleet</Button>
        </Link>
      </div>
    );
  }

  const gallery =
    unit.images && unit.images.length > 0
      ? unit.images
      : [
          unit.type === "ICU"
            ? "/images/icu-ambulance-exterior.jpg"
            : unit.type === "PEDIATRIC"
              ? "/images/pediatric-ambulance.jpg"
              : "/images/bls-ambulance-exterior.jpg",
          "/images/icu-ambulance-interior.jpg",
          "/images/paramedic-team.jpg",
        ];

  const safeIdx = Math.min(activeImage, gallery.length - 1);
  const title = unit.title || `${unit.type} Unit ${unit.vehicleNumber}`;
  const reviews = unit.reviews || [];
  const relatedUnits = unit.relatedUnits || [];
  const driverName = unit.driver
    ? [unit.driver.profile?.firstName, unit.driver.profile?.lastName].filter(Boolean).join(" ") ||
      unit.driver.email
    : "Assigned on Dispatch";

  const suggestedPriority =
    unit.type === "ICU" ? "CRITICAL" : unit.type === "PEDIATRIC" ? "HIGH" : "MEDIUM";

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Breadcrumb Bar */}
      <div className="border-b border-border/70 bg-muted/25">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4 text-sm">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Fleet Directory
          </Link>
          <span className="font-mono text-xs text-muted-foreground">{unit.vehicleNumber}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 space-y-12">
        {/* Top Two-Column Gallery + Action Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Media Section: Interactive Image Gallery / Slider */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-border bg-muted shadow-xs">
              <Image
                src={gallery[safeIdx]}
                alt={`${title} photo ${safeIdx + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImage((prev) => (prev - 1 + gallery.length) % gallery.length)
                    }
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-black/55 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-xs cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage((prev) => (prev + 1) % gallery.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-black/55 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-xs cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
                    {safeIdx + 1} / {gallery.length}
                  </div>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {gallery.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === safeIdx
                        ? "border-primary ring-2 ring-primary/25"
                        : "border-border opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="120px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action & Overview Card */}
          <Card className="lg:col-span-5 rounded-xl border border-border bg-card shadow-xs">
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{unit.type} Tier</Badge>
                {unit.category && <Badge variant="secondary">{unit.category.name}</Badge>}
                <Badge
                  className={
                    unit.status === "AVAILABLE"
                      ? "bg-emerald-600 text-white border-transparent"
                      : unit.status === "BUSY"
                        ? "bg-amber-600 text-white border-transparent"
                        : "bg-slate-600 text-white border-transparent"
                  }
                >
                  {unit.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {Number(unit.rating || 4.8).toFixed(1)}
                  </span>
                  <span>({reviews.length} verified review{reviews.length === 1 ? "" : "s"})</span>
                  <span>•</span>
                  <span className="font-mono text-xs">{unit.vehicleNumber}</span>
                </div>
              </div>

              <div className="rounded-xl bg-muted/50 p-4 flex items-baseline justify-between border border-border/70">
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Base Dispatch Rate</p>
                  <p className="text-3xl font-bold text-foreground mt-0.5">
                    ${Number(unit.basePrice || 120).toFixed(0)}
                    <span className="text-xs font-normal text-muted-foreground"> / base trip</span>
                  </p>
                </div>
                <Badge variant="outline" className="text-brand-emerald border-brand-emerald/40">
                  Pay Post-Trip
                </Badge>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Station: <strong className="text-foreground">{unit.currentAddress}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Clock className="h-4 w-4 text-brand-emerald shrink-0" />
                  <span>
                    Target Response SLA:{" "}
                    <strong className="text-foreground">{unit.responseTime || "6–9 mins"}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Users className="h-4 w-4 text-brand-navy shrink-0" />
                  <span>
                    Cabin Capacity:{" "}
                    <strong className="text-foreground">
                      1 Patient + {unit.capacity || 2} Paramedics/Attendants
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    Assigned Driver: <strong className="text-foreground">{driverName}</strong>
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <Link
                  href={
                    session?.user
                      ? `/dashboard/request?priority=${suggestedPriority}`
                      : `/login`
                  }
                  className="block"
                >
                  <Button size="lg" className="w-full gap-2">
                    <Ambulance className="h-4 w-4" />
                    {session?.user
                      ? `Request ${unit.type} Emergency Dispatch`
                      : "Sign In to Request Emergency Dispatch"}
                  </Button>
                </Link>
                <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-emerald" />
                  Zero upfront deposit required. Bills are settled after safe hospital arrival.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overview & Key Clinical Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-7 rounded-xl border border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle>Clinical Overview & Onboard Equipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {unit.description ||
                  "Certified emergency transport ambulance maintained to hospital readiness standards with continuous telemetry, sanitized patient cabin, and rapid urban deployment."}
              </p>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Onboard Medical Instrumentation
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(unit.specifications && unit.specifications.length > 0
                    ? unit.specifications
                    : [
                        "Cardiac Defibrillator & Telemetry",
                        "Medical Oxygen Supply",
                        "Hydraulic Roll-In Stretcher",
                        "Trauma & Airway Stabilization Kit",
                      ]
                  ).map((spec) => (
                    <div
                      key={spec}
                      className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/30 p-3 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-brand-emerald mt-0.5 shrink-0" />
                      <span className="text-foreground">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5 rounded-xl border border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle>Key Unit Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border/70 text-sm">
                {[
                  { label: "License / Unit ID", value: unit.vehicleNumber },
                  { label: "Clinical Tier", value: unit.type },
                  { label: "Fleet Category", value: unit.category?.name || `${unit.type} Care` },
                  { label: "Operational Status", value: unit.status },
                  { label: "Base Rate (USD)", value: `$${Number(unit.basePrice || 120).toFixed(2)}` },
                  { label: "Response SLA", value: unit.responseTime || "6–9 mins" },
                  { label: "Station Hub", value: unit.currentAddress },
                  { label: "Total Completed Missions", value: String(unit._count?.dispatches ?? 0) },
                ].map((row) => (
                  <div key={row.label} className="py-3 flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="font-medium text-foreground text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Reviews & Ratings Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Verified Patient & Clinical Reviews ({reviews.length})
              </h2>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {Number(unit.rating || 4.8).toFixed(1)} / 5.0
              </span>
            </div>

            {reviews.length === 0 ? (
              <Card className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm font-medium text-foreground">No reviews yet for this unit</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Be the first to share your experience after a dispatch or clinical transfer.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => {
                  const author =
                    [rev.user?.profile?.firstName, rev.user?.profile?.lastName]
                      .filter(Boolean)
                      .join(" ") ||
                    rev.user?.email?.split("@")[0] ||
                    "Verified User";
                  return (
                    <Card key={rev.id} className="rounded-xl border border-border/80 bg-card shadow-xs">
                      <CardContent className="p-5 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{author}</span>
                            {rev.verified && (
                              <Badge variant="secondary" className="text-[10px]">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        {rev.title && (
                          <p className="text-sm font-semibold text-foreground">{rev.title}</p>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {rev.comment}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Write a Review Form */}
          <Card className="lg:col-span-5 rounded-xl border border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg">Share Dispatch Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {!session?.user ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Sign in to publish a verified rating and review for {unit.vehicleNumber}.</p>
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Sign In to Write a Review
                    </Button>
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit((vals) => {
                    setReviewSubmitted(false);
                    reviewMutation.mutate(vals);
                  })}
                  className="space-y-4"
                  noValidate
                >
                  {reviewSubmitted && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Your review is now live and factored into this unit&apos;s rating.
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label>Overall Rating</Label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setValue("rating", star, { shouldValidate: true })}
                          aria-label={`Rate ${star} out of 5`}
                          className="p-1 cursor-pointer"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              star <= ratingValue
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/35 hover:text-amber-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">{ratingValue} / 5</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="review-title">Review Headline (Optional)</Label>
                    <Input
                      id="review-title"
                      placeholder="e.g. Fast arrival and attentive paramedics"
                      {...register("title")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="review-comment">Your Experience</Label>
                    <Textarea
                      id="review-comment"
                      placeholder="Describe response speed, crew professionalism, and cabin condition..."
                      aria-invalid={Boolean(errors.comment)}
                      {...register("comment")}
                    />
                    {errors.comment && (
                      <p className="text-xs text-destructive">{errors.comment.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={reviewMutation.isPending}>
                    {reviewMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Publishing Review...
                      </>
                    ) : (
                      "Submit Verified Review"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Related Units Section */}
        {relatedUnits.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-border/70">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Related Emergency Units
              </h2>
              <Link href="/explore" className="text-sm font-medium text-primary hover:underline">
                View Full Fleet
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedUnits.map((rel) => (
                <AmbulanceCard key={rel.id} unit={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
