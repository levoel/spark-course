"""
Monitoring Lab: Break the Cluster
==================================
Three scenarios that create observable problems in Grafana/Spark UI:
1. OOM via large collect()
2. Data skew via Moscow-heavy groupBy
3. Spill to disk via undersized executor memory

Usage:
  docker exec spark-master spark-submit \
    --master spark://spark-master:7077 \
    --driver-memory 512m \
    --executor-memory 384m \
    /opt/spark/workloads/break-cluster.py [scenario]

Scenarios:
  oom    - Trigger OutOfMemoryError with collect() on large DataFrame
  skew   - Create data skew where Moscow has 10x more records
  spill  - Force spill to disk with undersized memory for large shuffle
  all    - Run skew + spill (OOM is intentionally destructive, run separately)
"""

import sys
import time
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, lit, rand, concat, count, sum as spark_sum, when, floor
)


def create_spark():
    return (
        SparkSession.builder
        .appName("Monitoring Lab: Break the Cluster")
        .getOrCreate()
    )


def scenario_oom(spark):
    """
    Scenario 1: OOM via collect()
    Creates a large DataFrame and attempts to collect() it into driver memory.

    What to look for in Grafana:
    - JVM Heap Memory: spike to max, then crash
    - Active Tasks: drops to 0 when driver crashes
    - GC Time: spike before OOM
    """
    print("=" * 60)
    print("  SCENARIO: OOM via collect()")
    print("  WARNING: This WILL crash the driver!")
    print("")
    print("  What to look for in Grafana:")
    print("    - JVM Heap Memory: spike to max")
    print("    - GC Time %: spike before crash")
    print("    - Active Tasks: drops to 0")
    print("=" * 60)

    print("\nGenerating 10M rows...")
    large_df = (
        spark.range(0, 10_000_000)
        .withColumn("data", concat(lit("payload_" * 10), col("id").cast("string")))
        .withColumn("value", rand() * 1000)
    )

    print("Attempting collect() -- this will likely cause OOM...")
    print(">> Watch Grafana JVM Heap Memory panel NOW")
    time.sleep(5)  # Give time to observe pre-crash metrics

    try:
        # This should cause OOM with 512m driver memory
        result = large_df.collect()
        print(f"Collected {len(result)} rows (unexpectedly succeeded)")
    except Exception as e:
        print(f"\nExpected error: {type(e).__name__}: {str(e)[:200]}")
        print(">> Check Grafana for the memory spike pattern")


def scenario_skew(spark):
    """
    Scenario 2: Data Skew
    80% of records are from Moscow, causing severe partition imbalance.

    What to look for in Grafana:
    - Active Tasks: drops to 1 near end (stragglers)
    - Task Duration: one task takes much longer
    - Shuffle Read/Write: high volume
    """
    print("=" * 60)
    print("  SCENARIO: Data Skew (Moscow 80%)")
    print("")
    print("  What to look for in Grafana:")
    print("    - Active Tasks: drops to 1 (straggler)")
    print("    - Task Duration: spike for skewed partition")
    print("    - Shuffle Read/Write: high volume")
    print("")
    print("  What to look for in Spark UI (localhost:4040):")
    print("    - Stages tab: one task with Max >> Median duration")
    print("    - SQL tab: Exchange with large shuffle")
    print("=" * 60)

    print("\nGenerating skewed dataset...")
    # 80% Moscow, 5% SPb, 5% Kazan, 10% other cities
    skewed_df = (
        spark.range(0, 3_000_000)
        .withColumn("rand_val", rand())
        .withColumn("city", when(col("rand_val") < 0.80, lit("Moscow"))
                           .when(col("rand_val") < 0.85, lit("Saint Petersburg"))
                           .when(col("rand_val") < 0.90, lit("Kazan"))
                           .when(col("rand_val") < 0.93, lit("Novosibirsk"))
                           .when(col("rand_val") < 0.95, lit("Yekaterinburg"))
                           .when(col("rand_val") < 0.97, lit("Samara"))
                           .when(col("rand_val") < 0.99, lit("Rostov"))
                           .otherwise(lit("Krasnodar")))
        .withColumn("amount", rand() * 10000)
        .drop("rand_val")
    )

    print("Running groupBy(city) aggregation on skewed data...")
    print(">> Watch Grafana Active Tasks panel NOW")

    result = (
        skewed_df
        .groupBy("city")
        .agg(
            count("*").alias("order_count"),
            spark_sum("amount").alias("total_amount"),
        )
        .orderBy(col("order_count").desc())
    )

    result.show()

    print("\nDistribution shows Moscow has ~80% of all records")
    print("In Spark UI Stages tab, look for Max Duration >> Median Duration")

    # Run a second pass to make skew more visible
    print("\nRunning second aggregation pass for sustained metrics...")
    skewed_df.groupBy("city", floor(col("amount") / 1000).alias("amount_bucket")).count().write.mode("overwrite").parquet("/tmp/monitoring-lab/skew-output/")
    print("Complete. Check Grafana history for the skew pattern.")


def scenario_spill(spark):
    """
    Scenario 3: Spill to Disk
    Large shuffle with insufficient executor memory forces disk spill.

    What to look for in Grafana:
    - Spill to Disk: non-zero values
    - GC Time %: elevated
    - Task Duration: slower than expected
    - JVM Heap Memory: near max
    """
    print("=" * 60)
    print("  SCENARIO: Spill to Disk")
    print("")
    print("  What to look for in Grafana:")
    print("    - Spill to Disk panel: non-zero values!")
    print("    - GC Time %: elevated (memory pressure)")
    print("    - Task Duration: slower due to disk I/O")
    print("    - JVM Heap Memory: near max")
    print("=" * 60)

    print("\nGenerating large dataset for memory-intensive operation...")

    # Create wide rows that consume more memory per partition
    large_df = (
        spark.range(0, 2_000_000)
        .withColumn("key", (rand() * 50).cast("int"))
        .withColumn("col_a", concat(lit("data_a_" * 5), col("id").cast("string")))
        .withColumn("col_b", concat(lit("data_b_" * 5), col("id").cast("string")))
        .withColumn("col_c", concat(lit("data_c_" * 5), col("id").cast("string")))
        .withColumn("value", rand() * 10000)
    )

    print("Running sort + groupBy with wide rows (forces spill)...")
    print(">> Watch Grafana Spill to Disk panel NOW")

    # Sort + groupBy on wide rows with limited memory should cause spill
    result = (
        large_df
        .repartition(10, col("key"))  # Force fewer, larger partitions
        .sortWithinPartitions("value")
        .groupBy("key")
        .agg(
            count("*").alias("cnt"),
            spark_sum("value").alias("total"),
        )
    )

    result.write.mode("overwrite").parquet("/tmp/monitoring-lab/spill-output/")

    print("\nSpill scenario complete.")
    print("In Spark UI, check Stages tab for 'Spill (Disk)' column > 0")


def main():
    scenario = sys.argv[1] if len(sys.argv) > 1 else "all"
    spark = create_spark()

    scenarios = {
        "oom": scenario_oom,
        "skew": scenario_skew,
        "spill": scenario_spill,
    }

    if scenario == "all":
        # Run skew + spill (skip OOM since it crashes the driver)
        print("Running all safe scenarios (skew + spill)...")
        print("Run 'oom' scenario separately as it intentionally crashes.\n")
        scenario_skew(spark)
        print("\n" + "-" * 60 + "\n")
        scenario_spill(spark)
    elif scenario in scenarios:
        scenarios[scenario](spark)
    else:
        print(f"Unknown scenario: {scenario}")
        print("Available: oom, skew, spill, all")
        sys.exit(1)

    # Keep alive for final metric scrape
    print("\nKeeping driver alive for 20s for final metric scrape...")
    time.sleep(20)
    spark.stop()
    print("Done.")


if __name__ == "__main__":
    main()
