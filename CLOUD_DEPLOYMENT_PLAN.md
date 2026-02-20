# Cloud Deployment Plan: Sarker Shop (Hostinger KVM2)

This plan outlines the steps to move your local Docker setup to your Hostinger VPS for production.

---

## Phase 1: Production Hardening 🛡️

### 1.1 Secure `settings.py`

- Ensure `SECRET_KEY` is loaded ONLY from environment variables in production.
- Tighten `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`.
- Disable `DEBUG` for the production compose file.

### 1.2 Database Strategy

- **Option A (Current):** Continue using SQLite with persistent volumes (Good for low-medium traffic).
- **Option B (Recommended):** Add a PostgreSQL service to the Docker stack for better performance/reliability.

### 1.3 Create `docker-compose.prod.yml`

- Overrides for production:
  - `DEBUG: "False"`
  - `restart: always` (Ensures containers restart after server reboot).
  - Production ports (80/443).

---

## Phase 2: VPS Server Setup 🖥️

### 2.1 Install Prerequisites

On your Hostinger VPS (Ubuntu/Debian):

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin
```

### 2.2 Project Setup

```bash
git clone <your-repo-url>
cd sarker_shop_2026

# Create production .env
nano backend/.env 
# (Add SECRET_KEY, EMAIL_HOST_PASSWORD, etc.)
```

---

## Phase 3: HTTPS & Domain Configuration 🔒

### 3.1 Domain Pointer

- Point your domain (e.g., `sarker.shop`) to the VPS IP via A-Record.

### 3.2 SSL with Nginx & Certbot

We will set up a reverse proxy with Let's Encrypt.

- **Option 1 (Host-level):** Install Nginx on the VPS host + Certbot.
- **Option 2 (Docker-level):** Use `nginx-proxy` and `acme-companion` containers (fully automated).

---

## Phase 4: Automated CI/CD (Optional but Recommended) 🤖

### 4.1 GitHub Actions Workflow

Create a workflow that:

1. Pulls the latest code on your VPS when you push to `main`.
2. Rebuilds and restarts the containers automatically.

---

## Next Steps

1. Would you like me to start with **Phase 1.3** and create the `docker-compose.prod.yml`?
2. Shall we add **PostgreSQL** now, or stick with **SQLite** for the initial cloud push?
