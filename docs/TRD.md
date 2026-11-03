# Technical Requirements Document (TRD)

Companion to [PRD.md](PRD.md). It describes how the system must be built and behave.

---

## 1. Technology stack (fixed)

| Layer | Choice | Version (from lockfiles) |
|---|---|---|
| Language (backend) | Python | ≥ 3.13 |
| Package manager | uv (`pyproject.toml`, `uv.lock`) | — |
| Web framework | Django and Django REST Framework | 5.2.x / 3.16.x |
| Auth | SimpleJWT, dj-rest-auth, django-allauth (Google, Facebook) | — |
| ASGI server | Daphne (serves both HTTP and WebSocket) | ≥ 4.1 |
| Real-time | Django Channels and channels-redis | ≥ 4.0 |
| Background jobs | Celery (Redis broker, `django-db` result backend) | ≥ 5.3 |
| Database | PostgreSQL (SQLite fallback for bare local runs) | 15 |
| Cache and broker | Redis | alpine |
| API schema | drf-spectacular (OpenAPI 3) | ≥ 0.29 |
| Email | django-anymail with Brevo | — |
| Images | Pillow and piexif (WebP output) | — |
| Admin frontend | React, Vite, Tailwind CSS v4, React Router | 19 / 7 / 4 / 7 |
| Storefront | React, Vite, Tailwind v4 (DaisyUI for Gurudeb) | per client |
| Containers | Docker Compose (profiles `local` and `server`) | — |
| Edge | Host Nginx with Certbot (Let's Encrypt), optionally behind Cloudflare | — |

Do not introduce a competing library (for example Redux, another HTTP client, another CSS framework, or Poetry or pip) without an explicit decision.

## 2. Functional technical requirements

### 2.1 API
- REST and JSON. All app URLs mount at the root (`/products/`, `/orders/`). There is **no `/api/` prefix**.
- Trailing slashes are required (Django default).
- Pagination: `PageNumberPagination`, `PAGE_SIZE=20`.
- Filtering: `?field=value` (django-filter), `?search=` and `?ordering=`.
- Products are looked up by **slug** (`/products/<slug>/`). Other resources use numeric IDs.
- Multipart uploads are accepted (`MultiPartParser`) for images and import files.
- OpenAPI schema at `/schema/`. Swagger at `/docs/` (requires login). ReDoc at `/redoc/`.

### 2.2 Authentication and authorisation
- Primary: `Authorization: Bearer <access>` JWT. Access token lasts 1 day, refresh token 7 days, HS256 signed with `SECRET_KEY`.
- Session and Basic auth are also enabled, for the browsable API and Django admin.
- Social login: `POST /auth/google/` and `/auth/facebook/` exchange the provider token for a JWT.
- WebSocket auth: `chat.middleware.TokenAuthMiddleware` reads the JWT from the query string (`?token=`).
- Authorisation model:
  - Superuser: everything.
  - Staff: all safe methods. Writes need the matching Django permission (`<app>.add|change|delete_<model>`) through `api.permissions.StaffHasActionPermission`.
  - Customer: only their own resources (`get_queryset` filtering).
  - Anonymous: catalog reads, cart, order creation, coupon validation, payment initiation, contact and newsletter.
- Admin dashboard access is limited to `is_staff` or `is_superuser` (enforced client-side in `AuthContext` and server-side by permissions).

### 2.3 Guest identity
- Guest **cart**: Django session key (`Cart.session_key`). Requests must send cookies (`withCredentials`), and CORS allows credentials.
- Guest **chat**: a client-generated `guest_id`, sent as the `X-Guest-ID` header or the `?guest_id=` query parameter (REST), and as `?guest_id=` on the WebSocket URL. The header is allowed in CORS headers.

### 2.4 Payments (SSLCommerz)
- `orders/sslcommerz.py` → `SSLCommerzClient` with sandbox and live toggles (`SSLCOMMERZ_IS_SANDBOX`).
- Transaction ID format: `ORD<order_id>-<8 hex>`.
- Callbacks: `/payment/sslcommerz/{success,fail,cancel,ipn}/`. They **must** validate server-side through the validation API before marking an order paid, and must be idempotent (the IPN and success callbacks can both arrive).
- `BACKEND_URL` must be the public HTTPS URL in production. See [../payment_guide.md](../payment_guide.md).

### 2.5 Real-time
| Channel | Path | Group | Producer |
|---|---|---|---|
| Order status | `ws/order/<id>/` | `order_<id>` | `orders/signals.py` on `Order` save |
| Product status and stock | `ws/product/<id>/` | `product_<id>` | `products/signals.py` |
| Notifications | `ws/notifications/<user_id>/` | `notifications_<user_id>` | order signals (new order → all staff) |
| Chat | `ws/chat/` or `ws/` | per conversation | `chat/consumers.py` |
| Visitor insights | `ws/live-insights/` | tracking group | `tracking/consumers.py` |

The channel layer is Redis (`capacity=1500`, `expiry=10`). In production, WebSockets run in a separate Daphne container (`backend_ws`).

### 2.6 Background jobs and email
- The Celery worker container exists (`celery_worker`). Emails are currently sent from `utils/emails.py`, called by signals. New slow work (email, PDF, imports and image downloads) should become Celery tasks in `<app>/tasks.py`.
- Email templates live in `backend/templates/emails/`.

### 2.7 Files and media
- Uploads go to `MEDIA_ROOT=backend/media` (Docker volume `backend_media`) with permission `0o644` so the Nginx containers can serve them.
- Static files: WhiteNoise `CompressedManifestStaticFilesStorage`. `collectstatic` runs on entrypoint when `DEBUG=False`.
- Product and category images are normalised to WebP (max 1200×1200, quality 85) with EXIF metadata through `utils/images.py`.

### 2.8 Import and export
- `GET /export/<model_name>` and `POST /import/<model_name>` (CSV/XLSX through openpyxl) reuse the model serializers for validation (`services/`).

## 3. Non-functional requirements

| Category | Requirement |
|---|---|
| Performance | Catalog list p95 under 500 ms at 20 items per page. Use `select_related` and `prefetch_related` (see `ProductViewSet`). Avoid N+1 in serializers. |
| Scalability | Stateless API containers. Redis-backed channels. Several clients per VPS isolated by `CLIENT_NAME` and unique ports. |
| Availability | `RESTART_POLICY=always` on servers. The entrypoint waits for the database and auto-migrates. |
| Security | `DEBUG=False`, unique `SECRET_KEY`, HTTPS only (secure cookies when not in debug), `SECURE_PROXY_SSL_HEADER` for Nginx and Cloudflare, no secrets in git, server-side payment validation. See [KNOWN_ISSUES.md](KNOWN_ISSUES.md) for current gaps. |
| Data integrity | Monetary values in `Decimal`. `OrderItem.product` is `PROTECT`. `Address.division` is `PROTECT`. Order totals recomputed through `Order.update_total_amount()`. |
| Localisation | `TIME_ZONE=Asia/Dhaka`. Per-store timezone through `StoreConfiguration.timezone` (`TimezoneMiddleware`). Currency BDT (৳). |
| Observability | Container logs (`docker compose logs`). Python `logging` in payment code. No APM yet. |
| Testability | Django `APITestCase` per app. Run with `manage.py test`. |
| Browser support | Last 2 versions of Chrome, Edge, Firefox and Safari, plus Android Chrome. |
| Accessibility | Admin: keyboard-focusable controls, sufficient contrast on dark backgrounds. |

## 4. Environment configuration
All configuration is through environment variables (root `.env` loaded by Compose and by `settings.py` via python-dotenv). Reference: [`../.env.example`](../.env.example) and [DEPLOYMENT.md](DEPLOYMENT.md).

## 5. Constraints
- One codebase serves every client. Never fork the core per client.
- The storefront is a separate repo (submodule). The API contract is the integration boundary, so breaking changes need versioning or coordinated releases.
- The CI build for the frontend expects a `Dockerfile` in the submodule.
