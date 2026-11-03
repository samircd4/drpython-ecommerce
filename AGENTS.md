# AGENTS.md — Working Guide for AI Coding Agents

Read this first. It tells you how this repo is laid out, how to run it, and the rules to follow when you change code. Deeper docs live in [`docs/`](docs/README.md).

---

## 1. What this project is

**drpython-ecommerce** is a white-label ecommerce platform for small and mid-sized shops in Bangladesh, built by Dr Python. One core codebase (Django API and React admin dashboard) is deployed once per client. Each client gets its own storefront, which is a Git submodule under `frontend/<client>`.

Live clients referenced in the code: **Sarker Shop** (`sarker.shop`) and **Gurudeb Enterprise** (`gurudebenterprise.com`).

| Part | Path | Stack |
|---|---|---|
| Backend API, WebSockets and workers | `backend/` | Python 3.13, Django 5.2, DRF, SimpleJWT, Channels and Daphne, Celery, PostgreSQL 15, Redis |
| Admin dashboard | `admin-dashboard/` | React 19, Vite 7, Tailwind CSS 4, React Router 7, Axios, lucide-react, react-hot-toast, framer-motion |
| Client storefront | `frontend/<client>/` (submodule) | React 19, Vite, Tailwind 4 and DaisyUI (Gurudeb) |
| Infra | `docker-compose.yml`, `nginx/`, `.github/workflows/` | Docker Compose profiles `local` and `server`, host Nginx, Certbot |
| Tools | `tools/`, `scripts/` | Product import and location scripts, environment sync |

---

## 2. Commands

All backend Python commands use **uv**. Never use pip directly.

```bash
# Full stack (from repo root, .env present with COMPOSE_PROFILES=local)
docker compose up -d --build
docker compose logs -f backend_api

# Django management, inside Docker
docker compose exec backend_api uv run python manage.py migrate
docker compose exec backend_api uv run python manage.py makemigrations <app>
docker compose exec backend_api uv run python manage.py test <app>
docker compose exec backend_api uv run python manage.py seed_data

# Backend without Docker (falls back to SQLite when DATABASE_URL is unset)
cd backend && uv sync && uv run python manage.py runserver

# Add a Python dependency
cd backend && uv add <package>          # then rebuild backend_api, backend_ws, celery_worker

# Admin dashboard
cd admin-dashboard && npm install && npm run dev     # port 5173 locally, 5174 in Docker
npm run lint
npm run build
```

Local URLs: storefront `:5173`, admin `:5174`, API `:8000`, WebSocket `:8001`, Swagger `/docs/` (requires login), ReDoc `/redoc/`, Django admin `/admin/`.

---

## 3. Repo map (where things go)

```
backend/
  ecommerce_api/     settings.py, urls.py, asgi.py (WebSocket router), celery.py
  api/               URL hub (all app URLs mounted at root, no /api prefix),
                     analytics.py (dashboard stats), import/export views,
                     permissions.py (StaffHasActionPermission, IsReviewOwnerOrReadOnly),
                     management/commands (seed_data, sync_prod)
  accounts/          Customer profile, Address, Division/District/SubDistrict, auth views
                     (JWT, Google/Facebook), users, groups, permissions
  products/          Category (tree), Brand, Product, ProductVariant, ProductSpecification,
                     ProductImage. WebSocket ws/product/<id>/
  orders/            Cart, CartItem, Checkout, Order, OrderItem, OrderStatus, PaymentInfo,
                     Coupon, sslcommerz.py, signals (notifications and emails), ws/order/<id>/
  reviews/           Review, ReviewImage, Question (product Q&A)
  web/               StoreConfiguration (singleton), ContactMessage, Newsletter,
                     Notification, TimezoneMiddleware
  chat/              Conversation, Message (text/image/video, reactions, replies),
                     TokenAuthMiddleware for WebSockets, ws/chat/
  notifications/     ws/notifications/<user_id>/ consumer (no models)
  tracking/          live visitor tracking ws/live-insights/, block user
  dev_feedback/      internal bug and feedback tracker
  services/          import_service.py, export_service.py (CSV/XLSX)
  utils/             emails.py, images.py (WebP), pdf.py (invoice), import_geo.py
  templates/         emails/*.html, invoice.html, swagger_ui.html
admin-dashboard/src/
  App.jsx            all routes, wrapped in <ProtectedRoute requiredPermission="app.codename_model">
  api/axiosConfig.js the ONLY HTTP client (JWT header and 401 refresh)
  config/appConfig.js  env-derived URLs
  Context/           Auth, Chat, Modal, Notification, Stats providers
  hooks/             WebSocket hooks, useStoreConfig, useProductLink
  pages/             one file per route
  components/<Domain>/  tables, modals, layout pieces
```

---

## 4. Rules

### General
- Make the smallest change that solves the task. Match the style of the file you are in.
- Do not commit `.env`, real credentials, cookies, or database dumps.
- Do not rename or move apps, models, or URL paths. Storefront submodules and the admin both depend on them.
- Client-specific values (domain, brand name, phone numbers, delivery zones) belong in `.env` or in `StoreConfiguration`, not in code. Some legacy hardcoding exists (see [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md)). Do not add more.
- Money is `Decimal` (`DecimalField(max_digits=12, decimal_places=2)`). Never use float for amounts, except at the SSLCommerz payload boundary.
- Timezone is `Asia/Dhaka` (`USE_TZ=True`). Currency is BDT (৳).

### Backend
- New endpoints use DRF ViewSets with a `DefaultRouter` in the app's `urls.py`. Mount it in `api/urls.py` with `path('', include('<app>.urls'))`.
- Permissions: public reads use `AllowAny`. Writes from staff use `IsAdminUser` plus `StaffHasActionPermission`, which maps the HTTP method to Django `add_`, `change_` and `delete_` permissions. Customer-owned data is filtered in `get_queryset()` by `request.user.customer`.
- Pagination is global (`PageNumberPagination`, 20 per page). Responses are `{count, next, previous, results}`. The admin computes pages as `ceil(count / 20)`.
- Filtering uses `django-filter`, `SearchFilter` and `OrderingFilter`. Declare `filterset_fields`, `search_fields` and `ordering_fields`.
- Add `@extend_schema` on custom `@action`s so Swagger stays accurate.
- Side effects (notifications, emails, WebSocket broadcasts) go in `signals.py`. Register the signals in the app's `apps.py` `ready()`.
- Real-time: use `async_to_sync(get_channel_layer().group_send)(group, {'type': handler, ...})`. Group names are `order_<id>`, `product_<id>` and `notifications_<user_id>`.
- Images go through `utils/images.process_image_to_webp`.
- Every model change needs a migration. Run `makemigrations <app>` and commit it.
- Write tests in `<app>/tests.py` with `APITestCase`. Orders, products and accounts already have tests. Use them as patterns.

### Admin dashboard
- Use `api` from `src/api/axiosConfig.js` for every request. Do not create new axios instances or call `fetch` directly.
- Gate pages with `<ProtectedRoute requiredPermission="...">` in `App.jsx`. Gate buttons with `hasPermission('app.action_model')` from `useAuth()`.
- After a create or update made in a global modal, dispatch `window.dispatchEvent(new CustomEvent('refreshData'))`. List pages listen for it.
- Use `toast.success` and `toast.error` from `react-hot-toast` for feedback. Use `ConfirmModal` for destructive actions.
- Follow [`docs/DESIGN_GUIDE.md`](docs/DESIGN_GUIDE.md): dark navy theme, slate text, blue-600 primary, `rounded-xl` and `rounded-2xl`, lucide icons.
- Add new sidebar entries in `components/Layout/Sidebar.jsx` with the same permission as the route.

### Storefront submodules
- They are separate repos. Commit inside the submodule, then commit the updated pointer in the core repo. Do not edit them unless the task is about that client.

---

## 5. Before you finish

1. Backend: `uv run python manage.py check` and the tests for the apps you touched both pass. `makemigrations --check` shows no missing migrations.
2. Admin: `npm run lint` and `npm run build` pass.
3. If you changed an API contract, update [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) and check `admin-dashboard/src` and the storefront for callers.
4. If you added an environment variable, add it to `.env.example` with a comment.

---

## 6. Doc index

| Doc | Use it for |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product goals, users, scope |
| [docs/TRD.md](docs/TRD.md) | Technical requirements and constraints |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System diagram, request and real-time flows, deployment topology |
| [docs/FEATURES.md](docs/FEATURES.md) | Feature catalogue with status and code locations |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Models and relationships |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | Endpoint map, auth, WebSockets |
| [docs/DESIGN_GUIDE.md](docs/DESIGN_GUIDE.md) | Admin UI tokens, components, patterns |
| [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) | Conventions and recipes |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Environments, env vars, release steps |
| [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) | Tech debt and security gaps to be aware of |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Planned and suggested work |
