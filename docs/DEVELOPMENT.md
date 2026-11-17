# Development Roadmap & Task List — WB-Store

> Tracks bugs to fix, features to build, and improvements to make. Update this file as work progresses.

---

## 🔴 Critical Bugs (Fix Before Any Production Use)

### BUG-001 — Payment double-settlement
**File:** `store/src/main/java/com/wholesale/store/payments/service/impl/PaymentServiceImpl.java`
**Line:** ~60

```java
// BUG: This fetches the same list twice and appends it to itself
List<Invoice> pendingInvoices = invoiceRepository.findPendingInvoices(customer.getId());
pendingInvoices.addAll(invoiceRepository.findPendingInvoices(customer.getId())); // ← REMOVE THIS LINE
```

**Fix:** Remove the second `findPendingInvoices` call. The variable is already populated on the line above.

---

### BUG-002 — Hardcoded JWT secret key
**File:** `store/src/main/resources/application.yaml`

```yaml
# BAD — secret is committed to source control
application.security.jwt.secret-key: ATPUGTIMA1234567890ATPUGTIMA1234567890ATPUGTIMA
```

**Fix:**
1. Remove the value from `application.yaml`
2. Add to environment: `APPLICATION_SECURITY_JWT_SECRET_KEY=<256-bit-random-hex>`
3. Update `application.yaml` to: `secret-key: ${APPLICATION_SECURITY_JWT_SECRET_KEY}`

---

### BUG-003 — All frontend routes are unguarded
**File:** `wholesale-billing-ui/src/routes/AppRoutes.jsx`

`ProtectedRoute.jsx` exists but is never used. Any user can access `/dashboard`, `/customers`, etc. without being logged in.

**Fix:** Wrap authenticated routes with `<ProtectedRoute>`:
```jsx
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

---

### BUG-004 — Dead navigation links in Sidebar
**File:** `wholesale-billing-ui/src/components/Sidebar.jsx`

The Sidebar links to `/invoices`, `/payments`, `/users` — none of which are registered in `AppRoutes.jsx`.

**Fix:** Register the routes in `AppRoutes.jsx` as page stubs are built out (see features below).

---

### BUG-005 — Duplicate Axios request interceptor
**File:** `wholesale-billing-ui/src/api/axiosConfig.js`

Two identical `api.interceptors.request.use(...)` blocks are registered, causing the Authorization header to be attempted twice.

**Fix:** Remove the first (simpler) interceptor block; keep the second one which also excludes `/auth/login`.

---

### BUG-006 — No 401 response interceptor (token expiry)
**File:** `wholesale-billing-ui/src/api/axiosConfig.js`

When the JWT token expires (30 min default), API calls return 401 but the UI does nothing — no redirect to login.

**Fix:**
```js
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

---

### BUG-007 — CustomerSummary field mismatch
**File:** `wholesale-billing-ui/src/pages/customers/CustomerSummary.jsx`

The component reads `c.name`, `c.email`, `c.city`, `c.state`, `c.gstNumber` from the API response.
But `CustomerSummaryResponse` from the backend only contains: `shopName`, `creditLimit`, `currentDue`, `totalInvoiceAmount`, `totalPaidAmount`, `totalInvoices`.

**Fix:** Update the component to use the correct field names, and either expand `CustomerSummaryResponse` to include full customer details, or make a separate `getCustomerById()` call.

---

## 🟡 Medium Priority Improvements

### IMPROVE-001 — CORS: Add missing methods
**File:** `store/src/main/java/com/wholesale/store/common/security/SecurityConfig.java`

`allowedMethods` is `["GET", "POST", "PUT", "HEAD"]` — `DELETE` and `PATCH` are missing.
The `/customers/{id}/status` and `/users/{id}/status` endpoints use `PATCH` and will be blocked by CORS from the browser.

**Fix:**
```java
corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"));
```

---

### IMPROVE-002 — Externalize frontend API base URL
**File:** `wholesale-billing-ui/src/api/axiosConfig.js`

```js
baseURL: 'http://localhost:8080/api/v1'  // ← hardcoded
```

**Fix:** Create `.env.local` with `VITE_API_URL=http://localhost:8080/api/v1` and update:
```js
baseURL: import.meta.env.VITE_API_URL
```

---

### IMPROVE-003 — Session policy in SecurityConfig
**File:** `store/src/main/java/com/wholesale/store/common/security/SecurityConfig.java`

The `SessionCreationPolicy.STATELESS` block is commented out. Verify sessions are not being created (they shouldn't be for a JWT API).

---

### IMPROVE-004 — Remove debug console.log from Sidebar
**File:** `wholesale-billing-ui/src/components/Sidebar.jsx` line ~32
```js
console.log("User from Sidebar", user)  // ← remove
```

---

### IMPROVE-005 — CORS wildcard origin
**File:** `SecurityConfig.java`

`"*"` and `"http://localhost:5173"` are both listed in `allowedOrigins`. Remove `"*"` and list only trusted origins explicitly.

---

## 🔲 Features to Build

### FEAT-001 — Invoice List Page
**Frontend:** `src/pages/invoices/InvoiceList.jsx`
**Backend:** `GET /api/v1/invoices` (paginated, filterable by customer/status/date)

Columns: Invoice No, Customer, Date, Final Amount, Paid, Due, Payment Status, Actions

---

### FEAT-002 — Create Invoice Page
**Frontend:** `src/pages/invoices/CreateInvoice.jsx` (currently empty)
**Backend:** `POST /api/v1/invoices` (exists)

Form requirements:
- Customer selector (search/autocomplete)
- Dynamic line-item rows (add/remove): itemName, brand, color, size, qty, rate, HSN code
- GST % selector
- Discount field
- Upfront payment amount
- Notes
- Live calculation preview: subtotal, GST, discount, final, due

---

### FEAT-003 — Invoice Detail / Print Page
**Frontend:** `src/pages/invoices/InvoiceDetail.jsx`
**Backend:** `GET /api/v1/invoices/{id}` (not yet built)

Should render a printable/PDF-exportable invoice with company header, line items table, totals breakdown.

---

### FEAT-004 — Payment List Page
**Frontend:** `src/pages/payments/PaymentList.jsx`
**Backend:** `GET /api/v1/payments` (not yet built)

Columns: Receipt No, Customer, Date, Amount, Payment Mode, Reference, Actions

---

### FEAT-005 — Create Payment Page
**Frontend:** `src/pages/payments/CreatePayment.jsx` (currently empty)
**Backend:** `POST /api/v1/payments` (exists)

Form requirements:
- Customer selector (search/autocomplete)
- Amount field (show current due alongside)
- Payment mode selector: CASH / UPI / BANK_TRANSFER / CHEQUE / OTHER
- Reference number (conditional — required for UPI/BANK/CHEQUE)
- Notes
- Preview: amount being settled, remaining due after payment

---

### FEAT-006 — User Management Pages
**Frontend:** `src/pages/users/UserList.jsx`, `UserCreate.jsx`, `UserEdit.jsx` (all empty)
**Backend:** All user endpoints exist

Requires: role-based rendering — BILLING_STAFF should not see this section.

---

### FEAT-007 — Reports Module
**Backend:** `store/.../reports/` package (empty stub)

Suggested reports:
- Daily/weekly/monthly sales summary
- Outstanding dues list (customers with balance > 0)
- Customer-wise invoice history
- Payment mode breakdown

---

### FEAT-008 — Invoice GET endpoints
**Backend:** Add to `InvoiceController`:
```
GET /api/v1/invoices          → Page<InvoiceResponse>
GET /api/v1/invoices/{id}     → InvoiceResponse (with full item list)
```

---

### FEAT-009 — Payment GET endpoints
**Backend:** Add to `PaymentController`:
```
GET /api/v1/payments          → Page<PaymentResponse>
GET /api/v1/payments/{id}     → PaymentResponse
```

---

### FEAT-010 — Invoice status management
**Backend:** Add endpoints to cancel/void invoices:
```
PATCH /api/v1/invoices/{id}/status   → update InvoiceStatus (COMPLETED → CANCELLED)
```
Must reverse ledger entries and customer due on cancellation.

---

### FEAT-011 — Dashboard metrics from API
**Frontend:** `src/pages/Dashboard.jsx`

Currently the "Invoices" stat card shows hardcoded `"0"`. Needs:
- Backend: summary endpoint `GET /api/v1/dashboard` returning invoice count, total revenue, total collections, total outstanding
- Frontend: fetch and display real metrics

---

### FEAT-012 — Token refresh flow
**Backend:** Implement `POST /api/v1/auth/refresh` using `refresh-expiration` (already in config)
**Frontend:** Add response interceptor to auto-refresh on 401

---

### FEAT-013 — Flyway migrations for all tables
**File:** `store/src/main/resources/db/migration/`

Currently only `V1__create_users.sql` exists. Add migration files for:
- `V2__create_customers.sql`
- `V3__create_invoices.sql`
- `V4__create_payments.sql`
- `V5__create_ledger.sql`

Currently JPA `ddl-auto: update` creates tables — this is not suitable for production. Switch to `ddl-auto: validate` and rely entirely on Flyway.

---

### FEAT-014 — Kafka integration
**Infrastructure:** `docker-compose.yml` already has Kafka + Zookeeper + Kafka-UI

Potential use cases:
- Invoice created event → trigger notification
- Payment received event → update analytics
- Audit log stream

---

## 🛡️ Security Hardening (Pre-Production Checklist)

- [ ] BUG-002: Externalize JWT secret
- [ ] BUG-003: Enable ProtectedRoute on all auth-required routes
- [ ] IMPROVE-001: Add PATCH/DELETE to CORS allowed methods
- [ ] IMPROVE-005: Remove wildcard `"*"` from CORS origins
- [ ] Add rate limiting to `/auth/login` (prevent brute force)
- [ ] Add `@NotBlank`, `@Size`, `@Pattern` validations to all DTOs (currently minimal)
- [ ] Switch JPA `ddl-auto` from `update` to `validate`
- [ ] Enable HTTPS (even on dev, use self-signed cert)
- [ ] Add `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` response headers

---

## 📋 Code Quality Tasks

- [ ] Remove `console.log` from `Sidebar.jsx` (IMPROVE-004)
- [ ] Deduplicate Axios interceptors (BUG-005)
- [ ] Add JSDoc / prop-types to shared components
- [ ] Add backend unit tests (currently only the placeholder `StoreApplicationTests.java` exists)
- [ ] Add integration tests for `CustomerServiceImpl`, `InvoiceServiceImpl`, `PaymentServiceImpl`
- [ ] Implement ledger controller + service for direct ledger API access
- [ ] Consolidate `CustomerCreditHistory` — it lives in `ledger/entity` but its repo is in `invoices/repo`
- [ ] Add `@Validated` on controller DTOs where `@Valid` is missing (InvoiceController, PaymentController)
