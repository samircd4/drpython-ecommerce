# Guide: Adding a Client Frontend Submodule

This guide explains how to add and configure a client-specific frontend repository (as a Git submodule) to the **drpython-ecommerce** core monorepo.

---

## Step 1: Clone the Core Monorepo
When starting on a new workspace or server deployment, clone the core repository first:
```bash
git clone https://github.com/samircd4/drpython-ecommerce.git core-shop
cd core-shop
```

---

## Step 2: Add the Frontend as a Git Submodule
All client frontends live under the `frontend/` directory. Link the dedicated client frontend repository as a submodule:

```bash
# Syntax:
# git submodule add <frontend-repo-url> frontend/<client-name>

# Example:
git submodule add https://github.com/samircd4/sarker_shop_frontend.git frontend/sarker-shop
```

This will:
1. Clone the frontend repository into the `frontend/<client-name>` folder.
2. Track this submodule in the `.gitmodules` file.

---

## Step 3: Initialize and Sync Submodules
If you are cloning this repository on a new server or another developer's machine, pull the submodules using:
```bash
git submodule update --init --recursive
```

---

## Step 4: Environment Configuration
Copy the environment variables template and configure it for the client:
```bash
cp .env.example .env
```
Populate `.env` with the backend database credentials, domain settings, and the local/production ports for the client.

---

## Step 5: Docker Compose Setup
To run the client frontend along with the core services, update your `docker-compose` setup to point to the new submodule build context:

### Local Development (`docker-compose.local.yml`)
Modify the `frontend` service definition to map the new submodule:
```yaml
  frontend:
    image: node:20-alpine
    container_name: client_frontend_local
    working_dir: /app
    volumes:
      - ./frontend/sarker-shop:/app      # Path to your new submodule folder
      - /app/node_modules
    ports:
      - "5173:5173"                      # Local port mapping
    environment:
      - VITE_API_URL=http://localhost:8000/api
      - VITE_TRACKING_WS_URL=ws://localhost:8001/ws/live-insights/
    command: sh -c "npm install && npm run dev -- --host"
```

### Production/Staging (`docker-compose.prod.yml`)
Modify the build context for the `frontend` service to point to the submodule:
```yaml
  frontend:
    build:
      context: ./frontend/sarker-shop    # Path to your new submodule folder
      dockerfile: Dockerfile
    restart: always
    ports:
      - "8081:80"                        # Port mapping on server
    depends_on:
      - backend_api
```

---

## Step 6: Commit and Push Changes
Commit the submodule registration to the core repository:
```bash
git add .gitmodules frontend/sarker-shop
git commit -m "feat: add sarker-shop frontend submodule"
git push origin master
```
