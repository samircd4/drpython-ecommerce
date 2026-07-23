# 🐳 Running drpython-ecommerce Locally with Docker

> This is the **gurudeb** client setup. Your `.env` is already configured for local dev.

---

## Prerequisites

Make sure these are installed:

| Tool | Check |
|------|-------|
| Docker Desktop (running) | `docker --version` |
| Docker Compose V2 | `docker compose version` |
| Git | `git --version` |

---

## Step 1 — Verify your `.env` is correct for local

Your [.env](file:///f:/dummy/drpython-ecommerce/.env) is already set up. Confirm these key values are correct:

```env
COMPOSE_PROFILES=local        # ← must be "local" for hot-reload dev
RESTART_POLICY=no

BACKEND_PORT=8002             # API → http://localhost:8002
WS_PORT=8012                  # WebSocket → ws://localhost:8012
FRONTEND_PORT=5175            # Frontend → http://localhost:5175
ADMIN_PORT=5176               # Admin → http://localhost:5176
DB_PORT=5434                  # Postgres exposed on 5434

VITE_API_URL=http://localhost:8002
VITE_WS_URL=ws://localhost:8012/ws

FRONTEND_CONTEXT=./frontend/gurudeb
FRONTEND_VOLUME=./frontend/gurudeb
```

> [!IMPORTANT]
> The `FRONTEND_VOLUME` must point to the actual frontend source folder (`./frontend/gurudeb`) — it's bind-mounted into the Node container for hot-reload. Confirm this folder exists.

---

## Step 2 — Build & start all services

Open a terminal in the project root `f:\dummy\drpython-ecommerce` and run:

```powershell
docker compose up -d --build
```

Since `COMPOSE_PROFILES=local` is already in your `.env`, Docker Compose will automatically activate the `local` profile — which starts the **hot-reload** frontend (Node/Vite) instead of the built Nginx image.

This starts:

| Container | Role | URL |
|-----------|------|-----|
| `gurudeb_db` | PostgreSQL 15 | `localhost:5434` |
| `gurudeb_redis` | Redis (cache/WS) | internal |
| `gurudeb_backend_api` | Django Daphne API | `localhost:8002` |
| `gurudeb_backend_ws` | Django Daphne WebSocket | `localhost:8012` |
| `gurudeb_celery` | Celery worker | internal |
| `gurudeb_frontend` | Vite dev server (hot-reload) | `localhost:5175` |
| `gurudeb_admin` | Vite admin dashboard | `localhost:5176` |

---

## Step 3 — Wait for migrations to finish

The backend runs migrations automatically on startup. Check the logs:

```powershell
docker compose logs -f backend_api
```

You should see:
```
Waiting for database...
Applying database migrations...
Starting server with daphne...
```

Once you see **daphne** started, the API is ready.

---

## Step 4 — Create a superuser (first time only)

```powershell
docker compose exec backend_api uv run python manage.py createsuperuser
```

Follow the prompts to set username, email, and password.

---

## Step 5 — Load initial data (optional)

If the project has fixture data (products, locations):

```powershell
# Load location data (divisions, districts, sub-districts)
docker compose exec backend_api uv run python manage.py loaddata division.json
docker compose exec backend_api uv run python manage.py loaddata district.json
docker compose exec backend_api uv run python load_locations.py

# Load sample products
docker compose exec backend_api uv run python manage.py loaddata products.json
```

---

## Step 6 — Open in browser

| Service | URL |
|---------|-----|
| **Frontend (Shop)** | http://localhost:5175 |
| **Admin Dashboard** | http://localhost:5176 |
| **Django Admin** | http://localhost:8002/admin |
| **API Root** | http://localhost:8002/api/ |

---

## Useful commands

```powershell
# View logs of all services
docker compose logs -f

# View logs of a specific service
docker compose logs -f backend_api
docker compose logs -f frontend_local

# Stop everything (keeps data)
docker compose down

# Stop and REMOVE all data (fresh start)
docker compose down -v

# Rebuild only one service after code changes to backend
docker compose up -d --build backend_api

# Shell into backend
docker compose exec backend_api bash

# Run Django management commands
docker compose exec backend_api uv run python manage.py <command>

# Run migrations manually
docker compose exec backend_api uv run python manage.py migrate
```

---

## Troubleshooting

### Frontend can't reach the API (`CORS` / `net::ERR_CONNECTION_REFUSED`)
- Make sure `VITE_API_URL=http://localhost:8002` in `.env`
- Confirm `backend_api` container is running: `docker compose ps`

### Database connection error on backend startup
- The entrypoint script waits for Postgres — this is normal for a few seconds
- If it keeps failing: `docker compose logs db`

### Port already in use
- Change `BACKEND_PORT`, `FRONTEND_PORT` etc. in `.env` to free ports, then restart

### Frontend changes not hot-reloading
- The `CHOKIDAR_USEPOLLING=true` env var is already set for Windows compatibility
- If it still doesn't work, restart the frontend container:
  ```powershell
  docker compose restart frontend_local
  ```

### Want to use the production (built) profile instead?
Change `.env`:
```env
COMPOSE_PROFILES=server
RESTART_POLICY=always
```
Then rebuild:
```powershell
docker compose up -d --build
```
