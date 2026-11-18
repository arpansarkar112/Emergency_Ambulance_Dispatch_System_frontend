"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useRafThrottle } from "@/hooks/use-raf-throttle";
import { recordProfilerCommit, useRenderTelemetry } from "@/lib/perf-telemetry";
import {
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Layers,
  ListFilter,
  Search,
} from "lucide-react";

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchAccessor?: (row: T) => string;
  filterSlot?: React.ReactNode;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Enable TanStack Virtual row virtualization (defaults to true) */
  virtualized?: boolean;
  /** Estimated row height in pixels for TanStack Virtual */
  estimateRowHeight?: number;
  /** Overscan row count for TanStack Virtual */
  overscan?: number;
  /** Optional Profiler ID for React.Profiler telemetry */
  profilerId?: string;
}

interface MemoizedRowProps<T> {
  row: T;
  columns: ColumnDef<T>[];
}

function TableRowInner<T>({ row, columns }: MemoizedRowProps<T>) {
  return (
    <TableRow className="h-[56px]">
      {columns.map((col) => (
        <TableCell key={col.key} className={col.className}>
          {col.cell(row)}
        </TableCell>
      ))}
    </TableRow>
  );
}

const MemoizedTableRow = React.memo(TableRowInner) as typeof TableRowInner;

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading = false,
  searchable = true,
  searchPlaceholder = "Search records...",
  searchAccessor,
  filterSlot,
  pageSize = 8,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search query or filters.",
  virtualized = true,
  estimateRowHeight = 56,
  overscan = 8,
  profilerId = "DataTable",
}: DataTableProps<T>) {
  useRenderTelemetry(profilerId);
  // Decouple immediate keystroke state from debounced filtering state
  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearch = useDebounce(searchInput, 250);
  const isFiltering = searchInput !== debouncedSearch;

  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<"virtual" | "paginated">(
    virtualized ? "virtual" : "paginated"
  );
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  // Mutable refs for high-frequency scroll tracking without triggering React re-renders
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollStatsRef = React.useRef({
    lastScrollTop: 0,
    peakScrollTop: 0,
    rafFrames: 0,
  });

  const handleScrollRaf = useRafThrottle((scrollTop: number) => {
    scrollStatsRef.current.lastScrollTop = scrollTop;
    scrollStatsRef.current.rafFrames += 1;
    if (scrollTop > scrollStatsRef.current.peakScrollTop) {
      scrollStatsRef.current.peakScrollTop = scrollTop;
    }
    const shouldShow = scrollTop > 260;
    setShowScrollTop((prev) => (prev === shouldShow ? prev : shouldShow));
  });

  const handleContainerScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      handleScrollRaf(e.currentTarget.scrollTop);
    },
    [handleScrollRaf]
  );

  const scrollToTop = React.useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Precompute normalized lowercase search text index once per data change
  const searchIndex = React.useMemo(() => {
    if (!searchAccessor) return null;
    return data.map((item) => ({
      item,
      text: searchAccessor(item).toLowerCase(),
    }));
  }, [data, searchAccessor]);

  const filtered = React.useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    if (!q || !searchIndex) return data;
    const result: T[] = [];
    for (let i = 0; i < searchIndex.length; i++) {
      if (searchIndex[i].text.includes(q)) {
        result.push(searchIndex[i].item);
      }
    }
    return result;
  }, [data, debouncedSearch, searchIndex]);

  // Schwartzian transform sort: evaluate sortValue once per row O(N) instead of O(N log N)
  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const extractor = col.sortValue;
    const decorated = filtered.map((item) => ({
      item,
      val: extractor(item),
    }));
    decorated.sort((a, b) => {
      const av = a.val;
      const bv = b.val;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return decorated.map((d) => d.item);
  }, [filtered, sortKey, sortDir, columns]);

  const isVirtualActive = viewMode === "virtual";

  // TanStack Virtualizer for high-volume 1,000+ record DOM virtualization
  const rowVirtualizer = useVirtualizer({
    count: isVirtualActive ? sorted.length : 0,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  });

  const virtualItems = isVirtualActive ? rowVirtualizer.getVirtualItems() : [];
  const totalVirtualSize = isVirtualActive ? rowVirtualizer.getTotalSize() : 0;

  const paddingTop =
    isVirtualActive && virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    isVirtualActive && virtualItems.length > 0
      ? totalVirtualSize - virtualItems[virtualItems.length - 1].end
      : 0;

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = React.useMemo(() => {
    if (isVirtualActive) return [];
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage, pageSize, isVirtualActive]);

  const handleSort = React.useCallback((key: string) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const renderedCount = isVirtualActive
    ? virtualItems.length
    : paginated.length;

  return (
    <React.Profiler id={profilerId} onRender={recordProfilerCommit}>
      <div className="space-y-4">
        {(searchable || filterSlot) && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {searchable && searchAccessor ? (
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                  placeholder={searchPlaceholder}
                  className="pl-9 pr-20"
                  aria-label={searchPlaceholder}
                />
                {isFiltering && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-primary animate-pulse">
                    Debouncing...
                  </span>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex flex-wrap items-center gap-2">
              {filterSlot}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode((m) => (m === "virtual" ? "paginated" : "virtual"))
                }
                className="h-10 gap-1.5 rounded-xl text-xs"
                title="Switch between TanStack Virtual DOM scrolling and paginated pages"
              >
                <Layers className="h-3.5 w-3.5 text-primary" />
                {isVirtualActive ? "Virtual Scroll" : "Paginated"}
              </Button>
            </div>
          </div>
        )}

        {/* Virtualization & Render Telemetry Bar */}
        {!isLoading && sorted.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/30 px-3.5 py-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 bg-background/80 text-foreground border-primary/30 font-medium"
              >
                <Cpu className="h-3 w-3 text-primary" />
                {isVirtualActive
                  ? `TanStack Virtual • ${renderedCount} DOM rows mounted of ${sorted.length.toLocaleString()}`
                  : `Paginated • ${renderedCount} rows of ${sorted.length.toLocaleString()}`}
              </Badge>
              {debouncedSearch.trim() && (
                <Badge variant="secondary" className="gap-1 text-[11px]">
                  <ListFilter className="h-3 w-3" />
                  Filtered by &ldquo;{debouncedSearch.trim()}&rdquo;
                </Badge>
              )}
            </div>
            <span className="text-[11px] font-mono">
              Overscan: {overscan} rows • Est. Height: {estimateRowHeight}px
            </span>
          </div>
        )}

        <div className="relative rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div
            ref={scrollContainerRef}
            onScroll={isVirtualActive ? handleContainerScroll : undefined}
            className={
              isVirtualActive
                ? "max-h-[540px] overflow-y-auto overflow-x-auto"
                : "overflow-x-auto"
            }
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-xs shadow-2xs">
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {columns.map((col) => (
                    <TableHead key={col.key} className={col.className}>
                      {col.sortable && col.sortValue ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          {col.header}
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      ) : (
                        col.header
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="h-[56px]">
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          <Skeleton className="h-5 w-full max-w-[160px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : sorted.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-12 text-center"
                    >
                      <p className="font-medium text-foreground">{emptyTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {emptyDescription}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : isVirtualActive ? (
                  <>
                    {paddingTop > 0 && (
                      <TableRow aria-hidden="true" className="hover:bg-transparent border-0">
                        <TableCell
                          colSpan={columns.length}
                          style={{ height: `${paddingTop}px`, padding: 0 }}
                        />
                      </TableRow>
                    )}
                    {virtualItems.map((virtualRow) => {
                      const row = sorted[virtualRow.index];
                      if (!row) return null;
                      return (
                        <MemoizedTableRow
                          key={rowKey(row)}
                          row={row}
                          columns={columns}
                        />
                      );
                    })}
                    {paddingBottom > 0 && (
                      <TableRow aria-hidden="true" className="hover:bg-transparent border-0">
                        <TableCell
                          colSpan={columns.length}
                          style={{ height: `${paddingBottom}px`, padding: 0 }}
                        />
                      </TableRow>
                    )}
                  </>
                ) : (
                  paginated.map((row) => (
                    <MemoizedTableRow
                      key={rowKey(row)}
                      row={row}
                      columns={columns}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {isVirtualActive && showScrollTop && (
            <Button
              type="button"
              size="xs"
              variant="secondary"
              onClick={scrollToTop}
              className="absolute bottom-3 right-4 z-20 gap-1 shadow-md border border-border"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Top
            </Button>
          )}
        </div>

        {!isLoading && sorted.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            {isVirtualActive ? (
              <p>
                Virtual Viewport Active: rendering{" "}
                <strong className="text-foreground">{renderedCount}</strong>{" "}
                visible DOM rows out of{" "}
                <strong className="text-foreground">
                  {sorted.length.toLocaleString()}
                </strong>{" "}
                total records
              </p>
            ) : (
              <>
                <p>
                  Showing {(safePage - 1) * pageSize + 1}–
                  {Math.min(safePage * pageSize, sorted.length)} of{" "}
                  {sorted.length.toLocaleString()} records
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="px-2 font-medium text-foreground">
                    Page {safePage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </React.Profiler>
  );
}
