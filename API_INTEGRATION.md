# RentNest API Integration Guide

This document details the backend REST API contract, endpoints, environment configuration, and mapped frontend services.

---

## 1. Environment Configuration

The frontend communicates with the backend via the centralized Axios client configured in [`src/lib/api.ts`](file:///d:/Programming/Programming/Next_Level_Dev/Mission_1-Be_A_TypeScript_Technocrat/ASS_5/rentnest-frontend/src/lib/api.ts).

```env
# Backend Base API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Frontend URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Publishable Key (for Stripe Checkout)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

---

## 2. Endpoint Mapping & Service Architecture

| Domain | Method | Endpoint | Service Function | Consuming Feature / Pages |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | `authService.register` | `/auth/register` |
| **Auth** | `POST` | `/api/auth/login` | `authService.login` | `/auth/login` |
| **Auth** | `GET` | `/api/auth/me` | `authService.getCurrentUser` | Auth store, Navigation, Dashboard layout |
| **Auth** | `POST` | `/api/auth/logout` | `authService.logout` | Navbar, User profile dropdown |
| **Properties** | `GET` | `/api/properties` | `propertiesService.getAll` | Home (`/`), Properties (`/properties`) |
| **Properties** | `GET` | `/api/properties/:id` | `propertiesService.getById` | Property detail (`/properties/[id]`) |
| **Properties** | `GET` | `/api/categories` | `propertiesService.getCategories` | Property filters, Search bar |
| **Rentals** | `POST` | `/api/rentals` | `rentalsService.createRequest` | Property detail modal / rental form |
| **Rentals** | `GET` | `/api/rentals` | `rentalsService.getMyRentals` | Tenant dashboard (`/dashboard/tenant`) |
| **Rentals** | `GET` | `/api/rentals/:id` | `rentalsService.getById` | Rental detail view / checkout trigger |
| **Payments** | `POST` | `/api/payments/create` | `paymentsService.createSession` | Tenant rental card ("Pay Now" button) |
| **Payments** | `GET` | `/api/payments` | `paymentsService.getMyPayments` | Tenant payment history tab |
| **Payments** | `GET` | `/api/payments/verify/:id`| `paymentsService.verifyPayment` | Payment success callback (`/payment/success`) |
| **Landlord** | `GET` | `/api/landlord/properties`| `landlordService.getMyProperties` | Landlord listings tab |
| **Landlord** | `POST` | `/api/landlord/properties`| `landlordService.createProperty` | Landlord create property form |
| **Landlord** | `PATCH`| `/api/landlord/properties/:id`| `landlordService.updateProperty` | Landlord edit property dialog |
| **Landlord** | `DELETE`| `/api/landlord/properties/:id`| `landlordService.deleteProperty` | Landlord listing delete action |
| **Landlord** | `GET` | `/api/landlord/requests` | `landlordService.getIncomingRequests`| Landlord rental requests manager |
| **Landlord** | `PATCH`| `/api/landlord/requests/:id` | `landlordService.updateRequestStatus`| Landlord approve/reject actions |
| **Landlord** | `GET` | `/api/landlord/stats` | `landlordService.getStats` | Landlord dashboard overview |
| **Admin** | `GET` | `/api/admin/users` | `adminService.getUsers` | Admin user moderation table |
| **Admin** | `PATCH`| `/api/admin/users/:id` | `adminService.toggleBanUser` | Admin user ban/unban action |
| **Admin** | `GET` | `/api/admin/stats` | `adminService.getPlatformStats` | Admin analytics & KPIs |

---

## 3. Request & Response Conventions

1. **Authentication:**
   - The Axios client includes `withCredentials: true` to support secure HTTP-only session cookies.
   - For environments utilizing Bearer tokens, the request interceptor automatically injects `Authorization: Bearer <token>` from `localStorage`.
2. **Error Handling (`src/lib/error.ts`):**
   - Standard response payload format: `{ success: boolean, message?: string, data?: any, errorSources?: [{ path, message }] }`.
   - On error, `api.ts` parses the error with `parseApiError`, generating an `AppError` instance containing normalized error messages and mapped `fieldErrors`.
   - On `401 Unauthorized`, expired tokens are safely evicted from client storage.

---

## 4. TanStack Query Caching & Query Keys Factory (`src/lib/query-client.ts`)

Centralized query keys ensure predictable cache invalidation upon mutations:

```typescript
import { queryKeys } from "@/lib/query-client";

// Fetching properties
useQuery({
  queryKey: queryKeys.properties.list(filters),
  queryFn: () => propertiesService.getAll(filters),
});

// Invalidating queries after property creation or status update
queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
queryClient.invalidateQueries({ queryKey: queryKeys.landlord.properties() });
queryClient.invalidateQueries({ queryKey: queryKeys.rentals.myRentals() });
```
