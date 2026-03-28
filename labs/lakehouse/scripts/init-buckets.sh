#!/bin/bash
# Initialize MinIO buckets for the lakehouse lab.
# This script is used by the mc-init service in docker-compose.yml.
# It can also be run manually if needed.

set -e

MC_ALIAS=${MC_ALIAS:-myminio}
MINIO_ENDPOINT=${MINIO_ENDPOINT:-http://minio:9000}
MINIO_USER=${MINIO_USER:-minioadmin}
MINIO_PASS=${MINIO_PASS:-minioadmin}

echo "Setting up MinIO alias..."
mc alias set "$MC_ALIAS" "$MINIO_ENDPOINT" "$MINIO_USER" "$MINIO_PASS"

echo "Creating buckets..."
mc mb --ignore-existing "$MC_ALIAS/warehouse"
mc mb --ignore-existing "$MC_ALIAS/checkpoints"

echo "Buckets created successfully"
mc ls "$MC_ALIAS"
