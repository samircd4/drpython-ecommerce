# Dr Python — Ecommerce Platform

A scalable SaaS ecommerce monorepo built by **Dr Python**. The core backend and admin dashboard live here. Each client frontend is linked as a separate Git submodule under the `frontend/` directory.

> For full instructions on connecting a client frontend, see [ADD_FRONTEND.md](./ADD_FRONTEND.md).

---

## Repository Structure

```
drpython-ecommerce/
├── backend/              # Django REST API (DRF + Daphne + Celery)
├── admin-dashboard/      # React admin panel
├── frontend/             # Empty — client frontends are added as submodules here
│   └── .gitkeep
├── nginx/                # Nginx config templates
├── docker-compose.yml    # Single unified compose file (all environments)
├── .env.example          # Environment variable template
└── ADD_FRONTEND.md       # Guide: how to add a client frontend
```

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/samircd4/drpython-ecommerce.git
cd drpython-ecommerce
```

### 2. Add a client frontend submodule
```bash
git submodule add <frontend-repo-url> frontend/<client-name>
git submodule update --init --recursive
```

### 3. Configure environment
```bash
cp .env.example .env
nano .env   # Fill in all values — especially CLIENT_NAME and FRONTEND_CONTEXT
```

### 4. Start services
```bash
docker compose up -d --build
```

---

## Docker Compose

This project uses a **single `docker-compose.yml`** for all environments and all clients.
Behaviour is controlled entirely by variables in `.env`.

| Mode | Key `.env` settings |
|------|---------------------|
| **Local dev** | `RESTART_POLICY=no`, `DEBUG=True`, `FRONTEND_IMAGE=node:20-alpine`, hot-reload enabled |
| **Server (staging/prod)** | `RESTART_POLICY=always`, `DEBUG=False`, `FRONTEND_IMAGE=` (blank → build from Dockerfile) |

No more separate `local`, `dev`, or `prod` compose files.

---

## Environment Setup

```bash
cp .env.example .env
nano .env
```

Key variables to set for every new client deployment:

| Variable | Description |
|---|---|
| `CLIENT_NAME` | Unique prefix for Docker containers (e.g. `sarker`, `gurudeb`) |
| `FRONTEND_CONTEXT` | Path to the client submodule (e.g. `./frontend/sarker-shop`) |
| `FRONTEND_VOLUME` | Same path — used for local hot-reload volume mount |
| `POSTGRES_DB` | Database name for this client |
| `DOMAIN` | Client domain (e.g. `myclient.shop`) |
| `SECRET_KEY` | Django secret key (generate one per client) |

See `.env.example` for the full reference with both local and server configurations.

---

## VPS Deployment

### First-Time Setup
```bash
cd /var/www/<client-name>
git clone https://github.com/samircd4/drpython-ecommerce.git .
git submodule update --init --recursive
cp .env.example .env
nano .env   # Set SERVER mode variables and client-specific values
docker compose up -d --build
docker compose exec backend_api python manage.py migrate
docker compose exec backend_api python manage.py createsuperuser
docker compose exec backend_api python manage.py collectstatic --noinput
```

### Update After Code Change
```bash
git pull origin master
git submodule update --remote --merge
docker compose down
docker compose up -d --build
```

> ⚠ **Always backup the database before updating on production:**
>
> ```bash
> docker exec -t <CLIENT_NAME>_db pg_dumpall -c -U <POSTGRES_USER> > backup_$(date +%Y%m%d).sql
> ```

---

## Nginx Setup

Copy the relevant Nginx config from the `nginx/` folder for your client domain:

```bash
# Replace <client.shop> with the actual domain
cp nginx/<client.shop>.conf /etc/nginx/sites-available/<client.shop>
ln -s /etc/nginx/sites-available/<client.shop> /etc/nginx/sites-enabled/

# SSL with Certbot
certbot --nginx -d <client.shop> -d admin.<client.shop>

# Test and reload
nginx -t && systemctl reload nginx
```

---

## Local Development

```bash
cp .env.example .env
# Set FRONTEND_IMAGE=node:20-alpine and other LOCAL mode variables
docker compose up -d --build
```

| Service | URL |
|---|---|
| Frontend | <http://localhost:5173> (hot-reload ✅) |
| Backend API | <http://localhost:8000> |
| Admin Dashboard | <http://localhost:5174> |
| Django Admin | <http://localhost:8000/admin/> |

---

## Useful Commands

```bash
# View backend logs
docker compose logs -f backend_api

# Run Django shell
docker compose exec backend_api python manage.py shell

# Run migrations
docker compose exec backend_api python manage.py migrate

# Collect static files
docker compose exec backend_api python manage.py collectstatic --noinput

# Sync submodules after a pull
git submodule update --init --recursive
```
