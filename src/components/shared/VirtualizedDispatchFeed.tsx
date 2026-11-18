"use client";

import * as React from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useRafThrottle } from "@/hooks/use-raf-throttle";
import { recordProfilerCommit, useRenderTelemetry } from "@/lib/perf-telemetry";
import { Cpu, MapPin, Phone, Search, Truck } from "lucide-react";
import type { DispatchRequestItem } from "@/types";

interface VirtualizedDispatchFeedProps {
  items: DispatchRequestItem[];
  height?: number;
  estimateItemHeight?: number;
  overscan?: number;
  actionHref?: string;
  emptyMessage?: string;
  profilerId?: string;
  variant?: "compact" | "detailed";
}

interface FeedRowCardProps {
  req: DispatchRequestItem;
  actionHref: string;
  variant: "compact" | "detailed";
}

const FeedRowCard = React.memo(function FeedRowCard({
  req,
  actionHref,
  variant,
}: FeedRowCardProps) {
  const p =
    req.payment || (Array.isArray(req.payments) ? req.payments[0] : null);
  const amount = Number(p?.amount || req.amount || 0);
  const isPaid = p?.status === "SUCCESS" || req.paymentStatus === "SUCCESS";
  const amb = req.ambulance || req.dispatch?.ambulance;

  if (variant === "detailed") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-4 text-sm shadow-2xs">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-semibold text-xs text-foreground">
              Dispatch #{req.id?.slice(0, 8).toUpperCase()}
            </span>
            <Badge
              variant={
                req.priority === "CRITICAL" || req.priority === "HIGH"
                  ? "destructive"
                  : "secondary"
              }
            >
              {req.priority || "MEDIUM"}
            </Badge>
            <Badge variant="outline">{req.status}</Badge>
            {amb && (
              <Badge variant="outline" className="gap-1 text-[11px]">
                <Truck className="h-3 w-3" />
                {amb.vehicleNumber} ({amb.type})
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">
              {req.pickupAddress} → {req.destinationAddress}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isPaid ? (
            <Badge className="bg-emerald-600 text-white border-transparent">
              Paid: ${amount.toFixed(2)}
            </Badge>
          ) : amount > 0 ? (
            <Badge variant="secondary">Billed: ${amount.toFixed(2)}</Badge>
          ) : (
            <Badge variant="outline">Completed</Badge>
          )}
          {req.patientPhone && (
            <a href={`tel:${req.patientPhone}`}>
              <Button variant="outline" size="xs" className="gap-1">
                <Phone className="h-3 w-3 text-primary" />
                Call
              </Button>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/25 p-3 text-sm">
      <div className="space-y-0.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground font-mono text-xs">
            #{req.id?.slice(0, 8).toUpperCase()}
          </span>
          <Badge
            variant={
              req.priority === "CRITICAL" || req.priority === "HIGH"
                ? "destructive"
                : "secondary"
            }
          >
            {req.priority}
          </Badge>
          <Badge variant="outline">{req.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {req.pickupAddress} → {req.destinationAddress}
        </p>
      </div>
      <Link href={actionHref} className="shrink-0">
        <Button variant="outline" size="xs">
          {req.status === "PENDING" ? "Allocate Unit" : "Inspect"}
        </Button>
      </Link>
    </div>
  );
});

export const VirtualizedDispatchFeed = React.memo(
  function VirtualizedDispatchFeed({
    items,
    height = 250,
    estimateItemHeight = 76,
    overscan = 6,
    actionHref = "/admin/requests",
    emptyMessage = "No emergency requests logged yet.",
    profilerId = "VirtualizedDispatchFeed",
    variant = "compact",
  }: VirtualizedDispatchFeedProps) {
    useRenderTelemetry(profilerId);
    const [searchQuery, setSearchQuery] = React.useState("");
    const debouncedQuery = useDebounce(searchQuery, 250);

    const parentRef = React.useRef<HTMLDivElement | null>(null);
    const scrollOffsetRef = React.useRef(0);

    const handleScroll = useRafThrottle((scrollTop: number) => {
      scrollOffsetRef.current = scrollTop;
    });

    const filteredItems = React.useMemo(() => {
      const q = debouncedQuery.toLowerCase().trim();
      if (!q) return items;
      return items.filter(
        (r) =>
          r.id?.toLowerCase().includes(q) ||
          r.pickupAddress?.toLowerCase().includes(q) ||
          r.destinationAddress?.toLowerCase().includes(q) ||
          r.priority?.toLowerCase().includes(q) ||
          r.status?.toLowerCase().includes(q) ||
          r.ambulance?.vehicleNumber?.toLowerCase().includes(q)
      );
    }, [items, debouncedQuery]);

    const virtualizer = useVirtualizer({
      count: filteredItems.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => estimateItemHeight,
      overscan,
    });

    const virtualRows = virtualizer.getVirtualItems();

    return (
      <React.Profiler id={profilerId} onRender={recordProfilerCommit}>
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick filter dispatches (debounced)..."
                className="h-8 pl-8 text-xs"
                aria-label="Filter virtualized dispatch feed"
              />
            </div>
            <Badge
              variant="outline"
              className="w-fit gap-1 text-[11px] bg-background/80 border-primary/30"
            >
              <Cpu className="h-3 w-3 text-primary" />
              Virtual List: {virtualRows.length} mounted /{" "}
              {filteredItems.length.toLocaleString()} records
            </Badge>
          </div>

          {filteredItems.length === 0 ? (
            <div
              style={{ height: `${height}px` }}
              className="flex items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground"
            >
              {emptyMessage}
            </div>
          ) : (
            <div
              ref={parentRef}
              onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}
              style={{ height: `${height}px` }}
              className="overflow-y-auto pr-1 rounded-xl"
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualRows.map((virtualRow) => {
                  const req = filteredItems[virtualRow.index];
                  if (!req) return null;
                  return (
                    <div
                      key={req.id}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="pb-2.5"
                    >
                      <FeedRowCard
                        req={req}
                        actionHref={actionHref}
                        variant={variant}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </React.Profiler>
    );
  }
);
