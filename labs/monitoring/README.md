# Monitoring Lab (LAB-05): Spark + Prometheus + Grafana

Full monitoring stack for Apache Spark with pre-configured dashboards.

## Architecture

```
spark-master (8080, 7077, 4040)  ──┐
spark-worker-1 (8081)              ├── /metrics/prometheus/ ──> Prometheus (9090) ──> Grafana (3000)
spark-worker-2 (8082)            ──┘
```

**Memory budget:** ~2.3 GB total (master 512m + workers 2x512m + prometheus 512m + grafana 256m)

## Quick Start

```bash
# Start all services
docker compose up -d

# Wait for all services to be healthy (~30-60s)
docker compose ps

# Open Grafana
open http://localhost:3000
# Login: anonymous (viewer) or admin/spark

# Open Spark Master UI
open http://localhost:8080

# Open Prometheus
open http://localhost:9090
```

## Running Workloads

### Standard workload (generates observable metrics)

```bash
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --driver-memory 512m \
  --executor-memory 384m \
  /opt/spark/workloads/run-workload.py
```

This runs a 2-3 minute job with shuffles, joins, and aggregations. Watch Grafana panels update in real-time.

### Break the cluster (intentional problems)

```bash
# All safe scenarios (skew + spill)
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --driver-memory 512m \
  --executor-memory 384m \
  /opt/spark/workloads/break-cluster.py all

# Individual scenarios
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --driver-memory 512m \
  --executor-memory 384m \
  /opt/spark/workloads/break-cluster.py skew

docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --driver-memory 512m \
  --executor-memory 384m \
  /opt/spark/workloads/break-cluster.py spill

# OOM scenario (WARNING: crashes the driver)
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --driver-memory 512m \
  --executor-memory 384m \
  /opt/spark/workloads/break-cluster.py oom
```

## What to Look For in Grafana

| Panel | Normal | Problem |
|-------|--------|---------|
| **Executor Memory** | 30-60% | > 80% (OOM risk) |
| **GC Time %** | < 5% | > 10% (memory pressure) |
| **Shuffle Read/Write** | Proportional | Write >> Read (data explosion) |
| **Active Tasks** | Stable count | Drops to 1 (straggler/skew) |
| **Task Duration** | Consistent | Spikes (skewed partition) |
| **Spill to Disk** | 0 | Any value > 0 (need more memory) |
| **JVM Heap Memory** | Below max | Near max (increase executor memory) |
| **Completed Tasks** | Steady rate | Drops/stops (cluster stalled) |

## Prometheus Targets

Open http://localhost:9090/targets to verify scraping:

- `spark-master` (8080) -- always up
- `spark-workers` (8081) -- always up
- `spark-driver` (4040) -- only up during active Spark applications

## Troubleshooting

### Grafana shows "No data"
- Wait 30-60 seconds after starting services
- Run a workload first (driver metrics only available during active jobs)
- Check Prometheus targets: http://localhost:9090/targets

### Workers not connecting
```bash
# Check master logs
docker logs spark-master

# Check worker logs
docker logs spark-worker-1
```

### Out of memory (Docker)
- Ensure Docker has at least 4 GB memory allocated
- Check `docker stats` for container memory usage

### Port conflicts
- 8080: Spark Master UI
- 8081/8082: Spark Worker UIs
- 9090: Prometheus
- 3000: Grafana
- 7077: Spark cluster port
- 4040: Spark application UI

## Cleanup

```bash
# Stop and remove all containers + volumes
docker compose down -v

# Remove generated output
docker exec spark-master rm -rf /tmp/monitoring-lab/ 2>/dev/null
```
