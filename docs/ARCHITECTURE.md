# Architecture — WB-Store Backend

> Deep-dive into the Spring Boot backend: domain model, data flow, security, and design decisions.

---

## Table of Contents
- [Domain Model](#domain-model)
- [Package Structure](#package-structure)
- [Data Model (ER)](#data-model-er)
- [Security & Authentication](#security--authentication)
- [Business Logic Flows](#business-logic-flows)
- [Common Infrastructure](#common-infrastructure)
- [Known Issues & Tech Debt](#known-issues--tech-debt)

---

## Domain Model

The backend is organised into **feature modules** (domain packages), each self-contained with its own controller, service, repository, DTOs, mapper, entities, and enums.

```
com.wholesale.store
├── auth          → JWT login only; no register endpoint yet
├── common        → Cross-cutting: security, config, exceptions, base entities
├── customers     → Customer CRUD, search, summary, account statement
├── invoices      → Invoice creation; GST calculation; auto-ledger write
├── payments      → Payment receipt; auto-settlement across open invoices; ledger write
├── ledger        → LedgerEntry (double-entry per customer); CustomerCreditHistory
├── reports       → (Stub package — empty)
└── users         → User + Role management (ADMIN / MANAGER / BILLING_STAFF)
```

---

## Package Structure

Each domain follows a consistent layered structure:

```
<domain>/
├── controller/     REST controller (@RestController)
├── service/        Interface + impl/
├── repo/           Spring Data JPA repositories
├── entity/         JPA entities
├── dto/            Request and Response records/classes
├── mapper/         MapStruct mappers (entity ↔ DTO)
├── enums/          Domain enums
└── validator/      (invoices only — custom validators)
```

---

## Data Model (ER)

```
users ──────────────── user_roles ──── roles
  │                                      │
  │  (createdBy / updatedBy audit FK)    │  name: ADMIN | MANAGER | BILLING_STAFF
  │
customers
  │  shopName, ownerName, phone, gstin
  │  creditLimit, currentDue
  │  status: ACTIVE | INACTIVE
  │
  ├──── invoices ───────────── invoice_items
  │      invoiceNo (auto-generated)      itemName, brand, color, size
  │      subtotal, gstAmount             itemCode, hsnCode
  │      discountAmount, finalAmount     quantity, unit, rate, amount
  │      paidAmount, dueAmount
  │      paymentStatus: PAID|PARTIAL|UNPAID
  │      invoiceStatus: COMPLETED|CANCELLED
  │
  ├──── payments
  │      receiptNo (auto-generated)
  │      amount, paymentMode: CASH|UPI|BANK_TRANSFER|CHEQUE|OTHER
  │      referenceNumber, paymentDate
  │
  ├──── ledger_entries
  │      entryType: INVOICE | PAYMENT
  │      debit, credit, runningBalance
  │      referenceNo, entryDate
  │
  └──── customer_credit_history
         transactionType: INVOICE | PAYMENT
         referenceNo, amount, remarks, createdAt
```

### Base Entities

| Entity | Fields |
|---|---|
| `BaseEntity` | `id` (Integer, auto), `createdAt`, `updatedAt` |
| `BaseAuditEntity` extends `BaseEntity` | + `createdBy` (user ID), `updatedBy` (user ID) |

Audit fields are populated automatically via `AuditorAwareImpl` using the authenticated user ID from the security context.

---

## Security & Authentication

### Flow

```
POST /api/v1/auth/login
  → AuthController → AuthServiceImpl
    → load user by username
    → verify BCrypt password
    → JwtService.generateToken()
    → return { accessToken, tokenType, expiresIn, user{...} }

Subsequent requests:
  → JwtAuthenticationFilter (OncePerRequestFilter)
    → extract Bearer token from Authorization header
    → JwtService.validateToken()
    → load CustomUserDetails
    → set SecurityContextHolder
    → chain proceeds to controller
```

### Key Security Components

| Class | Purpose |
|---|---|
| `SecurityConfig` | Filter chain, CORS, CSRF, permit-list |
| `JwtAuthenticationFilter` | Token extraction + validation on every request |
| `JwtService` | Generate / validate / extract claims from JWT |
| `CustomUserDetails` | Spring `UserDetails` adapter wrapping `User` entity |
| `CustomUserDetailsService` | Loads `UserDetails` from DB by username |
| `JwtAuthenticationEntryPoint` | Returns 401 JSON on unauthenticated access |
| `JwtAccessDeniedHandler` | Returns 403 JSON on insufficient role |

### CORS Configuration

Currently allows `*` and `http://localhost:5173`. Methods: GET, POST, PUT, HEAD.

> ⚠️ NOTE: `allowedOrigins` contains `"*"` alongside a specific origin. `allowCredentials` is `false`. Tighten this for production — replace `"*"` with explicit allowed origins.

### Role Enforcement (Method-Level)

```java
@PreAuthorize("hasRole('ADMIN')")             // UserController.create
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')") // CustomerController.create/update
// No annotation = any authenticated user can call (invoices, payments, reads)
```

---

## Business Logic Flows

### Invoice Creation (`POST /api/v1/invoices`)

```
1. Fetch Customer (or throw 404)
2. Build Invoice:
   - Auto-generate invoiceNo via InvoiceNumberGenerator (sequence table)
   - For each item: amount = qty × rate; accumulate subtotal
   - gstAmount = subtotal × gstPercentage / 100
   - finalAmount = subtotal + gstAmount − discount
   - dueAmount = finalAmount − paidAmount
   - paymentStatus = PAID | PARTIAL | UNPAID
3. customer.currentDue += dueAmount   → save customer
4. Save CustomerCreditHistory (type=INVOICE, amount=dueAmount)
5. Save LedgerEntry (debit=dueAmount, credit=0, runningBalance=customer.currentDue)
6. Return InvoiceResponse
```

### Payment Receipt (`POST /api/v1/payments`)

```
1. Fetch Customer (or throw 404)
2. Validate: amount > 0 AND amount <= customer.currentDue
3. Fetch pending invoices (UNPAID + PARTIAL) ordered oldest-first
   ⚠️  Bug: pendingInvoices is fetched and then .addAll(same query) — doubles the list
4. Auto-settle invoices (oldest-first):
   - If remainingAmount >= invoice.dueAmount → mark PAID
   - Else → mark PARTIAL, reduce dueAmount
5. customer.currentDue -= paymentAmount   → save customer
6. Save Payment entity (with auto-generated receiptNo)
7. Save CustomerCreditHistory (type=PAYMENT, amount=−paymentAmount)
8. Save LedgerEntry (debit=0, credit=paymentAmount, runningBalance=customer.currentDue)
9. Return PaymentResponse
```

> ⚠️ BUG (PaymentServiceImpl.java ~line 60): `pendingInvoices.addAll(invoiceRepository.findPendingInvoices(...))` duplicates the list. Each invoice will be settled twice, causing incorrect accounting. Must be fixed before production.

### Invoice Number Generation
Uses a **sequence table** (`invoice_sequence`) with a `@Transactional` lock to generate sequential invoice numbers (e.g., `INV-20240001`). Same pattern for payment receipt numbers.

---

## Common Infrastructure

### Exception Handling

`GlobalExceptionHandler` (@RestControllerAdvice) maps every exception to a standard `ApiResponse<Object>`:

| Exception | HTTP Status |
|---|---|
| `ResourceNotFoundException` | 404 |
| `BadRequestException` | 400 |
| `UnauthorizedException` | 401 |
| `ForbiddenException` | 403 |
| `MethodArgumentNotValidException` | 400 (with field-level error map) |
| `Exception` (catch-all) | 500 |

### Standard Response Envelope

```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": { ... }
}
```

### Logging
- Rolling file logs at `logs/wb-store.log`
- Root level: INFO; `com.wholesale.store` package: DEBUG
- Hibernate SQL logging: OFF (enable via `org.hibernate.SQL: DEBUG` for debugging)

---

## Known Issues & Tech Debt

| # | Severity | Location | Description |
|---|---|---|---|
| 1 | 🔴 Critical | `PaymentServiceImpl.java` | `pendingInvoices.addAll(findPendingInvoices(...))` duplicates the list — invoices settled twice |
| 2 | 🔴 Critical | `application.yaml` | JWT secret is hardcoded — must move to env var |
| 3 | 🟡 Medium | `SecurityConfig.java` | `allowedOrigins("*")` with specific origins is redundant; remove `"*"` for production |
| 4 | 🟡 Medium | `SecurityConfig.java` | `SessionCreationPolicy.STATELESS` block is commented out — verify session creation policy |
| 5 | 🟡 Medium | `InvoiceController`, `PaymentController` | No GET endpoints for listing/retrieving invoices or payments |
| 6 | 🟡 Medium | `axiosConfig.js` | Two identical `request` interceptors registered — deduplicate |
| 7 | 🟠 Low | `reports/` package | Empty stub — no implementation |
| 8 | 🟠 Low | `ledger/` package | No controller/service — data only written, never queried via REST directly |
| 9 | 🟠 Low | `CustomerCreditHistory` | Splits between `invoices/` repo and `ledger/` entity package — consolidate |
| 10 | 🟠 Low | CORS | `allowedMethods` missing DELETE and PATCH — will block status-toggle calls |
