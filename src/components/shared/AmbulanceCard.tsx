"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AmbulanceItem } from "@/types";

const FALLBACK_IMAGE: Record<string, string> = {
  ICU: "/images/icu-ambulance-exterior.jpg",
  PEDIATRIC: "/images/pediatric-ambulance.jpg",
  BASIC: "/images/bls-ambulance-exterior.jpg",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-emerald-600 text-white border-transparent",
  },
  BUSY: {
    label: "On Dispatch",
    className: "bg-amber-600 text-white border-transparent",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className: "bg-slate-600 text-white border-transparent",
  },
};

export function AmbulanceCard({ unit }: { unit: AmbulanceItem }) {
  const imageSrc =
    unit.images && unit.images.length > 0 && unit.images[0]
      ? unit.images[0]
      : FALLBACK_IMAGE[unit.type] || "/images/bls-ambulance-exterior.jpg";

  const statusMeta = STATUS_BADGE[unit.status] || STATUS_BADGE.AVAILABLE;
  const title = unit.title || `${unit.type} Ambulance ${unit.vehicleNumber}`;
  const description =
    unit.description ||
    "Certified emergency medical transport unit equipped for rapid patient stabilization and hospital transit.";

  return (
    <Card className="h-full flex flex-col rounded-xl border border-border/80 bg-card shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 overflow-hidden py-0 gap-0">
      {/* Uniform 16:10 Image Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted shrink-0">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover/card:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge className="bg-background/90 text-foreground backdrop-blur-xs border-border/60 font-semibold">
            {unit.type}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
        </div>
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white/95 font-medium">
          <span className="truncate font-mono bg-black/45 px-2 py-0.5 rounded-md backdrop-blur-xs">
            {unit.vehicleNumber}
          </span>
          <span className="inline-flex items-center gap-1 bg-black/45 px-2 py-0.5 rounded-md backdrop-blur-xs shrink-0">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {Number(unit.rating || 4.8).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Uniform Body */}
      <CardContent className="flex flex-col flex-1 p-4 space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-semibold text-base leading-snug text-foreground line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {description}
          </p>
        </div>

        <div className="mt-auto pt-2 space-y-1.5 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-foreground font-semibold text-sm">
              ${Number(unit.basePrice || 120).toFixed(0)}
              <span className="text-[11px] font-normal text-muted-foreground">/ base trip</span>
            </span>
            <span className="inline-flex items-center gap-1 shrink-0">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {unit.responseTime || "6-9 mins"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-brand-emerald shrink-0" />
            <span className="truncate">{unit.currentAddress || "Central Station"}</span>
          </div>
        </div>
      </CardContent>

      {/* Uniform Footer CTA */}
      <CardFooter className="p-4 pt-0 bg-transparent border-t-0">
        <Link href={`/explore/${unit.id}`} className="w-full">
          <Button variant="outline" className="w-full justify-between group-hover/card:border-primary group-hover/card:text-primary">
            <span>View Details</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover/card:translate-x-0.5" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export function AmbulanceCardSkeleton() {
  return (
    <Card className="h-full flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden py-0 gap-0">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <CardContent className="flex flex-col flex-1 p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>
        <div className="mt-auto pt-3 space-y-2 border-t border-border/60">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 bg-transparent border-t-0">
        <Skeleton className="h-9 w-full rounded-xl" />
      </CardFooter>
    </Card>
  );
}
