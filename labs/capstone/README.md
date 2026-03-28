# Capstone -- E2E Pipeline

## Quick start

```bash
# 1. Start services
docker compose up -d

# 2. Generate test data (100K orders, 1K customers)
python3 scripts/generate-data.py

# 3. Upload data to MinIO and run full pipeline
bash scripts/init-buckets.sh
bash scripts/05-run-pipeline.sh
```

## Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin |
| MinIO API | http://localhost:9000 | -- |
| Spark Master UI | http://localhost:8080 | -- |
| Spark App UI | http://localhost:4040 | -- |
| Jupyter | http://localhost:8888 | token: spark |

## Pipeline Steps

| # | Script | Description |
|---|--------|------|
| 1 | `generate-data.py` | CSV orders + JSON customers |
| 2 | `init-buckets.sh` | MinIO buckets + upload raw data |
| 3 | `01-ingest-bronze.py` | CSV/JSON -> Delta bronze layer |
| 4 | `02-transform-silver.py` | Join + deduplicate -> silver |
| 5 | `03-gold-aggregates.py` | Aggregations -> gold tables |
| 6 | `04-quality-checks.py` | Great Expectations validation |
| 7 | `05-run-pipeline.sh` | Run steps 3-6 sequentially |

## Full vs Lite

**Full (docker-compose.yml)** -- 4 GB RAM, 2 workers, 100K rows:
```bash
docker compose up -d
python3 scripts/generate-data.py
```

**Lite (docker-compose.lite.yml)** -- 2.5 GB RAM, 1 worker, 1K rows:
```bash
docker compose -f docker-compose.lite.yml up -d
python3 scripts/generate-data.py --rows 1000 --customers 100
```

## Troubleshooting

**MinIO not starting:**
```bash
docker compose logs minio
# Verify port 9000 is free: lsof -i :9000
```

**Spark worker not connecting:**
```bash
docker compose logs spark-worker-1
# Wait for spark-master healthcheck (15s start_period)
```

**Jupyter packages missing:**
```bash
docker exec spark-jupyter-capstone pip install -r /home/jovyan/work/requirements.txt
```

**Out of memory (8GB machine):**
```bash
# Switch to lite variant
docker compose down
docker compose -f docker-compose.lite.yml up -d
```

**Pipeline script fails:**
```bash
# Run scripts individually to isolate the issue
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --packages io.delta:delta-spark_2.13:4.0.0,org.apache.hadoop:hadoop-aws:3.4.1 \
  /opt/scripts/01-ingest-bronze.py
```
