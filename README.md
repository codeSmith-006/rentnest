# RentNest — Modern Full-Stack Property Rental Marketplace

RentNest is an enterprise-grade apartment and residential rental marketplace web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **TanStack Query v5**. It delivers role-based experiences for Tenants, Landlords, and Platform Administrators, integrating real backend API endpoints and secure payment gateways (Stripe & SSLCommerz).

---

## 🌟 Core Features

### 1. Public Marketplace & Exploration
- **Hero & Search:** Instant keyword, neighborhood, city, and category filters with URL search params synchronization.
- **Debounced Search:** Custom `useDebounce` hook prevents API flooding during typing.
- **Dynamic Catalog:** Live property query with price sliders, category buttons, and amenity multi-selection.
- **Property Details:** High-resolution photo gallery with thumbnail selector, key specifications (Bedrooms, Bathrooms, SqFt), amenity badges, verified host card, and verified tenant review ratings.
- **Dark/Light Mode:** Full theme toggle with system preference persistence via `next-themes`.

### 2. Authentication & Protected Routes
- **Form Validation:** Strict type-safe form management via `react-hook-form` and `zod`.
- **Role Selection:** Interactive role choice (`TENANT` or `LANDLORD`) during account registration.
- **Quick-Fill Demo Credentials:** 1-click test credential population on `/auth/login`.
- **Edge Middleware Protection:** Server-side route authorization in `src/middleware.ts` guarding `/dashboard/*` and `/payment/*`, redirecting unauthenticated users and blocking unauthorized roles with a custom 403 Forbidden page.
- **Session Restoration:** Dual-layer storage synchronization (local storage + session cookies) ensuring fast hydrations and server-side route checks.

### 3. Tenant Hub & Rental Workflow
- **Rental Inquiry Modal:** Validated date range selection, lease term calculation, total cost estimation, and optional message to landlord.
- **Application Status Tracking:** Live lifecycle badge updates (`PENDING`, `APPROVED`, `ACTIVE`, `COMPLETED`, `REJECTED`, `CANCELLED`).
- **Real Payment Gateway Integration:** "Pay Rent" action triggers real backend checkout session creation (`POST /api/payments/create`) with gateway choice (Stripe / SSLCommerz) and redirects to the payment portal.
- **Payment Verification:** `/payment/success` and `/payment/cancel` pages verifying transactions with the backend and updating query caches.
- **Verified Tenant Reviews:** Eligible tenants who completed their rental stay can publish 1–5 star ratings and reviews.
- **Payment History:** Full transaction log with payment method, date, amount, and receipt reference.

### 4. Landlord Management Hub
- **Portfolio Overview:** Real-time KPI statistics (Total Listings, Active Tenancies, Pending Inquiries, Monthly Rental Volume).
- **Listing CRUD:** Add new rental listings via dedicated `/dashboard/landlord/properties/new` page or quick modal dialog (`PropertyFormDialog`), with multiple image URLs, amenities tagging, and specifications.
- **One-Click Availability Toggle:** Immediately update property status between `Available` and `Occupied / Off-Market`.
- **Delist / Delete Action:** Confirmation modal to remove listings with cache invalidation.
- **Rental Request Decisioning:** Review incoming tenant inquiries with applicant name, rental period, and proposed rent, with one-click **Approve** and **Decline** actions.

### 5. Administrator Governance Console
- **Platform Analytics:** Real-time platform KPI statistics (Registered Accounts, Active Properties, Total Leases, Gross Payment Volume).
- **User Governance:** Search users by name or email, filter by role (`TENANT`, `LANDLORD`, `ADMIN`), and suspend/unban user accounts with immediate revocation.
- **Catalog Moderation:** Audit public property listings, inspect detail pages, and permanently delist fraudulent properties.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Partial Prerendering)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict type safety)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS design system tokens
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (`@base-ui/react`), [Lucide React Icons](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching & Cache:** [TanStack Query v5](https://tanstack.com/query)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/) with centralized interceptors & error normalizer
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/) toast system

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm 9+

### 1. Clone & Install Dependencies
```bash
cd rentnest-frontend
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sample
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔑 Demo Credentials

Quick-fill credentials buttons are provided on the login page ([`/auth/login`](http://localhost:3000/auth/login)):

| Role | Email | Password | Primary Workspace |
| :--- | :--- | :--- | :--- |
| **Tenant** | `tenant@rentnest.com` | `password123` | [`/dashboard/tenant`](http://localhost:3000/dashboard/tenant) |
| **Landlord** | `landlord@rentnest.com` | `password123` | [`/dashboard/landlord`](http://localhost:3000/dashboard/landlord) |
| **Admin** | `admin@rentnest.com` | `password123` | [`/dashboard/admin`](http://localhost:3000/dashboard/admin) |

---

## 🌐 Deployment on Vercel

1. Push your repository to GitHub.
2. Import the `rentnest-frontend` directory into [Vercel](https://vercel.com).
3. Configure the environment variables:
   - `NEXT_PUBLIC_API_URL`: Your live backend API base URL (e.g. `https://api.rentnest.com/api`).
   - `NEXT_PUBLIC_APP_URL`: Your production frontend URL (e.g. `https://rentnest.vercel.app`).
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your live or test Stripe publishable key.
4. Set the Root Directory to `rentnest-frontend` if deploying from a monorepo.
5. Deploy!
