"""
04-quality-checks.py -- Data quality validation with Great Expectations.

Validates bronze and silver layers using GE ephemeral context.
Exits with code 1 if critical expectations fail.

Usage (runs in Jupyter container, not spark-master):
  docker exec spark-jupyter-capstone python /home/jovyan/work/04-quality-checks.py
"""

import sys

from pyspark.sql import SparkSession
import great_expectations as gx

# ---------------------------------------------------------------------------
# 1. SparkSession (local mode inside Jupyter container)
# ---------------------------------------------------------------------------
spark = (
    SparkSession.builder
    .appName("Capstone-04-QualityChecks")
    .master("local[*]")
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
    .config("spark.sql.catalog.spark_catalog",
            "org.apache.spark.sql.delta.catalog.DeltaCatalog")
    .config("spark.hadoop.fs.s3a.endpoint", "http://minio:9000")
    .config("spark.hadoop.fs.s3a.access.key", "minioadmin")
    .config("spark.hadoop.fs.s3a.secret.key", "minioadmin")
    .config("spark.hadoop.fs.s3a.path.style.access", "true")
    .config("spark.hadoop.fs.s3a.impl",
            "org.apache.hadoop.fs.s3a.S3AFileSystem")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("WARN")

print("=" * 60)
print("  Step 4: Data Quality Checks (Great Expectations)")
print("=" * 60)

# ---------------------------------------------------------------------------
# 2. Load data
# ---------------------------------------------------------------------------
print("\n--- Loading bronze and silver tables ---")
try:
    df_bronze_orders = spark.read.format("delta").load("s3a://warehouse/bronze/orders")
    df_silver = spark.read.format("delta").load("s3a://warehouse/silver/enriched_orders")
    print(f"Bronze orders: {df_bronze_orders.count()} rows")
    print(f"Silver enriched: {df_silver.count()} rows")
except Exception as e:
    print(f"ERROR: Could not load tables: {e}")
    print("Make sure steps 01-03 have been run first.")
    sys.exit(1)

# ---------------------------------------------------------------------------
# 3. GE Ephemeral Context
# ---------------------------------------------------------------------------
context = gx.get_context(mode="ephemeral")

# ---------------------------------------------------------------------------
# 4. Bronze quality checks
# ---------------------------------------------------------------------------
print("\n--- Bronze Layer Checks ---")

bronze_source = context.data_sources.add_spark(name="bronze_source")
bronze_asset = bronze_source.add_dataframe_asset(name="bronze_orders")
bronze_batch_def = bronze_asset.add_batch_definition_whole_dataframe("bronze_batch")

bronze_suite = context.suites.add(
    gx.ExpectationSuite(name="bronze_quality")
)

# Critical: order_id must not be null
bronze_suite.add_expectation(
    gx.expectations.ExpectColumnValuesToNotBeNull(column="order_id")
)

# Critical: customer_id must not be null
bronze_suite.add_expectation(
    gx.expectations.ExpectColumnValuesToNotBeNull(column="customer_id")
)

# Price between 0 and 100000
bronze_suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeBetween(
        column="price", min_value=0, max_value=100000,
    )
)

# Quantity between 1 and 1000
bronze_suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeBetween(
        column="quantity", min_value=1, max_value=1000,
    )
)

bronze_validation = context.validation_definitions.add(
    gx.ValidationDefinition(
        name="bronze_validation",
        data=bronze_batch_def,
        suite=bronze_suite,
    )
)

bronze_checkpoint = context.checkpoints.add(
    gx.Checkpoint(
        name="bronze_checkpoint",
        validation_definitions=[bronze_validation],
    )
)

bronze_result = bronze_checkpoint.run(
    batch_parameters={"dataframe": df_bronze_orders}
)

# ---------------------------------------------------------------------------
# 5. Silver quality checks
# ---------------------------------------------------------------------------
print("\n--- Silver Layer Checks ---")

silver_source = context.data_sources.add_spark(name="silver_source")
silver_asset = silver_source.add_dataframe_asset(name="silver_enriched")
silver_batch_def = silver_asset.add_batch_definition_whole_dataframe("silver_batch")

silver_suite = context.suites.add(
    gx.ExpectationSuite(name="silver_quality")
)

# Unique order_id after deduplication
silver_suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeUnique(column="order_id")
)

# Status must be in allowed set
silver_suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeInSet(
        column="status",
        value_set=["completed", "pending", "cancelled", "returned"],
    )
)

silver_validation = context.validation_definitions.add(
    gx.ValidationDefinition(
        name="silver_validation",
        data=silver_batch_def,
        suite=silver_suite,
    )
)

silver_checkpoint = context.checkpoints.add(
    gx.Checkpoint(
        name="silver_checkpoint",
        validation_definitions=[silver_validation],
    )
)

silver_result = silver_checkpoint.run(
    batch_parameters={"dataframe": df_silver}
)

# ---------------------------------------------------------------------------
# 6. Results summary
# ---------------------------------------------------------------------------
print("\n" + "=" * 60)
print("  VALIDATION RESULTS")
print("=" * 60)

critical_failed = False

for label, result in [("Bronze", bronze_result), ("Silver", silver_result)]:
    success = result.success
    print(f"\n{label}: {'PASSED' if success else 'FAILED'}")

    for run_result in result.run_results.values():
        results = run_result["validation_result"]["results"]
        passed = sum(1 for r in results if r["success"])
        failed = len(results) - passed
        print(f"  {passed} passed, {failed} failed out of {len(results)}")

        for r in results:
            status = "PASS" if r["success"] else "FAIL"
            exp_type = r["expectation_config"]["type"]
            column = r["expectation_config"]["kwargs"].get("column", "N/A")
            print(f"    [{status}] {exp_type} (column: {column})")

    if not success:
        critical_failed = True

print("\n" + "=" * 60)
if critical_failed:
    print("  QUALITY GATE: FAILED -- critical expectations violated")
    print("=" * 60)
    spark.stop()
    sys.exit(1)
else:
    print("  QUALITY GATE: PASSED -- all expectations met")
    print("=" * 60)

spark.stop()
