# ForegX-7 React Performance & Optimization Technical Report

- **Project Name:** CallAmbulance — 24/7 Emergency Ambulance Dispatch & Medical Transport Platform
- **Framework & Stack:** Next.js 16.3.8 (App Router & Turbopack), React 19.2.8, TypeScript 5, TanStack Query v5, TanStack Virtual v3 (`@tanstack/react-virtual`), Recharts 3, Zustand 5, Tailwind CSS 4
- **Live Website URL:** `https://emergency-ambulance-dispatch-system-frontend.vercel.app` (Backend API: `https://emergency-ambulance-dispatch-system-seven.vercel.app/api/v1`)
- **GitHub Repository:** `https://github.com/arpansarkar112/Emergency_Ambulance_Dispatch_System_frontend`

---

## 1. Initial Performance Audit & Identified Bottlenecks

Before implementing optimizations, we conducted an automated baseline audit using the Next.js 16 Turbopack Bundle Analyzer (`npx next experimental-analyze --output`), React `<Profiler>` telemetry, and headless Chrome DevTools Protocol (`Performance.getMetrics` + `PerformanceObserver` for Core Web Vitals) against a 1,200-record dataset.

### 5 Core Bottlenecks Identified Before Optimization

1. **Severe Cumulative Layout Shift (`CLS = 0.2395`, failing the `≤ 0.1` target) & Main-Thread Blocking (`TBT = 462 ms`, `46,410 DOM nodes`) on `/admin` Overview:**
   - `AdminOverviewPage` (`src/app/(admin)/admin/page.tsx`) only guarded its initial loading skeleton on `analyticsPending` and rendered two `h-80` (`320px`) placeholders while omitting Row 2 (the Criticality Pie Chart and Recent Emergency Requests card).
   - When `recentRequests` resolved asynchronously, `latestCalls` rendered all returned items without height reservation or virtualization, causing a `0.2395` layout shift, `46,410` DOM nodes, `10,907` JS event listeners, and `4,883 ms` total load time.
2. **Unvirtualized Large Data Tables & Mission Lists (`DataTable.tsx`, `/admin/requests`, `/admin/ambulances`, `/admin/reports`, `/dashboard/bookings`, `/provider`):**
   - `DataTable.tsx` had no DOM virtualization (`@tanstack/react-virtual`), and `AdminRequestsPage` executed an $O(N \times M)$ nested `.filter()` inside every row's `allocation` cell (`1,200 requests × 1,200 ambulances = 1,440,000 iterations` per render).
3. **Undebounced Synchronous Table Search & Unmemoized Component Re-renders:**
   - Typing in `DataTable.tsx`'s search input updated `search` state on every keystroke (`setSearch(e.target.value)`), synchronously running `data.filter(...)` and `[...filtered].sort(...)` across 1,200+ rows on every character typed (`437 ms` total typing bloqueo, `33.62 ms/keystroke`).
   - `StatCard`, `DataTable` rows, `DriverMissionCard`, and `DashboardCharts` lacked `React.memo()`, while `columns` arrays, `searchAccessor`, and `rowKey` functions were recreated inline on every render.
4. **Lack of State Colocation & Whole-Store Zustand Subscriptions:**
   - In `AdminAmbulancesPage`, `AdminCategoriesPage`, and `PatientBookingsPage`, `useForm()` and `watch()` were called at the root page level instead of inside the modal dialog components. Every form change inside a modal re-rendered the entire parent page and its `DataTable`.
   - In `AdminPaymentsPage`, typing the invoice `amount` (`setAmount`) was stored at the top of `AdminPaymentsPage`, re-rendering the entire payments table on every digit typed.
   - `AdminSidebar`, `UserSidebar`, and `ProviderSidebar` called `useAppStore()` without atomic selectors, causing any store update to re-render all subscribed layout components.
5. **Monolithic Chart Bundle (`400.34 KB` chunk), Eager Modal/Zod Bundling (`93.29 KB` chunk), and Unnecessary `"use client"` Directives:**
   - `DashboardCharts.tsx` bundled `LineChart`, `BarChart`, and `PieChart` in a single file (`0x5578l8d4mec.js` = `400.34 KB`), forcing routes like `/provider/earnings` (which only uses `TrendLineChart`) to download all chart engines.
   - Heavy CRUD modals and `zod` schemas were eagerly imported at the top of dashboard pages rather than lazy-loaded on demand with `React.lazy()` and `<Suspense>`.
   - `src/components/ui/table.tsx`, `src/components/shared/AmbulanceCard.tsx`, `src/app/(user)/dashboard/profile/page.tsx`, `src/app/(provider)/provider/profile/page.tsx`, `src/app/(admin)/admin/settings/page.tsx`, `src/app/(user)/dashboard/settings/page.tsx`, `src/app/(provider)/provider/settings/page.tsx`, and `src/app/(public)/about/page.tsx` all carried unnecessary `"use client"` directives.

---

## 2. Rendering & Component Optimizations Implemented

1. **`React.memo()` Component Memoization:**
   - Wrapped `StatCard` (`src/components/shared/StatCard.tsx`), `MemoizedTableRow` (`src/components/shared/DataTable.tsx`), `FeedRowCard` & `VirtualizedDispatchFeed` (`src/components/shared/VirtualizedDispatchFeed.tsx`), `DriverMissionCard` (`src/app/(provider)/provider/page.tsx`), `TrendLineChart`, `CategoryBarChart`, and `BreakdownPieChart` in `React.memo()`.
2. **State Colocation & Component Decomposition:**
   - Extracted `AmbulanceFormDialog.tsx`, `InvoiceModalDialog.tsx`, `CategoryFormDialog.tsx`, and `EditBookingDialog.tsx` into dedicated modal components under `src/components/dashboard/modals/`.
   - Colocated `useForm()`, `watch()`, and `amount` input state inside those modal components so typing or selecting fields inside a dialog triggers **0 re-renders** on the parent dashboard page or `DataTable`.
3. **Algorithmic & Memoized Computation Optimization (`useMemo` & `useCallback`):**
   - **Precomputed Tier Lookup Map ($O(N \times M) \rightarrow O(1)$):** In `AdminRequestsPage`, replaced per-row `dispatchableAmbulances.filter(...)` inside the `allocation` cell with a memoized `ambulancesByTier` dictionary (`{ ICU: [...], BASIC: [...] }`).
   - **Precomputed Lowercase Search Index & Schwartzian Transform Sort:** In `DataTable.tsx`, precomputed normalized lowercase search text (`searchIndex`) via `useMemo` and implemented Schwartzian sorting so `col.sortValue(row)` (e.g., `new Date(r.createdAt).getTime()`) executes once per row ($O(N)$) instead of $O(N \log N)$ times in the sort comparator.
   - Stabilized `columns`, `rowKey`, `searchAccessor`, and mutation callbacks across all 8 dashboard tables using `useMemo()` and `useCallback()`.

---

## 3. DOM Virtualization & Large Data Handling (1,200+ Records)

We implemented **TanStack Virtual (`@tanstack/react-virtual`)** across **two distinct large-data component architectures**, handling **1,200 to 1,500 records** simultaneously:

1. **Virtualized Data Table (`src/components/shared/DataTable.tsx`):**
   - Powered by `useVirtualizer` (`estimateSize: () => 56`, `overscan: 8`) inside a sticky-header scrollable viewport (`max-h-[540px]`).
   - Uses dynamic top and bottom spacer `<TableRow>` padding rows (`paddingTop` and `paddingBottom`) so native HTML `<table>` column alignment between `<TableHeader>` and `<TableBody>` remains 100% preserved across mobile, tablet, and desktop while mounting only **17–19 DOM rows** out of **1,200–1,500 records** (**98.6% reduction in table row DOM nodes**).
   - Active on `/admin/requests` (1,200 records), `/admin/ambulances` (1,200 records), `/admin/payments` (1,200 records), `/admin/reports` (1,500 audit log records), and `/dashboard/bookings` (1,200 records).
2. **Virtualized Dispatch Card Feed (`src/components/shared/VirtualizedDispatchFeed.tsx`):**
   - Powered by `useVirtualizer` (`estimateSize: () => 74..88`, `overscan: 5..6`) with absolute-positioned `translateY` virtual items and dynamic element measurement (`ref={virtualizer.measureElement}`).
   - Active on `/admin` (`AdminOverviewPage` — 1,200-record live & historical dispatch stream mounting only **5–6 card nodes** in the DOM) and `/provider` (`ProviderTasksPage` — 1,200-record completed driver missions feed mounting only **7–8 card nodes** in the DOM).
3. **Interactive Dataset Volume Toggle (`src/components/shared/DatasetVolumeToggle.tsx`):**
   - Merges live PostgreSQL backend records at index `0..N` with deterministic representative records up to 1,200–1,500 items (`src/lib/synthetic-data.ts`), preserving 100% of live CRUD, unit allocation, and Stripe billing functionality while letting users toggle between `1,200 Records (Virtual)` and `Live DB Only`.

---

## 4. State Decoupling & Event Optimization

1. **4 Debounced Search Interactions (`useDebounce` at 250ms–350ms):**
   - **`DataTable.tsx` Search Input:** Decouples immediate keystroke state (`searchInput`) from the debounced filter query (`debouncedSearch = useDebounce(searchInput, 250)`), displaying a live `"Debouncing..."` indicator and preventing 1,200-row filtering on intermediate keystrokes.
   - **`VirtualizedDispatchFeed.tsx` Quick Filter Input:** Uses `useDebounce(searchQuery, 250)` to filter the 1,200-item virtualized dispatch stream on `/admin` and `/provider`.
   - **`HelpPage` (`src/app/(public)/help/page.tsx`):** Uses `useDebounce(query, 250)` for FAQ topic filtering.
   - **`ExplorePage` (`src/app/(public)/explore/page.tsx`):** Uses `useDebounce(searchInput, 350)` for backend query key debouncing.
2. **`useRef()` + `requestAnimationFrame()` Event Throttling (`src/hooks/use-raf-throttle.ts`):**
   - Created `useRafThrottle` using `requestAnimationFrame()` and mutable `useRef()` state (`rafIdRef`, `latestArgsRef`, `scrollStatsRef`) to throttle high-frequency virtual scroll events in `DataTable.tsx` and `VirtualizedDispatchFeed.tsx` to at most once per 16.67ms animation frame, only triggering a React state update when the boolean threshold (`scrollTop > 260`) flips.
3. **Selective Zustand Subscriptions & External Store Pattern:**
   - Refactored `src/lib/store.ts` with equality short-circuiting and atomic selector hooks (`useIsSidebarOpen`, `useToggleSidebar`, `useSetSidebarOpen`, `useSetUserRole`, `useHighVolumeMode`, `useToggleHighVolumeMode`) consumed by `AdminSidebar`, `UserSidebar`, `ProviderSidebar`, and `DatasetVolumeToggle`.
   - Built `src/lib/perf-telemetry.ts` using React's `useSyncExternalStore` to record `<React.Profiler>` render commit metrics outside the React component state tree.

---

## 5. Bundle Size & Code Splitting Comparison

### Optimizations Applied
1. **Individual Chart Module Splitting (`React.lazy()` + `<Suspense>`):**
   - Split monolithic `DashboardCharts.tsx` into `src/components/shared/charts/TrendLineChart.tsx`, `CategoryBarChart.tsx`, and `BreakdownPieChart.tsx`, lazy-loaded via `React.lazy()` with dimension-matched `<Skeleton className="h-[366px] w-full rounded-xl" />` fallbacks.
2. **Lazy-Loaded CRUD Modals & Zod Validation Forms (`React.lazy()` + `<Suspense>`):**
   - Lazy-loaded `AmbulanceFormDialog`, `InvoiceModalDialog`, `CategoryFormDialog`, and `EditBookingDialog` so `zod` (`93.29 KB`), `@hookform/resolvers`, `react-hook-form`, and `@base-ui/react` `Dialog` only load when a modal is opened.
3. **Tree-Shaking & Dependency Cleanup:**
   - Configured `experimental.optimizePackageImports` in `next.config.ts` for `@base-ui/react`, `@tanstack/react-query`, `@tanstack/react-virtual`, `lucide-react`, `recharts`, and `sonner`.
   - Removed the unused `shadcn` CLI package from `dependencies` (eliminating **213 extraneous transitive packages** from `node_modules` and removing `@import "shadcn/tailwind.css";` from `src/app/globals.css`) and moved `puppeteer` from `dependencies` to `devDependencies`.

### Before vs. After Bundle & Build Metrics

| Metric | Before Optimization | After Optimization | Delta / Improvement |
|---|---|---|---|
| **Largest Client Chunk (Recharts + D3)** | `400.34 KB` (`0x5578l8d4mec.js`) | `331.54 KB` (`00n7e9gn4peb9.js`) | **-68.80 KB (-17.2%)** |
| **UI Primitives Chunk (`@base-ui/react`)** | `66.90 KB` (`0awmi6wk4uu8u.js`) | `59.74 KB` (`1a22at9kg_hmr.js`) | **-7.16 KB (-10.7%)** |
| **Form/Zod Chunk Loading on Table Pages** | Eagerly loaded (`93.29 KB` on initial visit) | Deferred via `React.lazy()` until modal open | **-93.29 KB on initial table load** |
| **Production Build Compile Time (Turbopack)** | `23.4 s` | `4.7 s` | **-79.9% faster** |
| **TypeScript Verification Time** | `33.2 s` | `6.4 s` | **-80.7% faster** |
| **Installed `node_modules` Package Count** | `691 packages` | `478 packages` | **-213 unused packages removed** |

---

## 6. Server/Client Component Boundary Optimizations

We audited all 60 files containing `"use client"` and converted **8 components/routes** to Server Components or narrow leaf Client Component boundaries:

1. **`src/components/ui/table.tsx`:** Removed unnecessary `"use client"` directive so all HTML table primitives (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) can be rendered directly by Server Components with zero client JS overhead.
2. **`src/components/shared/AmbulanceCard.tsx`:** Removed unnecessary `"use client"` directive from `AmbulanceCard` and `AmbulanceCardSkeleton`.
3. **`src/app/(user)/dashboard/profile/page.tsx` & `src/app/(provider)/provider/profile/page.tsx`:** Converted both route entry points to Server Components passing serializable props (`heading`, `subtitle`) across the RSC boundary to `<ProfileManager />`.
4. **`src/app/(admin)/admin/settings/page.tsx`, `src/app/(user)/dashboard/settings/page.tsx`, & `src/app/(provider)/provider/settings/page.tsx`:** Converted all three dashboard Settings pages from root Client Components into **Server Components**, extracting only the interactive theme and notification buttons into leaf Client Components (`ThemeSelectorCard.tsx` and `NotificationPreferencesCard.tsx`).
5. **`src/app/(public)/about/page.tsx`:** Converted the entire 223-line About page from a Client Component (`usePublicStats()` via React Query + Axios) into an **`async` React Server Component** using server-side `fetch()` with `next: { revalidate: 60 }` (ISR). This eliminates the client-side data-fetching waterfall and ships zero page-level client JavaScript for `/about`.

---

## 7. Before vs. After Performance & Core Web Vitals Report

All measurements were recorded under identical conditions against the production server (`next start`) using headless Chrome DevTools Protocol (`Performance.getMetrics`) and `PerformanceObserver` with **1,200 dispatch requests** and **1,200 ambulance units**:

| Performance Metric | Before Optimization | After Optimization | Target / Improvement |
|---|---|---|---|
| **Largest Contentful Paint (LCP)** (`/admin`) | `808 ms` (`0.81 s`) | **`428 ms` (`0.43 s`)** | Target `≤ 2.5 s` ✅ (**-47.0% faster**) |
| **Interaction / Keystroke Latency (INP Proxy)** | `33.62 ms/key` (`437 ms` total) | **`27.31 ms/key` (`355 ms` total)** | Target `≤ 200 ms` ✅ (**-18.8% faster**) |
| **Cumulative Layout Shift (CLS)** (`/admin`) | `0.2395` ❌ | **`0.0031`** ✅ | Target `≤ 0.1` ✅ (**-98.7% reduction**) |
| **First Contentful Paint (FCP)** (`/admin`) | `100 ms` | **`68 ms`** | **-32.0% faster** |
| **Total Blocking Time (TBT)** (`/admin`) | `462 ms` (4 Long Tasks) | **`114 ms` (1 Long Task)** | **-75.3% reduction** |
| **Dashboard Page Load Time (`/admin`)** | `4,883 ms` | **`1,906 ms`** | **-61.0% faster (`2.56x` speedup)** |
| **DOM Node Count (`/admin` with 1,200 items)** | `46,410 nodes` | **`2,177 nodes`** | **-95.3% reduction (`-44,233` nodes)** |
| **Mounted Table Rows (`/admin/requests`, 1,200 items)** | Unvirtualized | **`19 DOM rows`** (17 items + 2 spacers) | **-98.6% DOM rows** |
| **JS Event Listeners (`/admin`)** | `10,907` | **`2,626`** | **-75.9% reduction** |
| **Main-Thread Layout Duration (`/admin`)** | `232.4 ms` (`199` layouts) | **`16.9 ms` (`69` layouts)** | **-92.7% reduction** |
| **Main-Thread Script Duration (`/admin`)** | `533.7 ms` | **`213.0 ms`** | **-60.1% reduction** |
| **Main-Thread Total Task Duration (`/admin`)** | `2,831.1 ms` | **`507.8 ms`** | **-82.1% reduction (`5.57x` faster)** |
| **JS Heap Memory Used (`/admin`)** | `39.13 MB` | **`21.59 MB`** | **-44.8% memory saved** |
| **JS Heap Memory Used (`/admin/requests`)** | `60.96 MB` | **`36.62 MB`** | **-39.9% memory saved** |

---

## 8. Remaining Limitations & Future Optimization Opportunities

1. **Client-Side Polling vs. Server-Sent Events (SSE) / WebSockets:**
   - Dashboard pages currently poll live telemetry endpoints every `8s–15s` via TanStack Query's `refetchInterval`. Replacing polling with WebSockets or Server-Sent Events (SSE) would reduce redundant HTTP round-trips when no dispatch status transitions have occurred.
2. **Recharts D3 Shared Core (`331.54 KB`):**
   - Although code-splitting `TrendLineChart`, `CategoryBarChart`, and `BreakdownPieChart` reduced the largest chart chunk by `68.80 KB` (`-17.2%`) and deferred loading via `React.lazy()`, `recharts` still bundles core `d3-scale`/`d3-shape` utilities on analytics views. Migrating to a lightweight SVG/Canvas chart renderer or server-rendered SVG sparklines for simple trend cards could reduce chart JS further.
3. **Server-Side Cursor Pagination for 100,000+ Records:**
   - Client-side virtualization (`@tanstack/react-virtual`) smoothly renders 1,200–10,000 records in memory with ~18 mounted DOM nodes, but datasets exceeding 100,000 rows should pair `@tanstack/react-virtual` with `useInfiniteQuery` cursor pagination from PostgreSQL.
