# Local Spark Cluster Lab

Local Apache Spark cluster for hands-on practice.

## Quick Start

```bash
# Start the cluster
docker compose up -d

# Check status
docker compose ps

# Open Spark Master UI
open http://localhost:8080

# Open Jupyter Notebook
open http://localhost:8888

# Run example word-count job
chmod +x run-example.sh
./run-example.sh

# Stop the cluster
docker compose down
```

## Architecture

- **spark-master** (port 8080, 7077) -- Spark Master node
- **spark-worker-1** -- Spark Worker (384MB memory, 1 core)
- **spark-worker-2** -- Spark Worker (384MB memory, 1 core)
- **jupyter** (port 8888, 4040) -- Jupyter Notebook with PySpark

## Memory Requirements

Optimized for machines with 8GB RAM:
- Master: 512MB limit
- Each worker: 512MB limit (384MB Spark memory)
- Jupyter: 1GB limit
- Total: ~2.5GB

## Sample Data

`data/sample.csv` -- 10-row dataset with name, city, age, department columns for testing DataFrame operations.
