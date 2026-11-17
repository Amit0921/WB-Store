# Frontend Guide — WB-Store

> Component map, routing, API layer, state management patterns, and UI conventions for the React frontend.

---

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [Layout System](#layout-system)
- [Pages](#pages)
- [Components](#components)
- [API Layer](#api-layer)
- [Authentication Flow](#authentication-flow)
- [UI Conventions](#ui-conventions)
- [Known Issues & Gaps](#known-issues--gaps)

---

## Overview

The frontend is a **React 19 SPA** built with Vite, using **Material UI v9** for some components and **inline styles** (style objects) as the primary styling approach. State management is entirely local (`useState` / `useEffect`) — no global store (Redux / Zustand / Context API) is used yet.

---

## Project Structure

```
wholesale-billing-ui/src/
├── api/
│   ├── axiosConfig.js        ← Axios instance + JWT interceptor
│   ├── authApi.js            ← login()
│   ├── customerApi.js        ← getAllCustomers, getCustomerById, createCustomer, ...
│   ├── invoiceApi.js         ← (stub)
│   ├── paymentApi.js         ← (stub)
│   └── userApi.js            ← getAllUsers, createUser, ...
│
├── components/
│   ├── Sidebar.jsx           ← Fixed left nav (brand + menu + user footer)
│   ├── Topbar.jsx            ← Top app bar
│   ├── NavbarHome.jsx        ← Landing page navbar
│   ├── Navbar.jsx            ← (secondary navbar variant)
│   ├── DataTable.jsx         ← Reusable table with pagination
│   ├── Card.jsx              ← Simple card wrapper
│   ├── StatCard.jsx          ← Metric card (label, value, icon, trend)
│   ├── PageHeader.jsx        ← Page title + breadcrumb area
│   ├── ProtectedRoute.jsx    ← Route guard (checks localStorage token)
│   └── UserMenu.jsx          ← (empty file — not yet implemented)
│
├── layouts/
│   └── MainLayout.jsx        ← Sidebar + scrollable content area wrapper
│
├── pages/
│   ├── Home.jsx              ← Public landing page
│   ├── Login.jsx             ← Login form with JWT handling
│   ├── Dashboard.jsx         ← Authenticated dashboard (stats + recent customers)
│   └── customers/
│       ├── CustomerList.jsx      ← Paginated table + search + status badge
│       ├── CustomerCreate.jsx    ← Create customer form (2-column grid)
│       ├── CustomerEdit.jsx      ← Edit customer form (pre-filled)
│       └── CustomerSummary.jsx   ← Customer profile: stats + summary/statement tabs
│   └── invoices/
│       └── CreateInvoice.jsx     ← (empty stub)
│   └── payments/
│       └── CreatePayment.jsx     ← (empty stub)
│   └── users/
│       ├── UserList.jsx          ← (empty stub)
│       ├── UserCreate.jsx        ← (empty stub)
│       └── UserEdit.jsx          ← (empty stub)
│
├── routes/
│   └── AppRoutes.jsx         ← BrowserRouter + Route definitions
│
└── utils/
    └── constants.js          ← Shared constants (API base URL, etc.)
```

---

## Routing

Defined in `AppRoutes.jsx` using React Router v7:

| Path | Component | Layout | Notes |
|---|---|---|---|
| `/` | `Home` | None | Public landing page |
| `/login` | `Login` | None | Public login form |
| `/dashboard` | `Dashboard` | `MainLayout` (internal) | Auth required |
| `/customers` | `CustomerList` | `MainLayout` | Auth required |
| `/customers/create` | `CustomerCreate` | `MainLayout` (internal) | ADMIN/MANAGER |
| `/customers/:id` | `CustomerSummary` | None yet | Navigated to from list |
| `/customers/:id/edit` | `CustomerEdit` | None yet | Navigated to from summary |
| `/invoices/create` | `CreateInvoice` | — | Stub — empty |
| `/payments/create` | `CreatePayment` | — | Stub — empty |

> ⚠️ NOTE: Routes for invoices, payments, and users are **not registered** in `AppRoutes.jsx` yet. The Sidebar links to `/invoices`, `/payments`, and `/users` which return 404.

> ⚠️ NOTE: `ProtectedRoute.jsx` exists but is **not used** in `AppRoutes.jsx`. All routes are publicly accessible to anyone with the URL.

---

## Layout System

### `MainLayout.jsx`

Wraps authenticated pages. Renders:
1. `Sidebar` — fixed left panel (210px wide)
2. `children` — scrollable content area with `margin-left: 210px`

### `Sidebar.jsx`

- **Brand**: "myBusiness" logo with invoice emoji icon
- **Navigation**: Three sections — Main (Dashboard, Customers, Invoices), Finance (Payments), Admin (Users)
- **Active state**: Uses `NavLink` with `isActive` for highlighted background (`#ede9fe`) + brand color
- **User footer**: Reads `user` from `localStorage`, shows initials avatar, full name, logout button
- **Logout**: Clears `token` and `user` from localStorage, navigates to `/login`

---

## Pages

### `Login.jsx`
- Full-page centered card with branding
- Calls `POST /api/v1/auth/login` via `authApi.js`
- On success: stores `token` and `user` object in `localStorage`, navigates to `/dashboard`
- Error display: inline red banner

### `Dashboard.jsx`
- Fetches `getAllCustomers()` and `getAllUsers()` in parallel (`Promise.all`)
- Shows 4 stat cards: Customers, Active Customers, Users, Invoices (hardcoded "0" — not fetched)
- Quick Actions: Add Customer, Create Invoice, Receive Payment (navigate buttons)
- Recent Customers table: last 5 from API response

### `CustomerList.jsx`
- Paginated table with columns: Shop Name, Owner, Phone, Status, Credit Limit, Due, Actions
- Search bar calls `/customers/search?keyword=` with debounce
- Status badge: green (ACTIVE) / gray (INACTIVE)
- Row actions: View (→ summary), Edit

### `CustomerCreate.jsx`
- 2-column form grid: Shop Name, Owner Name, Phone, GSTIN, Credit Limit, Status
- Inline validation (required: Shop Name, Owner Name, Phone)
- Calls `createCustomer()` on submit; navigates to `/customers` on success

### `CustomerEdit.jsx`
- Pre-fills form by fetching customer via `getCustomerById(id)`
- Calls `updateCustomer(id, data)` on save

### `CustomerSummary.jsx`
- Fetches `getCustomerSummary(id)` for financial totals
- Fetches `getCustomerStatement(id)` for ledger statement
- Two tabs: **Summary** (customer info fields) and **Statement** (ledger table: Date, Type, Reference, Amount, Balance)
- Quick actions: Edit button, New Invoice button (pre-fills customerId in URL)

---

## Components

### `DataTable.jsx`
Reusable table component accepting:
```js
<DataTable
  columns={[{ key, label, render? }]}
  data={[...]}
  loading={bool}
  pagination={{ page, totalPages, onPageChange }}
/>
```

### `StatCard.jsx`
```js
<StatCard label="Customers" value={42} icon="👥" iconBg="#ede9fe" trend="38 active" />
```

### `ProtectedRoute.jsx`
Checks `localStorage.getItem('token')`. If missing → redirects to `/login`.
**Currently not wired into routes.**

---

## API Layer

### Axios Instance (`axiosConfig.js`)

```js
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' }
});
// Attaches Bearer token from localStorage on every request
```

> ⚠️ BUG: Two identical request interceptors are registered. Deduplicate to one.

> ⚠️ NOTE: `baseURL` is hardcoded. Move to `import.meta.env.VITE_API_URL` for environment flexibility.

### API Modules

| File | Exported Functions |
|---|---|
| `authApi.js` | `login(credentials)` |
| `customerApi.js` | `getAllCustomers()`, `getCustomerById(id)`, `searchCustomers(params)`, `getCustomerSummary(id)`, `getCustomerStatement(id)`, `createCustomer(data)`, `updateCustomer(id, data)`, `updateCustomerStatus(id, status)` |
| `userApi.js` | `getAllUsers()`, `getUserById(id)`, `createUser(data)`, `updateUser(id, data)`, `updateUserStatus(id, active)` |
| `invoiceApi.js` | `createInvoice(data)` (stub — needs implementation) |
| `paymentApi.js` | `createPayment(data)` (stub — needs implementation) |

### Response Unwrapping Pattern

All API functions unwrap the backend's envelope:
```js
export const getAllCustomers = async () => {
  const res = await api.get('/customers');
  return res.data.data.content || [];   // Page<CustomerResponse>.content
};
```

---

## Authentication Flow

```
Login page → POST /api/v1/auth/login
  → { accessToken, user: { id, fullName, username, email, roles[] } }
  → localStorage.setItem('token', accessToken)
  → localStorage.setItem('user', JSON.stringify(user))
  → navigate('/dashboard')

Sidebar / Dashboard → reads user from localStorage for display

Logout → localStorage.removeItem('token') + removeItem('user') → navigate('/login')

Axios interceptor → reads token from localStorage → adds Authorization: Bearer <token>
```

> ⚠️ NOTE: Token expiry is not handled. When the token expires (default 30 min), API calls will silently fail with 401. Need to add a response interceptor that catches 401 and redirects to `/login`.

---

## UI Conventions

The project uses **inline style objects** as the primary styling approach (no CSS modules or styled-components). The brand colour is `#4c3cce` (purple-indigo).

| Convention | Value |
|---|---|
| Brand colour | `#4c3cce` |
| Background (app) | `#f5f6fa` |
| Card background | `#ffffff` |
| Card border | `1px solid #e2e8f0` |
| Border radius (card) | `12–16px` |
| Primary button | bg `#1e40af` text `#fff` |
| Secondary button | bg `#fff` border `#cbd5e1` |
| Text primary | `#0f172a` / `#1e1b4b` |
| Text muted | `#64748b` / `#94a3b8` |
| Active status | `#16a34a` (green) |
| Inactive status | `#94a3b8` (gray) |
| Font size (body) | 13–14px |
| Font size (label) | 11–12px uppercase |

---

## Known Issues & Gaps

| # | Severity | File | Description |
|---|---|---|---|
| 1 | 🔴 Critical | `AppRoutes.jsx` | `ProtectedRoute` not used — all routes are unguarded |
| 2 | 🔴 Critical | `AppRoutes.jsx` | Invoice, Payment, User routes not registered — Sidebar links are dead |
| 3 | 🔴 Critical | `axiosConfig.js` | No 401 response interceptor — expired tokens cause silent failures |
| 4 | 🟡 Medium | `axiosConfig.js` | Hardcoded `baseURL` — should be `import.meta.env.VITE_API_URL` |
| 5 | 🟡 Medium | `axiosConfig.js` | Duplicate `request` interceptor registered twice |
| 6 | 🟡 Medium | `Dashboard.jsx` | Invoice count is hardcoded as `"0"` — no invoice API called |
| 7 | 🟡 Medium | `CustomerSummary.jsx` | Field mapping issue — `c.name`, `c.email`, `c.city`, `c.state` don't match backend `CustomerSummaryResponse` fields |
| 8 | 🟠 Low | `pages/invoices/`, `pages/payments/`, `pages/users/` | All page files are **empty** (0 bytes) |
| 9 | 🟠 Low | `UserMenu.jsx` | Empty file (0 bytes) |
| 10 | 🟠 Low | General | No global error boundary — unhandled promise rejections crash the page silently |
| 11 | 🟠 Low | `Sidebar.jsx` | `console.log("User from Sidebar", user)` left in production code |
