"""
Monitoring Lab Workload: Observable Metrics Generator
=====================================================
PySpark job that generates visible activity across all Grafana panels:
shuffle read/write, GC pressure, task completion rate, memory usage.

Usage:
  docker exec spark-master spark-submit \
    --master spark://spark-master:7077 \
    --driver-memory 512m \
    --executor-memory 384m \
    /opt/spark/workloads/run-workload.py
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, lit, rand, floor, concat, count, sum as spark_sum, avg, max as spark_max
)
import time

def main():
    spark = (
        SparkSession.builder
        .appName("Monitoring Lab: Observable Workload")
        .getOrCreate()
    )

    print("=" * 60)
    print("  MONITORING LAB: Observable Workload")
    print("  Open Grafana at http://localhost:3000")
    print("  Watch metrics update in real-time")
    print("=" * 60)

    # --- Phase 1: Generate large DataFrame (Memory + CPU activity) ---
    print("\n[Phase 1/4] Generating orders dataset (2M rows)...")
    cities = ["Moscow", "Saint Petersburg", "Kazan", "Novosibirsk",
              "Yekaterinburg", "Samara", "Rostov", "Krasnodar"]

    orders = (
        spark.range(0, 2_000_000)
        .withColumn("city", concat(
            lit(cities[0]),  # Will be replaced by random city
        ))
        .withColumn("city_idx", (rand() * len(cities)).cast("int"))
        .withColumn("amount", (rand() * 10000).cast("decimal(10,2)"))
        .withColumn("customer_id", (rand() * 100_000).cast("int"))
        .withColumn("product_id", (rand() * 5_000).cast("int"))
        .drop("city")
        .withColumnRenamed("city_idx", "city_code")
    )

    orders_count = orders.count()
    print(f"  Created {orders_count:,} orders")

    # --- Phase 2: Shuffle-heavy join (Shuffle Read/Write metrics) ---
    print("\n[Phase 2/4] Running shuffle-heavy join...")
    customers = (
        spark.range(0, 100_000)
        .withColumnRenamed("id", "cust_id")
        .withColumn("customer_name", concat(lit("Customer_"), col("cust_id")))
        .withColumn("region", (rand() * 8).cast("int"))
    )

    joined = orders.join(
        customers,
        orders["customer_id"] == customers["cust_id"],
        "inner"
    )

    joined_count = joined.count()
    print(f"  Joined result: {joined_count:,} rows")
    print("  >> Check Grafana: Shuffle Read/Write panel should show activity")

    # --- Phase 3: Aggregation with multiple groupBy (More shuffles) ---
    print("\n[Phase 3/4] Running aggregations...")

    agg_result = (
        joined
        .groupBy("region")
        .agg(
            count("*").alias("order_count"),
            spark_sum("amount").alias("total_amount"),
            avg("amount").alias("avg_amount"),
            spark_max("amount").alias("max_amount"),
        )
    )

    agg_result.show()
    print("  >> Check Grafana: Active Tasks and Task Duration panels")

    # --- Phase 4: Multiple writes (sustained I/O activity) ---
    print("\n[Phase 4/4] Writing results to /tmp/monitoring-lab/...")

    joined.write.mode("overwrite").parquet("/tmp/monitoring-lab/joined-output/")
    agg_result.write.mode("overwrite").parquet("/tmp/monitoring-lab/agg-output/")

    print("  Write complete")
    print("  >> Check Grafana: all panels should show activity history")

    # Keep driver alive briefly so metrics can be scraped
    print("\n[Done] Workload complete. Keeping driver alive for 30s for final metric scrape...")
    time.sleep(30)

    print("=" * 60)
    print("  WORKLOAD FINISHED")
    print("  Review metrics history in Grafana (last 30 min view)")
    print("=" * 60)

    spark.stop()


if __name__ == "__main__":
    main()
