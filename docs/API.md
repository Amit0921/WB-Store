# API Reference — WB-Store

> Complete request and response schemas for all API endpoints.

Base URL: `http://localhost:8080/api/v1`

All authenticated requests require the header:
```
Authorization: Bearer <access_token>
```

All responses follow the envelope:
```json
{
  "success": true|false,
  "message": "...",
  "data": { ... } | [ ... ] | null
}
```

---

## Authentication

### POST `/auth/login`

**Public — no auth required**

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 1800,
    "user": {
      "id": "1",
      "fullName": "Admin User",
      "username": "admin",
      "email": "admin@example.com",
      "roles": ["ADMIN"]
    }
  }
}
```

**Response `401`:**
```json
{ "success": false, "message": "Invalid username or password", "data": null }
```

---

## Customers

### GET `/customers`

**Auth required**

**Query Params:**
| Param | Default | Description |
|---|---|---|
| `page` | `0` | Page number (0-indexed) |
| `size` | `10` | Page size |

**Response `200`:**
```json
{
  "success": true,
  "message": "Customers fetched successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "shopName": "Panda Garments",
        "ownerName": "Ravi Panda",
        "phone": "9876543210",
        "alternatePhone": null,
        "gstin": "29ABCDE1234F1Z5",
        "address": "123, MG Road, Bangalore",
        "creditLimit": 500000.00,
        "currentDue": 12000.00,
        "status": "ACTIVE",
        "createdAt": "2026-07-15T10:00:00",
        "updatedAt": "2026-07-16T14:30:00"
      }
    ],
    "totalElements": 48,
    "totalPages": 5,
    "size": 10,
    "number": 0
  }
}
```

---

### POST `/customers`

**Auth required | Role: ADMIN, MANAGER**

**Request Body:**
```json
{
  "shopName": "Panda Garments",
  "ownerName": "Ravi Panda",
  "phone": "9876543210",
  "alternatePhone": "9123456789",
  "gstin": "29ABCDE1234F1Z5",
  "address": "123, MG Road, Bangalore",
  "creditLimit": 500000
}
```

**Response `200`:** Returns created `CustomerResponse` object.

**Response `400`:**
```json
{ "success": false, "message": "Customer already exists", "data": null }
```

---

### GET `/customers/{id}`

**Auth required**

**Response `200`:** Returns `CustomerResponse` object.

**Response `404`:**
```json
{ "success": false, "message": "Customer not found", "data": null }
```

---

### PUT `/customers/{id}`

**Auth required | Role: ADMIN, MANAGER**

**Request Body:** Same as `POST /customers` (all fields, no phone uniqueness re-check).

**Response `200`:** Returns updated `CustomerResponse`.

---

### PATCH `/customers/{id}/status`

**Auth required | Role: ADMIN, MANAGER**

**Request Body:**
```json
{ "status": "INACTIVE" }
```
Values: `ACTIVE` | `INACTIVE`

**Response `200`:**
```json
{ "success": true, "message": "Customer status updated", "data": null }
```

---

### GET `/customers/search`

**Auth required**

**Query Params:**
| Param | Required | Description |
|---|---|---|
| `keyword` | Yes | Searches shopName, ownerName, phone (case-insensitive) |
| `page` | No (default 0) | Page number |
| `size` | No (default 10) | Page size |

**Response `200`:** Same `Page<CustomerResponse>` structure as GET `/customers`.

---

### GET `/customers/{id}/summary`

**Auth required**

**Response `200`:**
```json
{
  "success": true,
  "message": "Customer summary fetched successfully",
  "data": {
    "shopName": "Panda Garments",
    "creditLimit": 500000.00,
    "currentDue": 12000.00,
    "totalInvoiceAmount": 350000.00,
    "totalPaidAmount": 338000.00,
    "totalInvoices": 15
  }
}
```

---

### GET `/customers/{id}/statement`

**Auth required**

Returns ledger entries sorted by entry date ascending.

**Response `200`:**
```json
{
  "success": true,
  "message": "Statement fetched successfully",
  "data": [
    {
      "transactionDate": "2026-07-15T10:30:00",
      "transactionType": "INVOICE",
      "referenceNo": "INV-20260001",
      "debit": 25000.00,
      "credit": 0.00,
      "runningBalance": 25000.00
    },
    {
      "transactionDate": "2026-07-20T14:00:00",
      "transactionType": "PAYMENT",
      "referenceNo": "RCP-20260001",
      "debit": 0.00,
      "credit": 15000.00,
      "runningBalance": 10000.00
    }
  ]
}
```

---

## Invoices

### POST `/invoices`

**Auth required**

**Request Body:**
```json
{
  "customerId": 1,
  "gstPercentage": 18,
  "discountAmount": 500,
  "paidAmount": 10000,
  "notes": "Urgent order",
  "items": [
    {
      "itemCode": "ITM001",
      "itemName": "Cotton Shirt",
      "brand": "Arrow",
      "color": "Blue",
      "size": "L",
      "hsnCode": "6205",
      "quantity": 10,
      "unit": "PCS",
      "rate": 850.00
    }
  ]
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "id": 42,
    "invoiceNo": "INV-20260042",
    "customerName": "Panda Garments",
    "finalAmount": 9530.00,
    "paidAmount": 9530.00,
    "dueAmount": 0.00
  }
}
```

> NOTE: There is currently **no GET endpoint** to list or retrieve invoices. This is a planned feature.

---

## Payments

### POST `/payments`

**Auth required**

**Request Body:**
```json
{
  "customerId": 1,
  "amount": 5000.00,
  "paymentMode": "UPI",
  "referenceNumber": "UPI123456",
  "notes": "Payment for July invoices"
}
```

Payment modes: `CASH` | `UPI` | `BANK_TRANSFER` | `CHEQUE` | `OTHER`

**Response `200`:**
```json
{
  "success": true,
  "message": "Payment received successfully",
  "data": {
    "customerName": "Panda Garments",
    "paidAmount": 5000.00,
    "remainingDue": 7000.00
  }
}
```

**Response `400`:**
```json
{ "success": false, "message": "Payment exceeds customer due amount", "data": null }
```

> NOTE: There is currently **no GET endpoint** to list or retrieve payments. This is a planned feature.

---

## Users

### GET `/users`

**Auth required | Role: ADMIN, MANAGER**

**Query Params:** `page` (default 0), `size` (default 10)

**Response `200`:**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "fullName": "Admin User",
        "username": "admin",
        "email": "admin@example.com",
        "phone": "9000000001",
        "active": true,
        "roles": ["ADMIN"],
        "lastLogin": "2026-11-16T10:00:00"
      }
    ],
    "totalElements": 3,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

---

### POST `/users`

**Auth required | Role: ADMIN only**

**Request Body:**
```json
{
  "fullName": "John Manager",
  "username": "john.manager",
  "email": "john@example.com",
  "phone": "9000000002",
  "password": "SecurePass123",
  "roles": ["MANAGER"]
}
```

**Response `200`:** Returns created `UserResponse`.

---

### GET `/users/{id}`

**Auth required | Role: ADMIN, MANAGER**

**Response `200`:** Returns `UserResponse`.

---

### PUT `/users/{id}`

**Auth required | Role: ADMIN, MANAGER**

**Request Body:** Same as `POST /users` (password optional for update).

---

### PATCH `/users/{id}/status`

**Auth required | Role: ADMIN, MANAGER**

**Request Body:**
```json
{ "active": false }
```

**Response `200`:**
```json
{ "success": true, "message": "User status updated successfully", "data": null }
```

---

## Error Responses

All errors follow the same envelope:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "data": null
}
```

For validation errors (400), `data` contains a field-error map:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "username": "must not be blank",
    "password": "size must be between 8 and 100"
  }
}
```

| HTTP Status | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad request / validation error |
| 401 | Unauthenticated (missing/expired/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 500 | Internal server error |
