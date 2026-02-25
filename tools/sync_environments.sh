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

# 1. Database Sync
echo "📋 Syncing Database..."
SOURCE_DB_CONT="sarker_${SOURCE_ENV}_db_1"
DEST_DB_CONT="sarker_${DEST_ENV}_db_1"

# Extract credentials from the .env files
# We check /root/sarker_ENV/.env for these variables
SOURCE_DB_USER=$(grep POSTGRES_USER /root/sarker_${SOURCE_ENV}/.env | cut -d '=' -f2 | tr -d '\r')
SOURCE_DB_NAME=$(grep POSTGRES_DB /root/sarker_${SOURCE_ENV}/.env | cut -d '=' -f2 | tr -d '\r')
DEST_DB_USER=$(grep POSTGRES_USER /root/sarker_${DEST_ENV}/.env | cut -d '=' -f2 | tr -d '\r')
DEST_DB_NAME=$(grep POSTGRES_DB /root/sarker_${DEST_ENV}/.env | cut -d '=' -f2 | tr -d '\r')

echo "  Dumping $SOURCE_DB_NAME ($SOURCE_DB_USER) -> Restoring to $DEST_DB_NAME ($DEST_DB_USER)"

docker exec -t $SOURCE_DB_CONT pg_dump -U $SOURCE_DB_USER $SOURCE_DB_NAME | \
docker exec -i $DEST_DB_CONT psql -U $DEST_DB_USER -d $DEST_DB_NAME

# 2. Media Sync
echo "🖼️  Syncing Media Files..."
# Find the exact media paths using docker inspect
SOURCE_MEDIA=$(docker inspect -f '{{ range .Mounts }}{{ if eq .Destination "/app/media" }}{{ .Source }}{{ end }}{{ end }}' "sarker_${SOURCE_ENV}_backend_1")
DEST_MEDIA=$(docker inspect -f '{{ range .Mounts }}{{ if eq .Destination "/app/media" }}{{ .Source }}{{ end }}{{ end }}' "sarker_${DEST_ENV}_backend_1")

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