# Sarker Shop API Documentation

Welcome to the Sarker Shop API documentation. This guide provides all the information you need to integrate with our e-commerce platform.

---

## 🚀 Overview

- **Base URL**: `http://localhost:8000/api`
- **Format**: JSON (application/json)
- **Versioning**: 2026.1.0

---

## 🔐 Authentication

Sarker Shop uses **JWT (JSON Web Token)** for authentication.

### 1. Login
**POST** `/auth/login/`

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `username` | string | Yes | Your email or username |
| `password` | string | Yes | Your account password |

**Success Response (200 OK)**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "user": {
    "id": 1,
    "username": "nilesh",
    "email": "nilesh@sarker.shop"
  }
}
```

### 2. Refresh Token
**POST** `/auth/refresh/`
Use this to get a new access token when the current one expires.

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refresh` | string | Yes | Your refresh token |

---

## 📦 Catalog

### 1. List Products
**GET** `/products/`

**Query Parameters:**
- `category`: Category ID
- `brand`: Brand ID
- `price__gte`: Minimum price
- `price__lte`: Maximum price
- `rating__gte`: Minimum rating
- `search`: Search by product name, SKU, or description.
- `ordering`: `-created_at`, `price`, `-sold_count`, `rating`.

### 2. Get Product Detail
**GET** `/products/{slug_or_id}/`

### 3. Categories
- **List All**: `GET /categories/`
- **Root Only**: `GET /categories/roots/`

---

## 🛒 Shopping Cart & Checkout

### 1. Manage Cart
- **Get Cart**: `GET /cart/` (Handles both guests via session and authenticated users)
- **Add Item**: `POST /cart/`
  ```json
  {
    "product": 1,
    "variant": 5, // Optional
    "quantity": 2
  }
  ```
- **Clear Cart**: `DELETE /cart/clear/`

### 2. Validate Coupon
**POST** `/orders/validate-coupon/`

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `code` | string | Yes | Coupon code (e.g., WELCOME300) |
| `subtotal` | decimal | Yes | Current cart subtotal |

### 3. Create Order
**POST** `/orders/`

**Request Body (Guest):**
```json
{
  "full_name": "Nilesh Sarker",
  "email": "nilesh@sarker.shop",
  "phone": "01700000000",
  "shipping_address": "House 12, Road 5",
  "division": 1,
  "district": 5,
  "payment_method": "cod"
}
```

---

## 💬 Communication & Support

### 1. Real-time Chat
- **Initialize**: `GET /chats/init/` (Returns or creates a conversation ID)
- **Messages**: `GET /chats/{conversation_id}/messages/`
- **Mark Read**: `PATCH /chats/read/{conversation_id}/`

### 2. Contact Form
- **Submit**: `POST /contact/`
  ```json
  {
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Inquiry",
      "message": "Hello, I have a question about..."
  }
  ```

---

## 📊 Dashboard & Admin (Staff Only)

### 1. Global Statistics
**GET** `/dashboard/stats/`
Returns total revenue, order counts, and trend percentages.

### 2. Analytical Data
**GET** `/dashboard/analytics/`
Returns monthly sales, category share distribution, and top-performing products.

---

## 🛠️ System Tools

| Action | Endpoint | Method |
| :--- | :--- | :--- |
| **Export Products** | `/export/products` | `GET` |
| **Import Products** | `/import/products` | `POST` |
| **OpenAPI Schema** | `/schema/` | `GET` |

---

> [!TIP]
> Use the **Swagger UI** at `/docs/` for an interactive testing playground of these endpoints.
