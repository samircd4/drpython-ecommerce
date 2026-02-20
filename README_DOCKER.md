# 🐳 Docker Deployment Guide for Sarker Shop

Your project is now fully dockerized! This setup includes:

1. **Backend**: Django (served by Uvicorn)
2. **Frontend**: React (built with Vite, served by Nginx)
3. **Database**: PostgreSQL (Production-grade database)
4. **Redis**: Broker for background tasks
5. **Worker**: Celery process for async tasks (emails, etc.)

---

## 🚀 How to Run

### Local Development

```bash
docker compose up --build
```

### Production Deployment (Hostinger VPS)

1. **Upload**: Push changes to GitHub and `git pull` on your VPS.
2. **Environment**: Copy `.env.example` to `.env` in the `backend/` folder and fill in your production secrets.
3. **Start**:

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

---

## 🛠️ Useful Commands

**Check logs:**

```bash
docker compose logs -f
```

**Run migrations manually (if needed):**

```bash
docker compose exec backend uv run manage.py migrate
```

**Create Superuser:**

```bash
docker compose exec backend uv run manage.py createsuperuser
```

---

## 🔒 Security & Scaling

- **PostgreSQL**: Now fully integrated. Data is persisted in the `postgres_data` volume.
- **HTTPS**: Use Nginx on your host VPS to proxy requests to port 80 and handle SSL via Certbot.
