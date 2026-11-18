"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, RotateCcw, ChevronLeft, ChevronRight, Ambulance } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AmbulanceCard, AmbulanceCardSkeleton } from "@/components/shared/AmbulanceCard";
import { useCategories, usePublicFleet } from "@/hooks/use-fleet";
import { useDebounce } from "@/hooks/use-debounce";

function ExploreFleetContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "ALL";
  const initialCategory = searchParams.get("categoryId") || "ALL";

  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState("ALL");
  const [minRating, setMinRating] = useState("ALL");
  const [sortOption, setSortOption] = useState("rating_desc");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchInput, 350);

  const [sortBy, sortOrder] = sortOption.split("_") as [string, "asc" | "desc"];

  const { data: categories } = useCategories();
  const { data, isPending, isFetching } = usePublicFleet({
    page,
    limit: 8,
    search: debouncedSearch || undefined,
    type: typeFilter,
    categoryId,
    status: statusFilter,
    maxPrice: maxPrice !== "ALL" ? Number(maxPrice) : undefined,
    minRating: minRating !== "ALL" ? Number(minRating) : undefined,
    sortBy,
    sortOrder,
  });

  const ambulances = data?.ambulances || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    typeFilter !== "ALL" ||
    categoryId !== "ALL" ||
    statusFilter !== "ALL" ||
    maxPrice !== "ALL" ||
    minRating !== "ALL";

  const resetFilters = () => {
    setSearchInput("");
    setTypeFilter("ALL");
    setCategoryId("ALL");
    setStatusFilter("ALL");
    setMaxPrice("ALL");
    setMinRating("ALL");
    setSortOption("rating_desc");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Page Header */}
      <section className="border-b border-border/70 bg-muted/30 py-10 md:py-12">
        <div className="container mx-auto px-4 md:px-6 space-y-3">
          <Badge variant="outline" className="text-primary border-primary/30">
            Live Fleet Directory
          </Badge>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Explore Ambulance Fleet
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                Search, filter, and compare certified Mobile ICU, Basic Life Support, and Pediatric
                units with real-time availability, clinical equipment specs, and base rates.
              </p>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {isPending ? "Loading fleet..." : `${total} certified unit${total === 1 ? "" : "s"} found`}
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Controls */}
      <section className="container mx-auto px-4 md:px-6 py-8 space-y-8">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Label htmlFor="fleet-search" className="sr-only">
                Search ambulance units
              </Label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fleet-search"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by vehicle plate, unit name, station, or capability..."
                className="pl-10"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="w-full lg:w-52">
              <Label htmlFor="fleet-sort" className="sr-only">
                Sort ambulances
              </Label>
              <Select
                value={sortOption}
                onValueChange={(v) => {
                  setSortOption(v || "rating_desc");
                  setPage(1);
                }}
              >
                <SelectTrigger id="fleet-sort" className="w-full h-10 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating_desc">Highest Rated</SelectItem>
                  <SelectItem value="price_asc">Base Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Base Price: High to Low</SelectItem>
                  <SelectItem value="newest_desc">Newest Units First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Fields Row (5 Backend Filters) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-border/70">
            <div className="space-y-1">
              <Label htmlFor="filter-type" className="text-xs text-muted-foreground">
                Clinical Tier
              </Label>
              <Select
                value={typeFilter}
                onValueChange={(v) => {
                  setTypeFilter(v || "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger id="filter-type" className="w-full h-10 rounded-xl">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Tiers</SelectItem>
                  <SelectItem value="ICU">Mobile ICU</SelectItem>
                  <SelectItem value="BASIC">Basic Life Support</SelectItem>
                  <SelectItem value="PEDIATRIC">Pediatric & Neonatal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="filter-category" className="text-xs text-muted-foreground">
                Category
              </Label>
              <Select
                value={categoryId}
                onValueChange={(v) => {
                  setCategoryId(v || "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger id="filter-category" className="w-full h-10 rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {(categories || []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="filter-status" className="text-xs text-muted-foreground">
                Availability
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v || "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger id="filter-status" className="w-full h-10 rounded-xl">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="AVAILABLE">Available Now</SelectItem>
                  <SelectItem value="BUSY">On Active Dispatch</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="filter-price" className="text-xs text-muted-foreground">
                Max Base Price
              </Label>
              <Select
                value={maxPrice}
                onValueChange={(v) => {
                  setMaxPrice(v || "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger id="filter-price" className="w-full h-10 rounded-xl">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any Price</SelectItem>
                  <SelectItem value="120">Up to $120</SelectItem>
                  <SelectItem value="200">Up to $200</SelectItem>
                  <SelectItem value="260">Up to $260</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="filter-rating" className="text-xs text-muted-foreground">
                Min Rating
              </Label>
              <Select
                value={minRating}
                onValueChange={(v) => {
                  setMinRating(v || "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger id="filter-rating" className="w-full h-10 rounded-xl">
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any Rating</SelectItem>
                  <SelectItem value="4.8">4.8+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4">4.0+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                Active backend filters applied {isFetching ? "(updating...)" : ""}
              </span>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-primary">
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* 4-Card Desktop Responsive Grid */}
        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <AmbulanceCardSkeleton key={i} />
            ))}
          </div>
        ) : ambulances.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
            <Ambulance className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">
              No ambulance units match your filters
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Try widening your maximum price, clearing the search query, or checking all vehicle
              tiers.
            </p>
            <Button variant="outline" onClick={resetFilters} className="mt-2">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ambulances.map((unit) => (
              <AmbulanceCard key={unit.id} unit={unit} />
            ))}
          </div>
        )}

        {/* Backend Pagination Controls */}
        {!isPending && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/70">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{(page - 1) * 8 + 1}</span>–
              <span className="font-semibold text-foreground">{Math.min(page * 8, total)}</span> of{" "}
              <span className="font-semibold text-foreground">{total}</span> ambulance units
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const num = idx + 1;
                  return (
                    <Button
                      key={num}
                      variant={num === page ? "default" : "outline"}
                      size="icon-sm"
                      onClick={() => setPage(num)}
                      disabled={isFetching}
                    >
                      {num}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 md:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <AmbulanceCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <ExploreFleetContent />
    </Suspense>
  );
}
