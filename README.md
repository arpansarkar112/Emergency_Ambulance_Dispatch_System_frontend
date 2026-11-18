# CallAmbulance — Emergency Ambulance Dispatch & Medical Transport Platform

**Rapid medical response, when every second matters.**

CallAmbulance is a full-stack, role-based **Emergency Ambulance Dispatch & Medical Transport Platform** built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui (Base UI)**, **TanStack Query v5**, **Recharts**, **NextAuth.js**, **Express.js**, **Prisma ORM (PostgreSQL)**, and **Stripe Checkout**.

---

## Live Links & Repositories

- **Live Frontend URL:** [https://emergency-ambulance-dispatch-system-iota.vercel.app](https://emergency-ambulance-dispatch-system-iota.vercel.app)
- **Live Backend API URL:** [https://emergency-ambulance-dispatch-system-seven.vercel.app/api/v1](https://emergency-ambulance-dispatch-system-seven.vercel.app/api/v1)
- **Frontend Repository:** [https://github.com/arpansarkar112/Emergency_Ambulance_Dispatch_System_frontend](https://github.com/arpansarkar112/Emergency_Ambulance_Dispatch_System_frontend)
- **Backend Repository:** [https://github.com/arpansarkar112/Emergency_Ambulance_Dispatch_System](https://github.com/arpansarkar112/Emergency_Ambulance_Dispatch_System)

---

## Demo Credentials & One-Click Auto-Fill Login

Visit `/login` to use the **Instant Demo Login (Auto-Fill)** buttons across all three roles or sign in manually:

| Role | Email | Password | Dashboard Route |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ambulance.com` | `admin123` | `/admin` |
| **User (Patient)** | `arpansarkar112@gmail.com` | `password123` | `/dashboard` |
| **Provider (Driver)** | `driver@ambulance.com` | `password123` | `/provider` |

---

## Core Platform Capabilities

### Public Experience & Design System
- **3-Color Medical Design System + Dark/Light Mode:** Emergency Crimson, Clinical Navy, and Life-Support Emerald paired with high-contrast neutral palettes, unified `rounded-xl` radii, and instant Light/Dark/System theme toggle (`next-themes`).
- **Landing Page (`/`):** 60–70vh Hero with interactive fleet showcase carousel and dynamic backend statistics, live network metrics, 4-column featured ambulance cards, fleet categories, 6-step dispatch workflow, clinical features, transparent pricing tiers, verified patient reviews, medical blog preview, partner hospitals, interactive FAQ accordion, and database-backed newsletter subscription.
- **Explore Fleet (`/explore`):** Debounced backend search, 5 backend filter fields (clinical tier, category, availability status, max price, min rating), sorting options, 4-column responsive desktop card grid with skeleton loaders, and backend pagination.
- **Public Unit Details (`/explore/[id]`):** Multi-image interactive gallery slider, clinical overview, onboard medical instrumentation specs, verified reviews with live rating submission, and related units.
- **Additional Pages:** About (`/about`), Contact with database-persisted inquiry form (`/contact`), Emergency Medical Blog (`/blog` & `/blog/[slug]`), Clinical Services (`/services`), Pricing (`/pricing`), Help Center (`/help`), Privacy Policy (`/privacy`), and Terms (`/terms`).

### Role-Based Dashboards (with Recharts Analytics & Data Tables)
- **Admin Command Console (`/admin` — 8 routes):**
  - Overview with dynamic KPI cards + Line, Bar, and Pie charts (`Recharts`)
  - Emergency Requests queue with criticality-matched ICU/BLS allocation & view/cancel actions
  - Manage Fleet CRUD table (Create/Edit/View/Delete ambulances with full specs & image galleries)
  - Manage Users table (role assignment, profile viewer, account disable/restore)
  - Manage Categories CRUD table
  - Payments & Billing invoice generator
  - Reports & Inbox (Contact form messages, Dispatch Audit Trail, Newsletter subscribers)
  - Admin Profile & Settings (avatar upload, password change, appearance theme)
- **Patient Portal (`/dashboard` — 6 routes):**
  - Overview with KPI cards + Line, Bar, and Pie charts
  - My Bookings sortable/filterable/paginated table (View, Edit pending, Cancel, Pay via Stripe)
  - Emergency Request creation form
  - Payments & Stripe Checkout history
  - Profile (avatar upload, blood group, emergency contact, password change) & Settings
- **Driver Console (`/provider` — 5 routes):**
  - Active Dispatches with live status progression (`ASSIGNED` → `EN_ROUTE` → `PICKED_UP` → `COMPLETED`)
  - Assigned Vehicles readiness toggle (`AVAILABLE` / `BUSY` / `MAINTENANCE`)
  - Earnings & Trip Analytics with trend chart & table
  - Profile & Night-Shift Settings

---

## Running Locally

### 1. Frontend
```bash
npm install
npm run dev
```
Configure `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://emergency-ambulance-dispatch-system-seven.vercel.app/api/v1
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Backend (`../Emergency_Ambulance_Dispatch_System`)
```bash
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
