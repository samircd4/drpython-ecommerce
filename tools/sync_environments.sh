#!/bin/bash

# ==============================================================================
# SarkerShop Environment Sync Tool
# usage: ./sync_environments.sh [source] [destination]
# example: ./sync_environments.sh prod dev
# ==============================================================================

SOURCE_ENV=$1
DEST_ENV=$2

if [[ -z "$SOURCE_ENV" || -z "$DEST_ENV" ]]; then
    echo "Usage: $0 [prod|dev] [prod|dev]"
    exit 1
fi

echo "🚀 Starting Sync: $SOURCE_ENV -> $DEST_ENV"

# Helper function to find container name (handles both _ and - naming conventions)
get_container_name() {
    local env=$1
    local service=$2
    # Check underscore format
    local name="sarker_${env}_${service}_1"
    if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
        echo "$name"
        return 0
    fi
    # Check dash format
    name="sarker_${env}-${service}-1"
    if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
        echo "$name"
        return 0
    fi
    # Fallback to just service name if repo prefix isn't there
    name="${service}"
    if docker ps --format '{{.Names}}' | grep -q "${name}"; then
        docker ps --format '{{.Names}}' | grep "${name}" | head -n 1
        return 0
    fi
    return 1
}

# 1. Database Sync
echo "📋 Syncing Database..."
SOURCE_DB_CONT=$(get_container_name "$SOURCE_ENV" "db")
DEST_DB_CONT=$(get_container_name "$DEST_ENV" "db")

if [[ -z "$SOURCE_DB_CONT" || -z "$DEST_DB_CONT" ]]; then
    echo "  ❌ Could not find database containers (Source: $SOURCE_DB_CONT, Dest: $DEST_DB_CONT)"
    exit 1
fi

# Extract credentials from the .env files
SOURCE_DB_USER=$(grep POSTGRES_USER /root/sarker_${SOURCE_ENV}/.env | cut -d '=' -f2 | tr -d '\r')
SOURCE_DB_NAME=$(grep POSTGRES_DB /root/sarker_${SOURCE_ENV}/.env | cut -d '=' -f2 | tr -d '\r')
DEST_DB_USER=$(grep POSTGRES_USER /root/sarker_${DEST_ENV}/.env | cut -d '=' -f2 | tr -d '\r')
DEST_DB_NAME=$(grep POSTGRES_DB /root/sarker_${DEST_ENV}/.env | cut -d '=' -f2 | tr -d '\r')

echo "  Dumping $SOURCE_DB_NAME from $SOURCE_DB_CONT -> Restoring to $DEST_DB_NAME in $DEST_DB_CONT"

# ... rest of schema wipe logic ...
echo "  Sweep... 🧹 Wiping destination schema (public)..."
docker exec -i $DEST_DB_CONT psql -U $DEST_DB_USER -d $DEST_DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" > /dev/null

docker exec -t $SOURCE_DB_CONT pg_dump -U $SOURCE_DB_USER --no-owner --no-privileges $SOURCE_DB_NAME | \
docker exec -i $DEST_DB_CONT psql -U $DEST_DB_USER -d $DEST_DB_NAME

# 2. Media Sync
echo "🖼️  Syncing Media Files..."
SOURCE_BACKEND_CONT=$(get_container_name "$SOURCE_ENV" "backend")
DEST_BACKEND_CONT=$(get_container_name "$DEST_ENV" "backend")

# Find the exact media paths using docker inspect
SOURCE_MEDIA=$(docker inspect -f '{{ range .Mounts }}{{ if eq .Destination "/app/media" }}{{ .Source }}{{ end }}{{ end }}' "$SOURCE_BACKEND_CONT" 2>/dev/null)
DEST_MEDIA=$(docker inspect -f '{{ range .Mounts }}{{ if eq .Destination "/app/media" }}{{ .Source }}{{ end }}{{ end }}' "$DEST_BACKEND_CONT" 2>/dev/null)

if [[ -z "$SOURCE_MEDIA" || -z "$DEST_MEDIA" ]]; then
    # Fallback to standard paths if docker inspect fails
    SOURCE_MEDIA="/root/sarker_${SOURCE_ENV}/backend/media"
    DEST_MEDIA="/root/sarker_${DEST_ENV}/backend/media"
fi

echo "  Source path: $SOURCE_MEDIA"
echo "  Dest path:   $DEST_MEDIA"

if [ -d "$SOURCE_MEDIA" ]; then
    mkdir -p "$DEST_MEDIA"
    # rsync is better for syncing folders if available, otherwise cp
    if command -v rsync >/dev/null 2>&1; then
        rsync -av --progress "$SOURCE_MEDIA/" "$DEST_MEDIA/"
    else
        cp -rn "$SOURCE_MEDIA"/* "$DEST_MEDIA"/
    fi
else
    echo "  ⚠️ Source media directory not found at $SOURCE_MEDIA"
fi

echo "✨ Sync Complete! $SOURCE_ENV data is now in $DEST_ENV."