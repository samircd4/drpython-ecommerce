# Dr Python — Ecommerce Platform

A scalable SaaS ecommerce monorepo built by **Dr Python**. The Django backend and React admin dashboard are the core. Each client frontend is a separate Git submodule linked under `frontend/`.

---

## Repository Structure

```
drpython-ecommerce/
├── backend/              # Django API  (DRF + Daphne + Celery + WebSocket)
├── admin-dashboard/      # React admin panel
├── frontend/             # Client frontends live here as Git submodules
│   └── .gitkeep          # Placeholder — replaced by submodules per client
├── nginx/                # Nginx config templates for VPS
├── docker-compose.yml    # Single compose file for all envs and all clients
├── .env.example          # Full environment variable reference
└── ADD_FRONTEND.md       # Step-by-step guide: how to add a new client
```

---

## New Client Setup — Local Development

Follow these steps exactly every time you onboard a new client.

### Step 1 — Clone the Core Repository

```bash
git clone https://github.com/samircd4/drpython-ecommerce.git
cd drpython-ecommerce
```

---

### Step 2 — Add the Client Frontend as a Submodule

```bash
# Syntax: git submodule add <frontend-repo-url> frontend/<client-name>
git submodule add https://github.com/your-org/client-frontend.git frontend/client-name
git submodule update --init --recursive
```

> On a fresh clone of an existing deployment that already has submodules:
> ```bash
> git submodule update --init --recursive
> ```

---

### Step 3 — Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in the required values. At minimum:

| Variable | What to set |
|---|---|
| `CLIENT_NAME` | Short unique name, e.g. `sarker` — used as container prefix |
| `POSTGRES_DB` | Database name, e.g. `sarker_db` |
| `POSTGRES_USER` | DB username |
| `POSTGRES_PASSWORD` | Strong password |
| `SECRET_KEY` | Generate one (see below) |
| `FRONTEND_VOLUME` | Path to submodule: `./frontend/client-name` |
| `FRONTEND_CONTEXT` | Same path: `./frontend/client-name` |
| `COMPOSE_PROFILES` | `local` for development |

**Generate a Django secret key:**
```bash
uv run python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

### Step 4 — Build and Start All Services

Docker handles PostgreSQL, Redis, the backend, Celery, and the frontend automatically.

```bash
docker compose up -d --build
```

This starts:
- `postgres` database
- `redis` cache and message broker
- `backend_api` — Django/Daphne HTTP server
- `backend_ws` — Django/Daphne WebSocket server
- `celery_worker` — background task worker
- `frontend_local` — client frontend with hot-reload (Vite)
- `admin_local` — admin dashboard with hot-reload (Vite)

**Check all containers are running:**
```bash
docker compose ps
```

**View logs:**
```bash
docker compose logs -f backend_api
```

---

### Step 5 — Run Database Migrations

```bash
docker compose exec backend_api uv run python manage.py migrate
```

---

### Step 6 — Create a Superuser

```bash
docker compose exec backend_api uv run python manage.py createsuperuser
```

---

### Step 7 — Collect Static Files

```bash
docker compose exec backend_api uv run python manage.py collectstatic --noinput
```

---

### Step 8 — Access the Application

| Service | URL |
|---|---|
| Client Frontend | <http://localhost:5173> (hot-reload ✅) |
| Admin Dashboard | <http://localhost:5174> (hot-reload ✅) |
| Backend API | <http://localhost:8000> |
| Django Admin | <http://localhost:8000/admin/> |
| API Docs | <http://localhost:8000/docs/> |

---

## New Client Setup — VPS / Production Server

### Step 1 — Clone and Configure

```bash
cd /var/www/<client-name>
git clone https://github.com/samircd4/drpython-ecommerce.git .
git submodule add https://github.com/your-org/client-frontend.git frontend/client-name
git submodule update --init --recursive

cp .env.example .env
nano .env
```

Set these values differently from local:

| Variable | Server value |
|---|---|
| `COMPOSE_PROFILES` | `server` |
| `RESTART_POLICY` | `always` |
| `UV_COMPILE_BYTECODE` | `1` |
| `DEBUG` | `False` |
| `DOMAIN` | `myclient.shop` |
| `ALLOWED_HOSTS` | `myclient.shop,www.myclient.shop` |
| `CSRF_TRUSTED_ORIGINS` | `https://myclient.shop` |
| `FRONTEND_URL` | `https://myclient.shop` |
| `VITE_API_URL` | `https://myclient.shop` |
| `VITE_WS_URL` | `wss://myclient.shop/ws` |
| `FRONTEND_PORT` | `8081` |
| `ADMIN_PORT` | `8082` |
| `BACKEND_PORT` | `8001` |
| `WS_PORT` | `8011` |

### Step 2 — Build and Start

```bash
docker compose up -d --build
```

### Step 3 — First-Time Server Initialisation

```bash
docker compose exec backend_api uv run python manage.py migrate
docker compose exec backend_api uv run python manage.py createsuperuser
docker compose exec backend_api uv run python manage.py collectstatic --noinput
```

---

## Updating an Existing Deployment

```bash
# Pull latest backend/admin changes
git pull origin master

# Pull latest frontend changes
git submodule update --remote --merge

# Rebuild and restart
docker compose down
docker compose up -d --build

# Apply any new migrations
docker compose exec backend_api uv run python manage.py migrate
```

> ⚠️ **Always back up the database before updating on production:**
> ```bash
> docker exec -t ${CLIENT_NAME}_db pg_dumpall -c -U ${POSTGRES_USER} > backup_$(date +%Y%m%d_%H%M).sql
> ```

---

## Installing New Python Packages

Always use `uv` inside the `backend/` directory where `pyproject.toml` lives:

```bash
cd backend
uv add <package-name>
```

Then rebuild the Docker image:

```bash
docker compose up -d --build backend_api backend_ws celery_worker
```

---

## Useful Commands

```bash
# View running containers
docker compose ps

# Stream logs from a service
docker compose logs -f backend_api
docker compose logs -f frontend_local

# Django shell
docker compose exec backend_api uv run python manage.py shell

# Run a specific migration
docker compose exec backend_api uv run python manage.py migrate <app_name>

# Create a new Django app
docker compose exec backend_api uv run python manage.py startapp <app_name>

# Restart all services
docker compose restart

# Restart a single service
docker compose restart <service_name> (e.g. backend_api, frontend_local)

# Stop everything
docker compose down

# Stop and remove volumes (⚠️ deletes database data)
docker compose down -v

# Reapply environment changes (after modifying .env or .env.gurudeb)
docker compose down
docker compose up -d

# Or for custom client profiles:
docker compose --env-file .env.gurudeb -p gurudeb down
docker compose --env-file .env.gurudeb -p gurudeb up -d
```

---

## Nginx Setup (VPS)

```bash
# Copy config for the client domain
cp nginx/<template>.conf /etc/nginx/sites-available/<client.shop>
ln -s /etc/nginx/sites-available/<client.shop> /etc/nginx/sites-enabled/

# Issue SSL certificate
certbot --nginx -d <client.shop> -d www.<client.shop> -d admin.<client.shop>

# Test and reload
nginx -t && systemctl reload nginx
```

---

## Running Two Clients on the Same VPS

Use a different `CLIENT_NAME` and unique port numbers for each client's `.env`:

| Variable | Client A | Client B |
|---|---|---|
| `CLIENT_NAME` | `sarker` | `gurudeb` |
| `DB_PORT` | `5433` | `5434` |
| `BACKEND_PORT` | `8001` | `8002` |
| `WS_PORT` | `8011` | `8012` |
| `FRONTEND_PORT` | `8081` | `8083` |
| `ADMIN_PORT` | `8082` | `8084` |
