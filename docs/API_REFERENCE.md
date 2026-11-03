# API Reference (Map)

This page is a map of the endpoints. For full request and response schemas, use the live OpenAPI docs: `/schema/` (raw), `/docs/` (Swagger, requires login) and `/redoc/`. Worked examples are in [../backend/docs/API_DOCUMENTATION.md](../backend/docs/API_DOCUMENTATION.md).

**Base URL:** the backend root. Locally `http://localhost:8000`. In production, `https://api.<domain>` or `https://<domain>/api` (Nginx strips `/api`). Every path below is relative to that base and ends with a trailing slash unless shown otherwise.

**Auth header:** `Authorization: Bearer <access>`
**List responses:** `{count, next, previous, results[]}` (20 per page, `?page=N`)
**Common query parameters:** `?search=`, `?ordering=field|-field`, plus each ViewSet's filter fields

Auth key: 🌐 public · 👤 authenticated (own data) · 🛠 staff with the model permission

---

## Auth (`accounts`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `auth/register/` | 🌐 | Create user and customer, send verification email |
| POST | `auth/login/` | 🌐 | `{username or email, password}` → `{access, refresh, user}` |
| POST | `auth/refresh/` | 🌐 | `{refresh}` → `{access}` |
| POST | `auth/logout/` | 👤 | |
| PUT | `auth/change-password/` | 👤 | |
| POST | `auth/forgot-password/`, `auth/reset-password/` | 🌐 | Password reset flow |
| POST | `auth/verify-email/`, `auth/resend-verification-email/` | 🌐 | |
| POST | `auth/google/`, `auth/facebook/` | 🌐 | Social token → JWT |

## Customers, users and locations
| Resource | Path | Notes |
|---|---|---|
| Customers | `customers/` | 🛠 CRUD. `customers/me/` GET, PUT and PATCH 👤 (the admin uses it as the profile and permission source) |
| Addresses | `addresses/` | 👤 own, 🛠 all. `addresses/<id>/set_default/` POST |
| Divisions, Districts, Sub-districts | `divisions/`, `districts/`, `sub-districts/` | 🌐 read. Filter by parent (`?division=`, `?district=`) |
| Users | `users/` | 🛠 staff and user management |
| Groups (roles) | `groups/` | 🛠 |
| Permissions | `permissions/` | 🛠 list of Django permissions |

## Catalog (`products`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `products/` | 🌐 | Filters: `category`, `category__name`, `category__slug`, `brand`, price range, `rating__gte`, and more. `?ordering=created_at|rating|sold_count` |
| GET | `products/<slug>/` | 🌐 | **Lookup by slug** |
| POST, PUT, PATCH, DELETE | `products/`, `products/<slug>/` | 🛠 | Multipart for images |
| GET | `products/suggest/?search=` | 🌐 | Autocomplete |
| GET | `products/search/` | 🌐 | |
| GET | `products/featured/`, `products/bestsellers/` | 🌐 | |
| GET | `products/price_range/` | 🌐 | Min and max for filter UI |
| GET | `products/<slug>/related/` | 🌐 | |
| CRUD | `categories/`, `categories/roots/` | 🌐 read, 🛠 write | `?parent=` |
| CRUD | `brands/` | 🌐 read, 🛠 write | |

## Cart, checkout, orders and payments (`orders`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET, POST | `cart/` | 🌐 | Guest uses the session cookie, so send credentials |
| DELETE | `cart/clear/` | 🌐 | |
| CRUD | `cart-items/` | 🌐 | |
| CRUD | `checkout/` | 👤 | |
| POST | `orders/` | 🌐 | Place an order (guest or customer) |
| GET | `orders/`, `orders/<id>/` | 👤 own, 🛠 all | Each order has `status` (display name) and `status_code`. Filters: `order_status__status_code`, `payment_info__is_paid`. `?ordering=created_at|total_amount` |
| PATCH | `orders/<id>/status/` | 🛠 | `{status: "<status_code>"}`. Codes: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `returned`. Returns `{new_status, status_code}`. |
| GET | `orders/<id>/invoice/` | 👤 or 🛠 | PDF |
| POST | `orders/validate-coupon/` | 🌐 | |
| POST | `orders/<id>/initiate-payment/` | 🌐 | → `{payment_url, tran_id}` (SSLCommerz) |
| POST | `payment/sslcommerz/success/`, `fail/`, `cancel/`, `ipn/` | SSLCommerz | Server-to-server and browser callbacks. Never call these from the frontend. |
| CRUD | `payments/` | 👤 or 🛠 | `PaymentInfo` |
| CRUD | `coupons/` | 🛠 | |

## Reviews and Q&A
| Path | Auth | Notes |
|---|---|---|
| `reviews/` | 🌐 read, 👤 create, owner or 🛠 edit | `?product=`, `?rating=` |
| `questions/` | same | `?product=` |

## Store and engagement (`web`)
| Method | Path | Auth |
|---|---|---|
| GET, PUT, PATCH | `configuration/` | 🌐 read, admin write |
| POST | `contact/` | 🌐 |
| POST | `subscribe/` | 🌐 |
| GET | `notifications/` | 👤 own |
| POST | `notifications/<id>/mark_read/`, `notifications/<id>/mark_unread/` | 👤 |
| POST | `notifications/mark_all_read/` | 👤 |
| DELETE | `notifications/clear_all/` | 👤 |

## Chat (REST)
| Method | Path | Notes |
|---|---|---|
| GET | `chats/` | Conversation list (staff: all. Customer or guest: own via `X-Guest-ID` or `?guest_id=`) |
| GET, POST | `chats/init/` | Get or create the current user's or guest's conversation |
| GET | `chats/<conversation_id>/messages/` | |
| POST | `chats/upload/` | Multipart image or video message |
| POST | `chats/read/<pk>/` | Mark as read |

## Admin and analytics (`api`)
| Method | Path | Auth |
|---|---|---|
| GET | `dashboard/stats/` | 🛠 |
| GET | `dashboard/analytics/` | 🛠 |
| GET | `export/<model_name>` | 🛠 (no trailing slash) |
| POST | `import/<model_name>` | 🛠 multipart CSV or XLSX |
| POST | `tracking/block-user/` | 🛠 |
| CRUD | `dev-feedback/` | 👤 or 🛠 |

---

## WebSockets

Connect to `VITE_WS_URL` (local `ws://localhost:8001/ws`, production `wss://<domain>/ws`) plus the path below. Authenticate with `?token=<access_jwt>`. Guests send `?guest_id=<id>` for chat.

| Path | Receives | Sends |
|---|---|---|
| `ws/order/<order_id>/` | `{id, status, updated_at}` on every save | — |
| `ws/product/<product_id>/` | product and variant status and stock updates | — |
| `ws/notifications/<user_id>/` | `send_notification` payloads (e.g. `new_order`) | — |
| `ws/chat/` (alias `ws/`) | `chat_message`, `user_status`, `typing_status`, `reaction_update` | messages, typing, reactions, presence requests (see `chat/consumers.py` `receive`) |
| `ws/live-insights/` | visitor updates (admin) | visitor heartbeats (storefront) |

## Contract change policy
1. Additive changes (new fields or endpoints) are safe.
2. Renaming or removing fields, or changing a lookup (for example slug vs id), breaks storefront submodules. Grep `admin-dashboard/src` and every `frontend/*` before you merge, and coordinate the release.
3. Regenerate `backend/schema.yaml` (`uv run python manage.py spectacular --file schema.yaml`) and update this map.
