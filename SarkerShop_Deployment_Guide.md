# SarkerShop Deployment Architecture Guide

## Branch Strategy

You have three branches:

- `loc` → Local development
- `dev` → Staging server (dev.sarker.shop)
- `prod` → Production (sarker.shop)

### Recommended Workflow

loc → dev → prod

1. Develop features in `loc`
2. Merge `loc` → `dev`
3. Deploy to dev.sarker.shop and test
4. Merge `dev` → `prod`
5. Deploy to sarker.shop

------------------------------------------------------------------------

# Environment Separation (CRITICAL)

Never use the same database for: - Local - Dev - Production

Each environment must have:

- Separate database
- Separate .env file
- Separate docker-compose configuration
- Separate Docker volumes

------------------------------------------------------------------------

# Recommended Project Structure

    project/
    │
    ├── docker-compose.yml
    ├── docker-compose.dev.yml
    ├── docker-compose.prod.yml
    │
    ├── .env.dev
    ├── .env.prod
    │
    ├── app/
    └── nginx/

------------------------------------------------------------------------

# Docker Configuration

## Production (docker-compose.prod.yml)

``` yaml
version: '3.9'

services:
  web:
    build: .
    env_file:
      - .env.prod
    ports:
      - "8000:8000"
    depends_on:
      - db

  db:
    image: postgres:15
    volumes:
      - prod_db_data:/var/lib/postgresql/data
    env_file:
      - .env.prod

volumes:
  prod_db_data:
```

## Development (docker-compose.dev.yml)

``` yaml
version: '3.9'

services:
  web:
    build: .
    env_file:
      - .env.dev
    ports:
      - "8001:8000"
    depends_on:
      - db

  db:
    image: postgres:15
    volumes:
      - dev_db_data:/var/lib/postgresql/data
    env_file:
      - .env.dev

volumes:
  dev_db_data:
```

------------------------------------------------------------------------

# Environment Files

## .env.dev

    DEBUG=True
    DB_NAME=sarker_dev
    DB_USER=dev_user
    DB_PASSWORD=dev_password
    ALLOWED_HOSTS=dev.sarker.shop

## .env.prod

    DEBUG=False
    DB_NAME=sarker_prod
    DB_USER=prod_user
    DB_PASSWORD=super_secret_password
    ALLOWED_HOSTS=sarker.shop

⚠ Never commit .env files to Git. Add them to .gitignore.

------------------------------------------------------------------------

# Nginx Reverse Proxy Setup

Route domains to correct ports:

    dev.sarker.shop  → localhost:8001
    sarker.shop      → localhost:8000

Example nginx config:

``` nginx
server {
    server_name sarker.shop;
    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}

server {
    server_name dev.sarker.shop;
    location / {
        proxy_pass http://127.0.0.1:8001;
    }
}
```

------------------------------------------------------------------------

# Deployment Commands

## Deploy Dev

    git checkout dev
    git pull origin dev
    docker compose -f docker-compose.dev.yml up -d --build

Run migrations:

    docker compose -f docker-compose.dev.yml exec web python manage.py migrate

------------------------------------------------------------------------

## Deploy Production

    git checkout prod
    git pull origin prod
    docker compose -f docker-compose.prod.yml up -d --build

Run migrations:

    docker compose -f docker-compose.prod.yml exec web python manage.py migrate

Always backup production database before migration:

    docker exec -t container_name pg_dumpall -c -U postgres > backup.sql

------------------------------------------------------------------------

# Important Environment Rules

  Item          Dev        Prod
  ------------- ---------- ----------
  DEBUG         True       False
  Database      Separate   Separate
  Password      Simple     Strong
  Stripe Keys   Test       Live
  Email         Sandbox    Real
  Backup        Optional   Required

------------------------------------------------------------------------

# Professional Upgrade Path

When scaling:

- Use Managed Database (RDS / Supabase)
- Implement CI/CD (GitHub Actions)
- Add Redis cache
- Enable automated daily backups
- Consider separate VPS for production

------------------------------------------------------------------------

# Final Summary

✔ Separate .env per environment\
✔ Separate docker-compose per environment\
✔ Separate database volumes\
✔ Never mix production and dev\
✔ Merge branches step-by-step

This ensures safe, scalable, and professional deployment architecture.
