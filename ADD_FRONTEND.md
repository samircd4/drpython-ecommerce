# Guide: Adding a Client Frontend Submodule

This guide explains how to set up a new client deployment on the **drpython-ecommerce** core monorepo, from cloning to running locally and deploying to a server.

---

## Step 1: Clone the Core Monorepo
```bash
git clone https://github.com/samircd4/drpython-ecommerce.git my-client-shop
cd my-client-shop
```

---

## Step 2: Add the Frontend as a Git Submodule
All client frontends live under the `frontend/` directory. Link the dedicated client frontend repository as a submodule:

```bash
# Syntax:
# git submodule add <frontend-repo-url> frontend/<client-name>

# Example for Sarker Shop:
git submodule add https://github.com/samircd4/sarker_shop_frontend.git frontend/sarker-shop
```

This clones the frontend repo into `frontend/<client-name>` and registers it in `.gitmodules`.

> **On a new server or fresh clone**, always run:
> ```bash
> git submodule update --init --recursive
> ```

---

## Step 3: Configure the Environment
There is a single `.env` file that controls everything — the mode (local/server), ports, client name, and which frontend submodule to use.

```bash
cp .env.example .env
```

Then edit `.env` and set **at minimum** these key variables:

| Variable | Description | Example |
|---|---|---|
| `CLIENT_NAME` | Prefix for all Docker containers | `sarker` |
| `POSTGRES_DB` | Database name | `sarker_shop` |
| `POSTGRES_USER` | DB user | `sarker_user` |
| `POSTGRES_PASSWORD` | DB password | `strong_password` |
| `FRONTEND_CONTEXT` | Path to the submodule you added | `./frontend/sarker-shop` |
| `FRONTEND_VOLUME` | Same path (for hot-reload mount) | `./frontend/sarker-shop` |
| `SECRET_KEY` | Django secret key | *(generate one)* |

---

## Step 4: Choose Your Mode

The **same `docker-compose.yml`** works for both local development and production. Just change a few variables in `.env`:

### Local Development
```env
RESTART_POLICY=no
DEBUG=True
UV_COMPILE_BYTECODE=0

DOMAIN=localhost
ALLOWED_HOSTS=*
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8001/ws

# Frontend hot-reload via node image:
FRONTEND_IMAGE=node:20-alpine
FRONTEND_COMMAND=sh -c "npm install && npm run dev -- --host"
FRONTEND_PORT=5173
FRONTEND_INTERNAL_PORT=5173
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
```

### Server (Staging / Production)
```env
RESTART_POLICY=always
DEBUG=False
UV_COMPILE_BYTECODE=1

DOMAIN=myclient.shop
ALLOWED_HOSTS=myclient.shop,www.myclient.shop
CSRF_TRUSTED_ORIGINS=https://myclient.shop
FRONTEND_URL=https://myclient.shop
VITE_API_URL=https://myclient.shop
VITE_WS_URL=wss://myclient.shop/ws

# Frontend built into a static Nginx image:
FRONTEND_IMAGE=
FRONTEND_COMMAND=
FRONTEND_PORT=8081
FRONTEND_INTERNAL_PORT=80
CHOKIDAR_USEPOLLING=false
WATCHPACK_POLLING=false
```

---

## Step 5: Run It

```bash
docker compose up -d --build
```

That's it. **One command, one file** — works in all environments.

---

## Step 6: First-Time Server Setup
```bash
# Run database migrations
docker compose exec backend_api python manage.py migrate

# Create a superuser
docker compose exec backend_api python manage.py createsuperuser

# Collect static files
docker compose exec backend_api python manage.py collectstatic --noinput
```

---

## Step 7: Commit the Submodule to the Core Repo
Once the submodule has been tested and confirmed working:
```bash
git add .gitmodules frontend/sarker-shop
git commit -m "feat: add sarker-shop frontend submodule"
git push origin master
```

---

## Running Multiple Clients on the Same Server
To run two clients side-by-side on one server, use different **port numbers** and a different **`CLIENT_NAME`** in each client's `.env`:

| Variable | Client A (Sarker) | Client B (Gurudeb) |
|---|---|---|
| `CLIENT_NAME` | `sarker` | `gurudeb` |
| `BACKEND_PORT` | `8001` | `8002` |
| `WS_PORT` | `8011` | `8012` |
| `FRONTEND_PORT` | `8081` | `8083` |
| `ADMIN_PORT` | `8082` | `8084` |
| `DB_PORT` | `5433` | `5434` |
