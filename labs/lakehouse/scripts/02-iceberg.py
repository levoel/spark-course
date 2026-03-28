"""
Apache Iceberg Demo -- catalog, snapshots, partition evolution.

Demonstrates M10 Iceberg concepts with MinIO (S3-compatible) storage:
1. Create an Iceberg table partitioned by days(event_time)
2. Insert sample data
3. View snapshot history
4. Partition evolution: days -> hours
5. Insert more data after evolution
6. Show old and new data coexist without rewrite

Usage:
  docker exec spark-master spark-submit \
    --master spark://spark-master:7077 \
    --packages org.apache.iceberg:iceberg-spark-runtime-4.0_2.13:1.10.1,org.apache.hadoop:hadoop-aws:3.4.1 \
    /opt/scripts/02-iceberg.py
"""

from pyspark.sql import SparkSession

# ---------------------------------------------------------------------------
# 1. SparkSession with Iceberg + S3A (MinIO) configuration
# ---------------------------------------------------------------------------
spark = (
    SparkSession.builder
    .appName("Iceberg-LAB03")
    .config("spark.sql.extensions",
            "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions")
    .config("spark.sql.catalog.iceberg_catalog",
            "org.apache.iceberg.spark.SparkCatalog")
    .config("spark.sql.catalog.iceberg_catalog.type", "hadoop")
    .config("spark.sql.catalog.iceberg_catalog.warehouse",
            "s3a://warehouse/iceberg")
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

# ---------------------------------------------------------------------------
# 2. Create Iceberg table partitioned by days(event_time)
# ---------------------------------------------------------------------------
print("=" * 60)
print("  Apache Iceberg Demo")
print("=" * 60)

print("\n--- Step 1: Create Iceberg table ---")
spark.sql("CREATE DATABASE IF NOT EXISTS iceberg_catalog.db")

spark.sql("""
    CREATE TABLE IF NOT EXISTS iceberg_catalog.db.events (
        event_id STRING,
        event_time TIMESTAMP,
        category STRING,
        value DOUBLE
    ) USING iceberg
    PARTITIONED BY (days(event_time))
""")
print("Created table: iceberg_catalog.db.events")
print("Partitioned by: days(event_time)")

# ---------------------------------------------------------------------------
# 3. Insert sample data (batch 1: 10 rows)
# ---------------------------------------------------------------------------
print("\n--- Step 2: Insert sample data (batch 1) ---")
spark.sql("""
    INSERT INTO iceberg_catalog.db.events VALUES
    ('evt-001', TIMESTAMP '2024-01-15 10:00:00', 'purchase', 250.00),
    ('evt-002', TIMESTAMP '2024-01-15 10:15:00', 'refund',    45.50),
    ('evt-003', TIMESTAMP '2024-01-15 11:30:00', 'purchase', 180.75),
    ('evt-004', TIMESTAMP '2024-01-15 14:00:00', 'transfer', 500.00),
    ('evt-005', TIMESTAMP '2024-01-16 09:00:00', 'purchase', 320.00),
    ('evt-006', TIMESTAMP '2024-01-16 09:30:00', 'purchase',  95.25),
    ('evt-007', TIMESTAMP '2024-01-16 12:00:00', 'refund',   120.00),
    ('evt-008', TIMESTAMP '2024-01-17 08:00:00', 'transfer', 750.00),
    ('evt-009', TIMESTAMP '2024-01-17 10:45:00', 'purchase', 410.50),
    ('evt-010', TIMESTAMP '2024-01-17 15:30:00', 'purchase', 200.00)
""")

print("Inserted 10 events:")
spark.sql("SELECT * FROM iceberg_catalog.db.events ORDER BY event_time") \
    .show(truncate=False)

# ---------------------------------------------------------------------------
# 4. Show snapshot history
# ---------------------------------------------------------------------------
print("\n--- Step 3: Snapshot history ---")
spark.sql("""
    SELECT snapshot_id, committed_at, operation, summary
    FROM iceberg_catalog.db.events.snapshots
""").show(truncate=False)

# ---------------------------------------------------------------------------
# 5. Insert more data (batch 2: 10 rows) to create another snapshot
# ---------------------------------------------------------------------------
print("\n--- Step 4: Insert more data (batch 2) ---")
spark.sql("""
    INSERT INTO iceberg_catalog.db.events VALUES
    ('evt-011', TIMESTAMP '2024-01-18 08:15:00', 'purchase', 150.00),
    ('evt-012', TIMESTAMP '2024-01-18 09:00:00', 'transfer', 600.00),
    ('evt-013', TIMESTAMP '2024-01-18 11:30:00', 'refund',    80.25),
    ('evt-014', TIMESTAMP '2024-01-18 14:45:00', 'purchase', 290.50),
    ('evt-015', TIMESTAMP '2024-01-19 08:00:00', 'purchase', 175.00),
    ('evt-016', TIMESTAMP '2024-01-19 10:30:00', 'purchase', 440.75),
    ('evt-017', TIMESTAMP '2024-01-19 12:15:00', 'transfer', 350.00),
    ('evt-018', TIMESTAMP '2024-01-20 09:00:00', 'purchase', 520.00),
    ('evt-019', TIMESTAMP '2024-01-20 11:00:00', 'refund',   100.00),
    ('evt-020', TIMESTAMP '2024-01-20 16:00:00', 'purchase', 680.25)
""")

print(f"Total rows: {spark.sql('SELECT COUNT(*) FROM iceberg_catalog.db.events').collect()[0][0]}")

# ---------------------------------------------------------------------------
# 6. Time travel: read from snapshot 1 (original 10 rows)
# ---------------------------------------------------------------------------
print("\n--- Step 5: Time travel -- compare snapshots ---")
snapshots = spark.sql("""
    SELECT snapshot_id FROM iceberg_catalog.db.events.snapshots
    ORDER BY committed_at
""").collect()

if len(snapshots) >= 2:
    first_snapshot = snapshots[0]["snapshot_id"]
    print(f"Snapshot 1 (ID: {first_snapshot}) -- original 10 rows:")
    spark.read \
        .option("snapshot-id", first_snapshot) \
        .table("iceberg_catalog.db.events") \
        .groupBy("category") \
        .count() \
        .show()

    print("Current snapshot -- all 20 rows:")
    spark.sql("""
        SELECT category, COUNT(*) as cnt, ROUND(SUM(value), 2) as total
        FROM iceberg_catalog.db.events
        GROUP BY category ORDER BY category
    """).show()

# ---------------------------------------------------------------------------
# 7. Partition evolution: days -> hours
# ---------------------------------------------------------------------------
print("\n--- Step 6: Partition evolution (days -> hours) ---")
print("BEFORE: Partitioned by days(event_time)")

spark.sql("""
    ALTER TABLE iceberg_catalog.db.events
    REPLACE PARTITION FIELD days(event_time) WITH hours(event_time)
""")
print("AFTER: Partitioned by hours(event_time)")
print("No data rewrite needed! Old partitions remain valid.")

# ---------------------------------------------------------------------------
# 8. Insert data after partition evolution
# ---------------------------------------------------------------------------
print("\n--- Step 7: Insert data after partition evolution ---")
spark.sql("""
    INSERT INTO iceberg_catalog.db.events VALUES
    ('evt-021', TIMESTAMP '2024-01-21 08:00:00', 'purchase', 300.00),
    ('evt-022', TIMESTAMP '2024-01-21 08:30:00', 'transfer', 200.00),
    ('evt-023', TIMESTAMP '2024-01-21 14:00:00', 'purchase', 450.50),
    ('evt-024', TIMESTAMP '2024-01-21 14:15:00', 'refund',    75.00),
    ('evt-025', TIMESTAMP '2024-01-21 18:00:00', 'purchase', 550.00)
""")

print("New data written with hourly partitions.")
print("Old data (daily partitions) + new data (hourly partitions) coexist:")
print(f"Total rows: {spark.sql('SELECT COUNT(*) FROM iceberg_catalog.db.events').collect()[0][0]}")

# ---------------------------------------------------------------------------
# 9. Final snapshot history
# ---------------------------------------------------------------------------
print("\n--- Step 8: Final snapshot history ---")
spark.sql("""
    SELECT snapshot_id, committed_at, operation, summary
    FROM iceberg_catalog.db.events.snapshots
    ORDER BY committed_at
""").show(truncate=False)

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
print("\n" + "=" * 60)
print("  Apache Iceberg Demo Complete")
print("  Key takeaways:")
print("  - Snapshot-based time travel (no version numbers)")
print("  - Partition evolution without data rewrite")
print("  - Old and new partition layouts coexist")
print("  Explore files in MinIO: http://localhost:9001")
print("  Navigate to: warehouse > iceberg > db > events")
print("=" * 60)

spark.stop()
