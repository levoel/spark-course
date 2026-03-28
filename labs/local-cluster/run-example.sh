#!/usr/bin/env bash
# Run a sample word-count job on the local Spark cluster
# Usage: ./run-example.sh

set -euo pipefail

echo "=== Spark Local Cluster: Word Count Example ==="
echo ""
echo "Submitting word-count job to spark-master..."
echo ""

docker exec spark-jupyter /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --deploy-mode client \
  /opt/spark/examples/src/main/python/wordcount.py \
  /opt/spark/data/sample.csv

echo ""
echo "=== Done! Check Spark UI at http://localhost:8080 ==="
