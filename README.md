# SarkerShop — Deployment Guide

## Branch Strategy

| Branch | Purpose              | Domain             |
|--------|---------------------|--------------------|
| `loc`  | Local development   | localhost:5173     |
| `dev`  | Staging / Testing   | dev.sarker.shop    |
| `prod` | Production          | sarker.shop        |

### Recommended Workflow

```
loc → dev → prod
```

1. Write code on `loc`
2. Merge `loc` → `dev` and push
3. Deploy to VPS and test on `dev.sarker.shop`
4. If all good, merge `dev` → `prod` and deploy to `sarker.shop`

---

## Docker Compose Files

| File                       | Used For         | Command                                         |
|----------------------------|------------------|-------------------------------------------------|
| `docker-compose.local.yml` | Local dev        | `docker-compose -f docker-compose.local.yml up` |
| `docker-compose.dev.yml`   | Staging (VPS)    | `docker-compose -f docker-compose.dev.yml up`   |
| `docker-compose.prod.yml`  | Production (VPS) | `docker-compose -f docker-compose.prod.yml up`  |

---

## Port Assignments (on VPS)

| Service          | Dev Port | Prod Port |
|------------------|----------|-----------|
| Backend (API)    | `8000`   | `8001`    |
| Frontend (Nginx) | `9090`   | `8081`    |

---

## Environment Setup

### On Any Server

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with real values:

   ```bash
   nano .env
   ```

### Required `.env` Variables

See `.env.example` for all variables and their descriptions.

---

## VPS Deployment

### First-Time Setup (Dev)

```bash
cd /root/sarker_dev
git clone https://github.com/samircd4/sarker_shop_2026.git .
git checkout dev
cp .env.example .env
nano .env   # Fill in your values
docker-compose -f docker-compose.dev.yml up -d --build
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```

### Update Dev After Code Change

```bash
cd /root/sarker_dev
git pull origin dev
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
```

### First-Time Setup (Prod)

```bash
cd /root/sarker_prod
git clone https://github.com/samircd4/sarker_shop_2026.git .
git checkout prod
cp .env.example .env
nano .env   # Fill in your PRODUCTION values (strong passwords, real secret key)
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### Update Prod After Code Change

```bash
cd /root/sarker_prod
git pull origin prod
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

> ⚠ **Always backup the production database before updating:**
>
> ```bash
> docker exec -t sarker_prod_db_1 pg_dumpall -c -U sarker_user > backup_$(date +%Y%m%d).sql
> ```

---

## Nginx Setup on VPS

Copy the Nginx configs from the `nginx/` folder:

```bash
# For sarker.shop
cp /root/sarker_prod/nginx/sarker.shop.conf /etc/nginx/sites-available/sarker.shop
ln -s /etc/nginx/sites-available/sarker.shop /etc/nginx/sites-enabled/

# For dev.sarker.shop
cp /root/sarker_dev/nginx/dev.sarker.shop.conf /etc/nginx/sites-available/dev.sarker.shop
ln -s /etc/nginx/sites-available/dev.sarker.shop /etc/nginx/sites-enabled/

# Test and reload
nginx -t && systemctl reload nginx
```

---

## Local Development

```bash
git checkout loc
docker-compose -f docker-compose.local.yml up -d --build
```

- Frontend: <http://localhost:5173> (with hot-reload ✅)
- Backend API: <http://localhost:8000/api/>
- Admin: <http://localhost:8000/admin/>

---

## Useful Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Run Django shell
docker-compose -f docker-compose.dev.yml exec backend python manage.py shell

# Run migrations
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate

# Collect static files manually
docker-compose -f docker-compose.dev.yml exec backend python manage.py collectstatic --noinput
```
