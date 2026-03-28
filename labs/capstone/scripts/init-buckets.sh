#!/bin/bash
# init-buckets.sh -- Create MinIO buckets and upload generated data
# Run AFTER generate-data.py and AFTER docker compose up -d

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Init MinIO Buckets ==="

# Wait for MinIO to be ready
echo "Waiting for MinIO..."
until docker exec capstone-minio mc ready local 2>/dev/null; do
  sleep 2
done
echo "MinIO is ready"

# Create buckets via mc-init container (already done by docker compose)
# Upload generated data to raw bucket
echo "Uploading data to raw bucket..."

docker exec capstone-mc-init sh -c "
  mc alias set myminio http://minio:9000 minioadmin minioadmin &&
  mc mb --ignore-existing myminio/warehouse &&
  mc mb --ignore-existing myminio/checkpoints &&
  mc mb --ignore-existing myminio/raw
" 2>/dev/null || true

# Copy local files into minio via docker cp + mc
docker cp "${SCRIPT_DIR}/orders.csv" capstone-minio:/tmp/orders.csv
docker cp "${SCRIPT_DIR}/customers.json" capstone-minio:/tmp/customers.json

docker exec capstone-minio sh -c "
  mc alias set myminio http://localhost:9000 minioadmin minioadmin &&
  mc cp /tmp/orders.csv myminio/raw/orders.csv &&
  mc cp /tmp/customers.json myminio/raw/customers.json
"

echo "=== Buckets Ready ==="
echo "  raw/orders.csv      -- uploaded"
echo "  raw/customers.json  -- uploaded"
echo "  warehouse/          -- empty (pipeline target)"
echo "  checkpoints/        -- empty (streaming checkpoints)"
