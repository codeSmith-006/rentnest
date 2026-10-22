# RentNest — Project Setup & API Infrastructure

## 1. Prerequisites

- **Node.js**: v20+ LTS (Tested on v24.20.0)
- **Package Manager**: npm v11+
- **Backend API**: RentNest REST API running locally (e.g. `http://localhost:5000/api`) or on a deployed staging URL.

---

## 2. Environment Variables

Create `.env.local` in the project root:

```env
# Backend Base REST API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Application Public URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Publishable Key (for Stripe Checkout)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

> [!NOTE]
> `.env.example` is committed to the repository for reference. Never commit `.env.local` containing production secrets.

---

## 3. Centralized API Architecture

### Axios Client (`src/lib/api.ts`)
- **Base URL**: Configured dynamically from `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`).
- **Credentials**: `withCredentials: true` is enabled by default to send and receive secure HTTP-only cookies across domains.
- **Request Interceptor**: Automatically inspects `localStorage` for `rentnest_token` and injects `Authorization: Bearer <token>` into outgoing requests when available.
- **Response Interceptor**: Automatically unwraps responses or intercepts errors through `parseApiError`. In the event of a 401 Unauthorized status, expired tokens are safely evicted.

### Error Parsing (`src/lib/error.ts`)
Standardizes all backend responses and network anomalies into an `AppError` instance:
- Extracts backend validation error arrays (`errorSources: [{ path, message }]`) and maps them to `fieldErrors[path]`.
- Normalizes HTTP status codes into user-friendly messages (400, 401, 403, 404, 409, 422, 500+).
- Provides actionable fallback messages for timeouts (`ECONNABORTED`) or unreachable backend servers.

### Standardized Response Types (`src/types/index.ts`)
```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}

interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  meta: PaginationMeta;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  errorSources?: Array<{ path: string | number; message: string }>;
}
```

---

## 4. TanStack Query Configuration (`src/lib/query-client.ts`)

### Global Defaults
- **Stale Time**: 60 seconds (prevents redundant network waterfalls).
- **Garbage Collection (gcTime)**: 5 minutes.
- **Window Refocus**: Disabled (`refetchOnWindowFocus: false`).
- **Retries**: 1 retry for queries, 0 retries for mutations.

### Centralized Query Key Factory (`queryKeys`)
```typescript
queryKeys.properties.list(filters)   // ['properties', 'list', filters]
queryKeys.properties.detail(id)      // ['properties', 'detail', id]
queryKeys.rentals.myRentals()        // ['rentals', 'my']
queryKeys.landlord.properties()      // ['landlord', 'properties']
queryKeys.landlord.requests()        // ['landlord', 'requests']
queryKeys.admin.users(filters)       // ['admin', 'users', filters]
```

---

## 5. Available Scripts

```bash
# Start local development server with Turbopack (default port 3000)
npm run dev

# Run TypeScript checking & Next.js production build
npm run build

# Run ESLint linter
npm run lint

# Start production server
npm start
```
