# Known Issues and Tech Debt

These were found while reading the code on 2026-11-03. Agents should **not** silently "fix" them as a side effect of an unrelated task. Raise them, or fix them in a dedicated change.

Severity: 🔴 high · 🟠 medium · 🟡 low

## Security

| # | Sev | Issue | Where | Suggested fix |
|---|---|---|---|---|
| S1 | 🔴 | `.env.gurudeb` is **tracked in git** and may contain live credentials. `backend/youtube_cookies.txt` (removed with Live TV) is still in git history. | repo root | Rotate any secrets they contain. `git rm --cached .env.gurudeb`. Add it to `.gitignore`. Consider history rewriting. |
| S2 | 🔴 | `SECRET_KEY` falls back to a hardcoded insecure value, and `DEBUG` defaults to `True` when unset. | `backend/ecommerce_api/settings.py` | Fail fast when `SECRET_KEY` is missing and `DEBUG` is false. Default `DEBUG` to `False`. |
| S3 | 🟠 | `CORS_ALLOW_ALL_ORIGINS = True` together with `CORS_ALLOW_CREDENTIALS = True`, so every origin is reflected with credentials. The `CORS_ALLOWED_ORIGINS` list is ignored. | settings | Build allowed origins from env (`FRONTEND_URL`, admin URL) and set `CORS_ALLOW_ALL_ORIGINS` only when `DEBUG`. |
| S4 | 🟠 | `ALLOWED_HOSTS` default includes `*`. | settings | Require it from env in production. |
| S5 | 🟠 | Admin JWTs live in `localStorage` (XSS-exposed). Refresh tokens don't rotate and aren't blacklisted. | `admin-dashboard/src/api/axiosConfig.js`, `SIMPLE_JWT` | Consider rotation and blacklist. Keep a strict dependency policy. |
| S6 | 🟡 | `orders/<id>/initiate-payment/` is AllowAny with sequential IDs, so anyone can start a payment session for any unpaid order. | `orders/views.py` | Require an ownership token (order UUID or guest token) or authentication. |
| S7 | 🟡 | Chat WebSocket code still `print`s to logs (`chat/middleware.py` now uses `logging`). | `chat/consumers.py`, `asgi.py` | Use `logging` at DEBUG level. |

## Multi-client and branding

| # | Sev | Issue | Where |
|---|---|---|---|
| B1 | 🟠 | "Sarker Shop" is hardcoded in the account email templates (`password_reset_email`, `verification_email`, `welcome_email`; order emails use `StoreConfiguration`) and in: `DEFAULT_FROM_EMAIL`, `SERVER_EMAIL`, `SPECTACULAR_SETTINGS.TITLE`, `REST_AUTH` cookie names, WebP EXIF artist, CORS and CSRF defaults. | `settings.py`, `utils/images.py` |
| B2 | 🟠 | Delivery charge rules are hardcoded for Kishoreganj. | `orders/models.py` `Order.get_delivery_charge` |
| B3 | 🟡 | The SSLCommerz fallback customer email uses `@gurudebenterprise.com`, and `BACKEND_URL` falls back to `gurudebenterprise.com`. | `orders/sslcommerz.py`, settings |
| B4 | 🟡 | The admin's axios fallback base URL is `https://sarker.shop`. | `admin-dashboard/src/api/axiosConfig.js` |

## Infra and CI

| # | Sev | Issue |
|---|---|---|
| I1 | 🟠 | `.github/workflows/deploy.yml` uses `docker-compose.dev.yml` and `docker-compose.prod.yml` and builds `./frontend`. None of these exist, so the workflow will fail. It is also Sarker-specific. |
| I2 | 🟡 | `BREVO_API_KEY` is used but not documented in `.env.example`. |
| I3 | 🟡 | The backend image installs Playwright and Chromium just to render invoice PDFs (`utils/pdf.py`), which makes the image much larger. A lighter PDF renderer would shrink it. |
| I4 | 🟡 | `backend/README.md` and `backend/docs/API_DOCUMENTATION.md` say the base URL is `/api`. Django has no such prefix (Nginx adds it). |

## Code quality

| # | Sev | Issue | Where |
|---|---|---|---|
| C1 | 🟡 | `payments` router is registered twice with different basenames. | `orders/urls.py` |
| C2 | 🟡 | `ProductViewSet` defines the queryset twice (class attribute and `get_queryset`). | `products/views.py` |
| C3 | 🟠 | Tests are stale and fail: `products`, `orders` and `accounts` tests call `/api/...` URLs (no such prefix), look up products by ID instead of slug, and pass divisions as strings. They also need Redis, or an in-memory channel layer, because signals broadcast. `api`, `chat`, `reviews` and `web` have placeholder tests only. There are no frontend tests. | `*/tests.py` |
| C4 | 🟡 | Order emails run as Celery tasks (`orders/tasks.py`), but account emails (verification, password reset, welcome) are still sent synchronously. | `accounts/adapters.py`, `accounts/views.py` |
| C5 | 🟡 | Several admin pages are built but their routes are commented out (Analytics, Overview, Insights, DataManagement, DevFeedback). | `admin-dashboard/src/App.jsx`, `Sidebar.jsx` |
| C6 | 🟡 | Duplicate location JSON files exist at both `backend/*.json` and `backend/data/*.json`. | |
| C7 | 🟡 | Stray files: `admin-dashboard/original_orders*.txt`, `backend/profile_fix_tasks.md`, `backend/products.json`. | |
