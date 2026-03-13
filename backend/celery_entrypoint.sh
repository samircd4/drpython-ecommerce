#!/bin/bash

echo "Celery worker: waiting for database..."
uv run python << END
import sys
import time
import psycopg2
from urllib.parse import urlparse
import os

db_url = os.getenv('DATABASE_URL')
if not db_url or 'sqlite' in db_url:
    sys.exit(0)

url = urlparse(db_url)
while True:
    try:
        conn = psycopg2.connect(
            dbname=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port
        )
        conn.close()
        break
    except psycopg2.OperationalError:
        print("Database not ready, waiting...")
        time.sleep(1)
END

echo "Starting Celery worker..."
exec uv run celery -A ecommerce_api worker --loglevel=info
