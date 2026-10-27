# RentNest API Integration & Contract Guide

This document details the complete REST API integration architecture, endpoints, environment configuration, query caching strategies, and frontend service bindings for the RentNest rental marketplace.

---

## 1. Environment Configuration

The application centralizes API connectivity through an Axios client instance in [`src/lib/api.ts`](src/lib/api.ts).

```env
# Backend Base API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Frontend Origin URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Checkout Publishable Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sample
```

---

## 2. Comprehensive Endpoint Architecture & Service Mapping

| Domain | Method | Endpoint | Frontend Service | UI Feature / View |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | `authService.register` | Account registration (`/auth/register`) |
| **Auth** | `POST` | `/api/auth/login` | `authService.login` | Account authentication (`/auth/login`) |
| **Auth** | `GET` | `/api/auth/me` | `authService.getCurrentUser` | Session revalidation (`AppProviders`, store) |
| **Auth** | `POST` | `/api/auth/logout` | `authService.logout` | User profile menu & logout handler |
| **Properties** | `GET` | `/api/properties` | `propertiesService.getAll` | Marketplace catalog (`/properties`, `/`) |
| **Properties** | `GET` | `/api/properties/:id` | `propertiesService.getById` | Property detail view (`/properties/[id]`) |
| **Properties** | `GET` | `/api/categories` | `propertiesService.getCategories` | Filter bar & category pills |
| **Reviews** | `GET` | `/api/properties/:id/reviews` | `reviewsService.getByPropertyId` | Property verified tenant reviews |
| **Reviews** | `POST` | `/api/reviews` | `reviewsService.createReview` | Review submission dialog (`ReviewFormDialog`) |
| **Rentals** | `POST` | `/api/rentals` | `rentalsService.createRequest` | Rental inquiry dialog (`RentalRequestDialog`) |
| **Rentals** | `GET` | `/api/rentals` | `rentalsService.getMyRentals` | Tenant rental applications (`/dashboard/tenant`) |
| **Rentals** | `GET` | `/api/rentals/:id` | `rentalsService.getById` | Rental detail & status tracking |
| **Rentals** | `PATCH` | `/api/rentals/:id/cancel` | `rentalsService.cancelRequest` | Tenant cancellation of pending request |
| **Payments** | `POST` | `/api/payments/create` | `paymentsService.createSession` | Real checkout session (`PaymentCheckoutDialog`) |
| **Payments** | `GET` | `/api/payments` | `paymentsService.getMyPayments` | Tenant payment history & invoices |
| **Payments** | `GET` | `/api/payments/verify/:id`| `paymentsService.verifyPayment` | Payment callback verification (`/payment/success`) |
| **Landlord** | `GET` | `/api/landlord/properties`| `landlordService.getMyProperties` | Landlord portfolio (`/dashboard/landlord`) |
| **Landlord** | `POST` | `/api/landlord/properties`| `landlordService.createProperty` | New listing form (`/dashboard/landlord/properties/new`) |
| **Landlord** | `PATCH`| `/api/landlord/properties/:id`| `landlordService.updateProperty` | Property editing & availability toggle |
| **Landlord** | `DELETE`| `/api/landlord/properties/:id`| `landlordService.deleteProperty` | Delete listing dialog |
| **Landlord** | `GET` | `/api/landlord/requests` | `landlordService.getIncomingRequests`| Landlord requests (`/dashboard/landlord/requests`) |
| **Landlord** | `PATCH`| `/api/landlord/requests/:id` | `landlordService.updateRequestStatus`| Application approve / decline actions |
| **Landlord** | `GET` | `/api/landlord/stats` | `landlordService.getStats` | Landlord KPI metrics & earnings |
| **Admin** | `GET` | `/api/admin/users` | `adminService.getUsers` | User governance table (`/dashboard/admin`) |
| **Admin** | `PATCH`| `/api/admin/users/:id` | `adminService.toggleBanUser` | Account suspension / restoration |
| **Admin** | `GET` | `/api/admin/properties` | `adminService.getAllProperties` | Catalog moderation table |
| **Admin** | `DELETE`| `/api/admin/properties/:id` | `adminService.deleteProperty` | Permanent listing delisting |
| **Admin** | `GET` | `/api/admin/stats` | `adminService.getPlatformStats` | Platform governance statistics |

---

## 3. Request Payloads & Response Envelopes

### A. Authentication
- **Register (`POST /api/auth/register`)**:
  ```json
  {
    "name": "Sarah Jenkins",
    "email": "sarah@example.com",
    "password": "Password123!",
    "role": "TENANT",
    "phone": "+1 555-0122"
  }
  ```
- **Login (`POST /api/auth/login`)**:
  ```json
  {
    "email": "sarah@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Authentication successful",
    "data": {
      "user": {
        "id": "usr-1",
        "name": "Sarah Jenkins",
        "email": "sarah@example.com",
        "role": "TENANT"
      },
      "token": "jwt_token_string"
    }
  }
  ```

### B. Rental Application Submission
- **Create Request (`POST /api/rentals`)**:
  ```json
  {
    "propertyId": "prop-101",
    "startDate": "2026-04-01",
    "endDate": "2026-10-01",
    "message": "Interested in a 6-month corporate lease."
  }
  ```

### C. Payment Session Creation
- **Initiate Session (`POST /api/payments/create`)**:
  ```json
  {
    "rentalRequestId": "rental-req-1",
    "gateway": "stripe"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "checkoutUrl": "https://checkout.stripe.com/pay/cs_live_...",
      "sessionId": "cs_live_..."
    }
  }
  ```

---

## 4. Error Handling Protocol (`src/lib/error.ts`)

API responses returning HTTP status codes `400`–`500` are normalized by `parseApiError`:
1. **Network Failure / Offline:** If the remote backend is unreachable, error message states `"Unable to connect to the RentNest service. Please check your internet connection."`
2. **Field-Level Validation:** `errorSources` are mapped to form fields via `fieldErrors`.
3. **Authentication Expiry (401):** Tokens and user sessions in `localStorage` and `document.cookie` are purged to prevent corrupt state.
4. **Resilient Fallbacks:** In development or offline demonstration mode, TanStack queries transparently fall back to fixtures in `src/lib/mock-data.ts`.

---

## 5. Centralized TanStack Query Keys (`src/lib/query-client.ts`)

All cache entries use factory query keys:
- `queryKeys.auth.currentUser()`
- `queryKeys.properties.list(filters)`
- `queryKeys.properties.detail(id)`
- `queryKeys.rentals.myRentals()`
- `queryKeys.payments.myPayments()`
- `queryKeys.reviews.byProperty(propertyId)`
- `queryKeys.landlord.properties()`
- `queryKeys.landlord.requests()`
- `queryKeys.landlord.stats()`
- `queryKeys.admin.users(filters)`
- `queryKeys.admin.properties()`
- `queryKeys.admin.stats()`
