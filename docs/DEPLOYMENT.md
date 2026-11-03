# Deployment and Environments

Step-by-step onboarding already exists in [../README.md](../README.md), [../ADD_FRONTEND.md](../ADD_FRONTEND.md) and [../docker_run_guide.md](../docker_run_guide.md). This page summarises how the environments work and the release checklist.

## 1. Environments

| Env | How it runs | Profile | Notes |
|---|---|---|---|
| Local | Docker Compose on a developer machine | `COMPOSE_PROFILES=local` | Vite hot reload for the storefront (`:5173`) and admin (`:5174`). `DEBUG=True`. |
| Local (bare) | `uv run python manage.py runserver` + `npm run dev` | — | SQLite fallback. Redis is needed for Channels and Celery. |
| Server (dev or prod) | Docker Compose on a VPS behind host Nginx | `COMPOSE_PROFILES=server` | Built Nginx images. `DEBUG=False`. `RESTART_POLICY=always`. |

Several clients on one VPS: each has its own folder, its own `.env` (or `.env.<client>`) and its own Compose project name (`-p <client>`), with unique `CLIENT_NAME` and ports.

```bash
docker compose --env-file .env.gurudeb -p gurudeb up -d --build
```

## 2. Environment variables (summary)

The full annotated list is in [../.env.example](../.env.example).

| Group | Variables |
|---|---|
| Identity and mode | `CLIENT_NAME`, `COMPOSE_PROFILES`, `RESTART_POLICY`, `UV_COMPILE_BYTECODE` |
| Database | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DB_PORT` (Compose builds `DATABASE_URL`) |
| Django | `SECRET_KEY`, `DEBUG`, `DOMAIN`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`, `BACKEND_URL`, `DEFAULT_FROM_EMAIL` |
| Ports | `BACKEND_PORT`, `WS_PORT`, `FRONTEND_PORT`, `ADMIN_PORT` |
| Frontend build | `VITE_API_URL`, `VITE_WS_URL`, `FRONTEND_CONTEXT`, `FRONTEND_VOLUME` |
| OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_SECRET`, `VITE_GOOGLE_CLIENT_ID` |
| Payments | `SSLCOMMERZ_IS_SANDBOX`, `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWD` |
| Email | `BREVO_API_KEY` (read in settings, **missing from `.env.example`**) |
| Internal (set by Compose) | `REDIS_URL`, `DATABASE_URL` |

## 3. First deploy for a new client
1. Clone the core repo into `/var/www/<client>`. Add the storefront submodule. Run `git submodule update --init --recursive`.
2. Create `.env` from `.env.example` with server values and unique ports.
3. `docker compose up -d --build`. The entrypoint migrates and runs collectstatic.
4. `docker compose exec backend_api uv run python manage.py createsuperuser`.
5. Load locations and seed data if needed (see [../docker_run_guide.md](../docker_run_guide.md)).
6. Nginx: copy the templates from `nginx/`, replace the domain and ports, enable the site, then `certbot --nginx -d … && nginx -t && systemctl reload nginx`.
7. Set up `StoreConfiguration` in admin → Web Configuration (name, logos, currency, payment toggles).
8. SSLCommerz: follow [../payment_guide.md](../payment_guide.md). Set the IPN URL to `https://<backend>/payment/sslcommerz/ipn/`.
9. Smoke test: storefront loads, login works, place a COD order, the admin receives a real-time notification, and the order email arrives.

## 4. Release checklist (updating a deployment)
- [ ] Back up the database: `docker exec -t ${CLIENT_NAME}_db pg_dumpall -c -U ${POSTGRES_USER} > backup_$(date +%Y%m%d_%H%M).sql`
- [ ] `git pull origin master` and `git submodule update --remote --merge`
- [ ] Read new migrations and check `.env.example` for new variables
- [ ] `docker compose up -d --build`
- [ ] `docker compose ps` shows everything running. `docker compose logs --tail=100 backend_api` shows no errors.
- [ ] Smoke test (see above). Check the WebSocket connection in the admin (notification bell, chat).

## 5. CI/CD
`.github/workflows/deploy.yml` runs on pushes to `dev` and `prod`:
1. Builds the backend image and the `./frontend` image (build only, no tests).
2. SSHes to the server, `git reset --hard origin/<branch>` in `~/sarker_dev` or `~/sarker_prod`, then `docker compose -f docker-compose.{dev,prod}.yml up -d --build`.
3. Health check: all Compose services are running.

⚠️ The workflow references `docker-compose.dev.yml` and `docker-compose.prod.yml` and a root `frontend/Dockerfile`, none of which exist in this repo any more. See [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

## 6. Operations cheatsheet
```bash
docker compose ps
docker compose logs -f backend_api            # or backend_ws, celery_worker (also runs beat)
docker compose exec backend_api uv run python manage.py prune_notifications --days 90   # manual cleanup
docker compose exec backend_api uv run python manage.py shell
docker compose restart backend_api backend_ws
docker compose exec db psql -U $POSTGRES_USER $POSTGRES_DB
```
