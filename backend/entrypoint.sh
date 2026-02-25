#!/bin/bash

echo "Waiting for database..."
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

echo "Applying database migrations..."
uv run python manage.py migrate --noinput

echo "Collecting static files..."
uv run python manage.py collectstatic --noinput

# If a command is passed to the entrypoint, run it
if [ $# -gt 0 ]; then
    echo "Running provided command: $@"
    exec "$@"
fi

# Otherwise, start the default server
if [ "$DEBUG" = "True" ]; then
    echo "Starting server with --reload..."
    exec uv run uvicorn ecommerce_api.asgi:application --host 0.0.0.0 --port 8000 --reload
else
    exec uv run uvicorn ecommerce_api.asgi:application --host 0.0.0.0 --port 8000
fi
