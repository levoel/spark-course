#!/bin/bash
# 05-run-pipeline.sh -- Run complete capstone pipeline end-to-end.
#
# Executes scripts 01-04 sequentially:
#   01-ingest-bronze.py   (spark-submit on spark-master)
#   02-transform-silver.py (spark-submit on spark-master)
#   03-gold-aggregates.py  (spark-submit on spark-master)
#   04-quality-checks.py   (python on jupyter container -- GE needs pip packages)

set -e

PACKAGES="io.delta:delta-spark_2.13:4.0.0,org.apache.hadoop:hadoop-aws:3.4.1"

echo "============================================================"
echo "  Capstone Pipeline: Full Run"
echo "============================================================"

# --- Step 1: Ingest Bronze ---
echo ""
echo ">>> Step 1/4: Ingest Raw -> Bronze"
echo "---"
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --packages "${PACKAGES}" \
  /opt/scripts/01-ingest-bronze.py

echo ""
echo ">>> Step 1/4: DONE"

# --- Step 2: Transform Silver ---
echo ""
echo ">>> Step 2/4: Bronze -> Silver"
echo "---"
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --packages "${PACKAGES}" \
  /opt/scripts/02-transform-silver.py

echo ""
echo ">>> Step 2/4: DONE"

# --- Step 3: Gold Aggregates ---
echo ""
echo ">>> Step 3/4: Silver -> Gold"
echo "---"
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --packages "${PACKAGES}" \
  /opt/scripts/03-gold-aggregates.py

echo ""
echo ">>> Step 3/4: DONE"

# --- Step 4: Quality Checks (runs in Jupyter container for GE) ---
echo ""
echo ">>> Step 4/4: Quality Checks (Great Expectations)"
echo "---"
docker exec spark-jupyter-capstone python /home/jovyan/work/04-quality-checks.py

echo ""
echo ">>> Step 4/4: DONE"

# --- Summary ---
echo ""
echo "============================================================"
echo "  Pipeline Complete"
echo "============================================================"
echo "  Bronze:  s3a://warehouse/bronze/{orders,customers}"
echo "  Silver:  s3a://warehouse/silver/enriched_orders"
echo "  Gold:    s3a://warehouse/gold/{daily_revenue,city_revenue,product_rankings}"
echo "  Quality: All checks passed"
echo "============================================================"
echo ""
echo "  MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
echo "  Jupyter:       http://localhost:8888 (token: spark)"
echo "============================================================"
