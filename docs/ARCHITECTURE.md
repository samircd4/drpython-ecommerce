# Architecture

## 1. System overview

```
                         ┌──────────────────────── VPS (one per N clients) ────────────────────────┐
                         │                                                                          │
 Browser ──HTTPS──▶ Cloudflare (optional) ──▶ Host Nginx (TLS via Certbot)                          │
                         │      │ client.com          │ admin.client.com        │ api / /ws          │
                         │      ▼                     ▼                         ▼                    │
                         │  {CLIENT}_frontend    {CLIENT}_admin         {CLIENT}_backend_api :8000   │
                         │  (Nginx static,       (Nginx static,         {CLIENT}_backend_ws  :8001   │
                         │   React storefront)    React admin)           (Daphne, ASGI: HTTP + WS)   │
                         │      │ /media /static served from shared volumes     │                   │
                         │      └──────────────────────────────┬────────────────┘                   │
                         │                                     ▼                                    │
                         │              {CLIENT}_db (PostgreSQL 15)   {CLIENT}_redis                │
                         │                                     ▲        ▲  channel layer + broker   │
                         │                                     └── {CLIENT}_celery (worker)         │
                         └──────────────────────────────────────────────────────────────────────────┘
 External: SSLCommerz (payments, callbacks to backend), Brevo (email), Google / Facebook OAuth
```

Each client is an isolated Compose project: its own containers (prefixed with `CLIENT_NAME`), database volume, media volume and ports. Clients share nothing except the host Nginx and the code version.

## 2. Repository topology

```
drpython-ecommerce (core repo, branch master)
├── backend/           ─┐ shared by all clients
├── admin-dashboard/   ─┘
└── frontend/
    └── <client>/      ← git submodule → client's own storefront repo
```

Per-client deployment = core checkout + one submodule + one `.env` (or `.env.<client>` used with `--env-file` and `-p <client>`).

## 3. Backend architecture

### 3.1 Layers
```
URL (api/urls.py → app urls.py, DefaultRouter)
  → ViewSet (permissions, get_queryset scoping, filters, @action endpoints)
    → Serializer (validation, nested writes, computed fields)
      → Model (business methods: Order.grand_total, Order.get_delivery_charge, Product.save → slug/WebP)
        → Signals (post_save → WebSocket broadcast, Notification rows, emails)
          → Channel layer (Redis) → Consumers → connected clients
```

### 3.2 Django apps and responsibilities

| App | Owns | Talks to |
|---|---|---|
| `accounts` | Auth endpoints, `Customer`, `Address`, BD locations, users, groups, permissions | allauth, SimpleJWT, `utils.emails` |
| `products` | Catalog (Category tree, Brand, Product, Variant, Spec, Image) | `utils.images`, product WS |
| `orders` | Cart, Checkout, Order, OrderItem, OrderStatus, PaymentInfo, Coupon, SSLCommerz | `products`, `accounts`, `web.Notification`, `utils.emails`, `utils.pdf` |
| `reviews` | Review, ReviewImage, Question | `products` (rating and count denormalised) |
| `web` | StoreConfiguration singleton, ContactMessage, Newsletter, Notification, TimezoneMiddleware | everyone reads config |
| `chat` | Conversation, Message, WS auth middleware | `accounts.Customer` |
| `notifications` | WS consumer only | groups `notifications_<user_id>` |
| `tracking` | Live visitor consumer, block list | admin Insights |
| `api` | URL hub, analytics, import and export, shared permissions, management commands | all |
| `dev_feedback` | Internal issue tracker | — |
### 3.3 Request flow: guest checkout with online payment

```
Storefront                       Backend                                    SSLCommerz
   │ POST /cart/ (session cookie)   │ CartViewSet._get_cart → Cart(session_key) │
   │ POST /orders/validate-coupon/  │ Coupon.is_valid…                          │
   │ POST /orders/                  │ OrderSerializer.create                    │
   │                                │  → OrderItems, delivery charge, totals    │
   │                                │  → post_save signal: WS to order_<id>,    │
   │                                │    staff notifications, order email       │
   │ POST /orders/<id>/initiate-payment/ → SSLCommerzClient.initiate_payment ─▶ │ session
   │ ◀──── {payment_url} ───────────│                                           │
   │ ── browser redirect ──────────────────────────────────────────────────────▶│ pay
   │                                │ ◀── POST /payment/sslcommerz/success|ipn ─│
   │                                │  validate via validation API ────────────▶│
   │                                │  PaymentInfo.is_paid = True, save         │
   │ ◀── 302 to FRONTEND_URL/... ───│                                           │
```

### 3.4 Real-time flow

```
Order.save() ─▶ orders/signals.py ─▶ channel_layer.group_send("order_<id>")            ─▶ OrderConsumer ─▶ tracking page
                                  └▶ group_send("notifications_<staff_id>") (on create) ─▶ NotificationConsumer ─▶ admin bell
                                  └▶ Notification.objects.create(...) (status change)   ─▶ customer notifications list
Chat: client WS (ws/chat/?token=… | ?guest_id=…) ─▶ TokenAuthMiddleware ─▶ ChatConsumer.receive ─▶ save_message ─▶ group_send ─▶ all participants
```

WebSocket auth: the JWT is passed as the `?token=` query parameter, decoded with `SIMPLE_JWT.SIGNING_KEY`, and `scope['user']` is set. Without a token the user is `AnonymousUser`, and `guest_id` comes from the query.

### 3.5 Background processing
- Celery app: `ecommerce_api/celery.py` (autodiscovers `tasks.py`). Broker: Redis. Results: `django_celery_results`.
- Today most side effects run synchronously in signals. Moving email, PDF and import work to Celery is on the [ROADMAP](ROADMAP.md).

## 4. Admin dashboard architecture

```
main.jsx → BrowserRouter → AuthProvider → App
App → ModalProvider → ChatProvider → NotificationProvider → StatsProvider → AppContent
AppContent: if !user → Login/Register/ForgotPassword
            else Header + Sidebar + <Routes> (each wrapped in ProtectedRoute requiredPermission)
            + GlobalModals (Brand/Category/Coupon/Address/Order) + MobileFAB + Toaster
```

- **HTTP:** a single `api` axios instance (`src/api/axiosConfig.js`). It attaches `Bearer access_token` from `localStorage` and retries once after `POST /auth/refresh/` on 401.
- **Auth state:** `AuthContext` loads `/customers/me/`, rejects users who are not staff, and exposes `user` and `hasPermission(codename)`.
- **Cross-component refresh:** the `window` CustomEvent `refreshData`. The `toggleLayout` event hides the chrome (full-screen views).
- **Real-time hooks:** `useChatSocket`, `useNotificationSocket`, `useVisitorTrackingData`, using URLs from `config/appConfig.js`.
- **Store branding:** `useStoreConfig` → `GET /configuration/`.

## 5. Storefront architecture (per client)
- A separate repo with its own design system. It consumes the same REST and WS API.
- Build-time env: `VITE_API_URL`, `VITE_API_BASE_URL`, `VITE_WS_URL`, `VITE_GOOGLE_CLIENT_ID` (passed as Docker build args in the server profile).
- The server profile builds a static Nginx image from the submodule's `Dockerfile`.

## 6. Deployment topology

| Container | Local profile | Server profile |
|---|---|---|
| `redis`, `db`, `backend_api`, `backend_ws`, `celery_worker` | yes | yes |
| `frontend_local`, `admin_local` (node:20-alpine, Vite dev and hot reload) | yes | — |
| `frontend_server`, `admin_server` (built Nginx images) | — | yes |

The backend entrypoint waits for Postgres, runs `migrate`, runs `collectstatic` when `DEBUG=False`, then starts Daphne.

Host Nginx templates are in `nginx/` (Gurudeb example):

| Host | Location | Upstream |
|---|---|---|
| `client.com` | `/api/` | `BACKEND_PORT`. The trailing slash strips `/api/`, so the storefront calls `https://client.com/api/products/` and Django sees `/products/`. |
| `client.com` | `/ws/` | `WS_PORT` (upgrade headers) |
| `client.com` | `/admin/`, `/static/` | `BACKEND_PORT` |
| `client.com` | `/media/`, `/` | `FRONTEND_PORT` (frontend Nginx serves the shared media volume) |
| `api.client.com` | `/`, `/ws/`, `/static/`, `/media/` | same upstreams, without the prefix |
| `admin.client.com` | `/` | `ADMIN_PORT` |

Details: [DEPLOYMENT.md](DEPLOYMENT.md).

## 7. Key design decisions

| Decision | Rationale |
|---|---|
| Single core plus storefront submodules | Each client gets a unique design. Backend and admin improvements ship to everyone. |
| One deployment per client (no multi-tenancy) | Simple data isolation, independent scaling and upgrades, no tenant leaks |
| Daphne for both HTTP and WS, split into two containers | One ASGI app. WS load is isolated from the API in production. |
| JWT in `localStorage` (admin) | Simple cross-domain auth between the `admin.` subdomain and the API. The trade-off is XSS exposure, so keep dependencies trusted and avoid `dangerouslySetInnerHTML`. |
| Django permissions as the RBAC source | Reuses `auth.Group` and `Permission`. The admin UI mirrors codenames directly. |
| Signals for side effects | Keeps views thin. The cost is hidden coupling, so document new signals. |
