# WB-Store — Wholesale Billing & Ledger Management System

> A full-stack web application for managing wholesale billing, customer ledgers, invoices, and payments.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment & Configuration](#environment--configuration)
- [API Reference](#api-reference)
- [User Roles & Permissions](#user-roles--permissions)
- [Documentation Index](#documentation-index)

---

## Overview

**WB-Store** is a wholesale billing and ledger management platform built for small-to-medium wholesale businesses. It tracks customers, generates GST-aware invoices, records payments, and maintains a full double-entry ledger per customer — all accessible through a modern React dashboard.

### Key Capabilities

| Feature | Status |
|---|---|
| JWT-based authentication | ✅ Done |
| Role-based access control (ADMIN / MANAGER / BILLING_STAFF) | ✅ Done |
| Customer management (CRUD + search + status toggle) | ✅ Done |
| GST-aware invoice creation with line items | ✅ Done |
| Payment receipt with auto-settlement across invoices | ✅ Done |
| Customer ledger (double-entry: debit/credit/running balance) | ✅ Done |
| Customer summary & account statement | ✅ Done |
| Dashboard with quick-actions | ✅ Done |
| Invoice list / detail / PDF | 🔲 Planned |
| Payment list / receipt PDF | 🔲 Planned |
| User management UI | 🔲 Planned |
| Reports module | 🔲 Planned |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (React)                    │
│         wholesale-billing-ui  [Port 5173]            │
│    React 19 · MUI v9 · React Router v7 · Axios      │
└──────────────────────┬──────────────────────────────┘
                       │  REST / JSON  (JWT Bearer)
┌──────────────────────▼──────────────────────────────┐
│              Spring Boot 4 API Server                │
│               store  [Port 8080]                     │
│  Spring Security · JPA/Hibernate · MapStruct · JJWT │
└──────────────────────┬──────────────────────────────┘
                       │  JDBC
┌──────────────────────▼──────────────────────────────┐
│          PostgreSQL 15  [Port 5432]                  │
│               Database: wb_store                     │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend (`/store`)
| Layer | Technology |
|---|---|
| Framework | Spring Boot 4.0.6 |
| Language | Java 21 |
| Security | Spring Security 6 + JJWT 0.12.6 |
| Persistence | Spring Data JPA / Hibernate |
| Database | PostgreSQL 15 |
| Migrations | Flyway |
| Mapping | MapStruct 1.6.3 |
| Boilerplate | Lombok 1.18.38 |
| API Docs | SpringDoc OpenAPI 2.8.8 (Swagger UI) |
| Build | Maven 3 |

### Frontend (`/wholesale-billing-ui`)
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Bundler | Vite 8 |
| UI Library | MUI (Material UI) v9 |
| Routing | React Router v7 |
| HTTP Client | Axios 1.17 |
| Forms | React Hook Form 7 |
| Icons | Remix Icon v4 |

---

## Project Structure

```
WB-Store/
├── store/                          # Spring Boot backend
│   ├── src/main/java/com/wholesale/store/
│   │   ├── auth/                   # Authentication (JWT login)
│   │   ├── common/                 # Shared infra (security, config, exceptions)
│   │   ├── customers/              # Customer domain
│   │   ├── invoices/               # Invoice domain
│   │   ├── payments/               # Payment domain
│   │   ├── ledger/                 # Ledger / statement domain
│   │   ├── reports/                # Reports (stub)
│   │   └── users/                  # User & role management
│   ├── src/main/resources/
│   │   ├── application.yaml
│   │   └── db/migration/           # Flyway SQL scripts
│   ├── docker-compose.yml          # Kafka + Zookeeper + Kafka-UI
│   └── pom.xml
│
├── wholesale-billing-ui/           # React frontend
│   ├── src/
│   │   ├── api/                    # Axios API layer
│   │   ├── components/             # Shared UI components
│   │   ├── layouts/                # MainLayout (Sidebar + content)
│   │   ├── pages/                  # Route-level page components
│   │   │   ├── customers/
│   │   │   ├── invoices/           # (stub — not yet implemented)
│   │   │   ├── payments/           # (stub — not yet implemented)
│   │   │   └── users/              # (stub — not yet implemented)
│   │   ├── routes/                 # AppRoutes.jsx
│   │   └── utils/                  # constants.js
│   ├── package.json
│   └── vite.config.js
│
├── logs/                           # Rolling application logs
└── README.md                       # ← You are here
```

---

## Getting Started

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 20+ and npm
- PostgreSQL 15 running locally
- (Optional) Docker for Kafka

### 1. Database Setup

```sql
CREATE DATABASE wb_store;
-- Flyway will auto-run migrations on first startup
```

### 2. Backend

```bash
cd store
./mvnw spring-boot:run
# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

### 3. Frontend

```bash
cd wholesale-billing-ui
npm install
npm run dev
# UI available at http://localhost:5173
```

### 4. Default Admin User

A `DataInitializer` bean seeds a default admin user on first startup.
Check `DataInitializer.java` for credentials and update them immediately after first login.

---

## Environment & Configuration

Key settings in `store/src/main/resources/application.yaml`:

| Property | Default | Description |
|---|---|---|
| `server.port` | `8080` | Backend HTTP port |
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/wb_store` | PostgreSQL connection |
| `spring.datasource.username` | `postgres` | DB username |
| `application.security.jwt.secret-key` | `ATPUGTIMA...` | **Change before production!** |
| `application.security.jwt.expiration` | `1800` | Access token TTL (seconds) |
| `application.security.jwt.refresh-expiration` | `604800` | Refresh token TTL (seconds) |
| `spring.flyway.enabled` | `true` | Auto-run DB migrations |

> ⚠️ WARNING: The JWT secret key is hardcoded in `application.yaml`. Move it to an environment variable (`APPLICATION_SECURITY_JWT_SECRET_KEY`) before any deployment.

---

## API Reference

Base URL: `http://localhost:8080/api/v1`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/auth/login` | No | — | Obtain JWT token |
| GET | `/customers` | Yes | Any | List customers (paginated) |
| POST | `/customers` | Yes | ADMIN, MANAGER | Create customer |
| GET | `/customers/{id}` | Yes | Any | Get customer by ID |
| PUT | `/customers/{id}` | Yes | ADMIN, MANAGER | Update customer |
| PATCH | `/customers/{id}/status` | Yes | ADMIN, MANAGER | Toggle customer status |
| GET | `/customers/search?keyword=` | Yes | Any | Search customers |
| GET | `/customers/{id}/summary` | Yes | Any | Customer financial summary |
| GET | `/customers/{id}/statement` | Yes | Any | Customer ledger statement |
| POST | `/invoices` | Yes | Any | Create invoice |
| POST | `/payments` | Yes | Any | Record payment |
| GET | `/users` | Yes | ADMIN, MANAGER | List users |
| POST | `/users` | Yes | ADMIN | Create user |
| GET | `/users/{id}` | Yes | ADMIN, MANAGER | Get user |
| PUT | `/users/{id}` | Yes | ADMIN, MANAGER | Update user |
| PATCH | `/users/{id}/status` | Yes | ADMIN, MANAGER | Activate/deactivate user |

Full interactive docs: **http://localhost:8080/swagger-ui.html**

---

## User Roles & Permissions

| Role | Description | Key Permissions |
|---|---|---|
| `ADMIN` | Full access | Create/manage users, all CRUD |
| `MANAGER` | Day-to-day operations | Manage customers, view users |
| `BILLING_STAFF` | Billing only | Create invoices, record payments |

---

## Documentation Index

| Document | Purpose |
|---|---|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Deep-dive into backend domain design and data model |
| [FRONTEND.md](./docs/FRONTEND.md) | Frontend component guide, routing, API layer |
| [DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Development roadmap, known issues, next steps |
| [API.md](./docs/API.md) | Full API request/response schemas |
