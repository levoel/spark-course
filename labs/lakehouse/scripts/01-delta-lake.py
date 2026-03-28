"""
Delta Lake Demo -- ACID transactions, time travel, VACUUM.

Demonstrates M10 Delta Lake concepts with MinIO (S3-compatible) storage:
1. Create a Delta table with sample employee data
2. Read back and display
3. Update records (salary increase)
4. Time travel: compare version 0 vs current
5. VACUUM demonstration

Usage:
  docker exec spark-master spark-submit \
    --master spark://spark-master:7077 \
    --packages io.delta:delta-spark_2.13:4.0.0,org.apache.hadoop:hadoop-aws:3.4.1 \
    --conf spark.sql.extensions=io.delta.sql.DeltaSparkSessionExtension \
    --conf spark.sql.catalog.spark_catalog=org.apache.spark.sql.delta.catalog.DeltaCatalog \
    /opt/scripts/01-delta-lake.py
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import col

# ---------------------------------------------------------------------------
# 1. SparkSession with Delta Lake + S3A (MinIO) configuration
# ---------------------------------------------------------------------------
spark = (
    SparkSession.builder
    .appName("DeltaLake-LAB03")
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
    .config("spark.sql.catalog.spark_catalog",
            "org.apache.spark.sql.delta.catalog.DeltaCatalog")
    # S3A configuration for MinIO
    .config("spark.hadoop.fs.s3a.endpoint", "http://minio:9000")
    .config("spark.hadoop.fs.s3a.access.key", "minioadmin")
    .config("spark.hadoop.fs.s3a.secret.key", "minioadmin")
    .config("spark.hadoop.fs.s3a.path.style.access", "true")
    .config("spark.hadoop.fs.s3a.impl",
            "org.apache.hadoop.fs.s3a.S3AFileSystem")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("WARN")

DELTA_PATH = "s3a://warehouse/delta/employees"

# ---------------------------------------------------------------------------
# 2. Create sample employee data
# ---------------------------------------------------------------------------
print("=" * 60)
print("  Delta Lake Demo")
print("=" * 60)

print("\n--- Step 1: Create employee DataFrame ---")
data = [
    (1, "Ivanov Aleksei", "Engineering", 120000),
    (2, "Petrova Maria", "Engineering", 115000),
    (3, "Sidorov Dmitry", "Marketing", 95000),
    (4, "Kuznetsova Anna", "Marketing", 98000),
    (5, "Volkov Sergei", "Sales", 85000),
    (6, "Fedorova Elena", "Sales", 88000),
    (7, "Morozov Pavel", "Engineering", 130000),
    (8, "Novikova Olga", "HR", 92000),
    (9, "Sokolov Andrei", "HR", 90000),
    (10, "Lebedeva Natalia", "Engineering", 125000),
]
columns = ["id", "name", "department", "salary"]
df = spark.createDataFrame(data, columns)
df.show(truncate=False)

# ---------------------------------------------------------------------------
# 3. Write to Delta (version 0)
# ---------------------------------------------------------------------------
print("--- Step 2: Write to Delta Lake (version 0) ---")
df.write.format("delta").mode("overwrite").save(DELTA_PATH)
print(f"Written to {DELTA_PATH}")

# ---------------------------------------------------------------------------
# 4. Read back and show
# ---------------------------------------------------------------------------
print("\n--- Step 3: Read from Delta Lake ---")
df_read = spark.read.format("delta").load(DELTA_PATH)
df_read.show(truncate=False)
print(f"Row count: {df_read.count()}")

# ---------------------------------------------------------------------------
# 5. Update: 10% salary increase for Engineering
# ---------------------------------------------------------------------------
print("\n--- Step 4: Update -- 10% salary increase for Engineering ---")
from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, DELTA_PATH)
delta_table.update(
    condition=col("department") == "Engineering",
    set={"salary": (col("salary") * 1.10).cast("int")},
)

print("After update:")
spark.read.format("delta").load(DELTA_PATH) \
    .filter(col("department") == "Engineering") \
    .show(truncate=False)

# ---------------------------------------------------------------------------
# 6. Time travel: compare version 0 vs current
# ---------------------------------------------------------------------------
print("\n--- Step 5: Time Travel -- version 0 vs current ---")

print("Version 0 (original salaries):")
df_v0 = spark.read.format("delta").option("versionAsOf", 0).load(DELTA_PATH)
df_v0.filter(col("department") == "Engineering") \
    .select("name", "salary") \
    .show(truncate=False)

print("Current version (after salary increase):")
df_current = spark.read.format("delta").load(DELTA_PATH)
df_current.filter(col("department") == "Engineering") \
    .select("name", "salary") \
    .show(truncate=False)

# ---------------------------------------------------------------------------
# 7. Show Delta history
# ---------------------------------------------------------------------------
print("\n--- Step 6: Delta Lake History ---")
delta_table = DeltaTable.forPath(spark, DELTA_PATH)
delta_table.history().select(
    "version", "timestamp", "operation", "operationMetrics"
).show(truncate=False)

# ---------------------------------------------------------------------------
# 8. VACUUM demonstration (dry run)
# ---------------------------------------------------------------------------
print("\n--- Step 7: VACUUM (dry run) ---")
print("VACUUM removes old file versions to reclaim storage.")
print("Default retention: 7 days.")
print("In production: delta_table.vacuum(168)  # 168 hours = 7 days")
print("WARNING: VACUUM deletes time travel history for vacuumed versions!")

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
print("\n" + "=" * 60)
print("  Delta Lake Demo Complete")
print("  Explore files in MinIO: http://localhost:9001")
print("  Navigate to: warehouse > delta > employees")
print("=" * 60)

spark.stop()
