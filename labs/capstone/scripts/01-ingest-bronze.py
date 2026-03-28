"""
01-ingest-bronze.py -- Ingest raw CSV/JSON into Delta Lake bronze layer.

Reads orders.csv and customers.json from s3a://raw/ (MinIO),
writes Delta tables to s3a://warehouse/bronze/{orders,customers}.
Orders partitioned by year(order_date).

Usage:
  docker exec spark-master spark-submit \
    --master spark://spark-master:7077 \
    --packages io.delta:delta-spark_2.13:4.0.0,org.apache.hadoop:hadoop-aws:3.4.1 \
    /opt/scripts/01-ingest-bronze.py
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import year, col
from pyspark.sql.types import (
    StructType, StructField, IntegerType, StringType, DoubleType, DateType,
)

# ---------------------------------------------------------------------------
# 1. SparkSession with Delta Lake + S3A (MinIO) configuration
# ---------------------------------------------------------------------------
spark = (
    SparkSession.builder
    .appName("Capstone-01-IngestBronze")
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

print("=" * 60)
print("  Step 1: Ingest Raw -> Bronze (Delta Lake)")
print("=" * 60)

# ---------------------------------------------------------------------------
# 2. Define schemas (no inferSchema in production)
# ---------------------------------------------------------------------------
orders_schema = StructType([
    StructField("order_id", IntegerType(), nullable=False),
    StructField("customer_id", IntegerType(), nullable=False),
    StructField("product_id", StringType(), nullable=False),
    StructField("quantity", IntegerType(), nullable=False),
    StructField("price", DoubleType(), nullable=False),
    StructField("status", StringType(), nullable=False),
    StructField("order_date", DateType(), nullable=False),
])

# ---------------------------------------------------------------------------
# 3. Read orders CSV from MinIO raw bucket
# ---------------------------------------------------------------------------
print("\n--- Reading orders.csv from s3a://raw/ ---")
df_orders = (
    spark.read
    .schema(orders_schema)
    .option("header", "true")
    .csv("s3a://raw/orders.csv")
)
print(f"Orders loaded: {df_orders.count()} rows")
df_orders.printSchema()
df_orders.show(5, truncate=False)

# ---------------------------------------------------------------------------
# 4. Read customers JSON from MinIO raw bucket
# ---------------------------------------------------------------------------
print("\n--- Reading customers.json from s3a://raw/ ---")
df_customers = spark.read.json("s3a://raw/customers.json")
print(f"Customers loaded: {df_customers.count()} rows")
df_customers.printSchema()
df_customers.show(5, truncate=False)

# ---------------------------------------------------------------------------
# 5. Write orders to Delta bronze (partitioned by year)
# ---------------------------------------------------------------------------
print("\n--- Writing bronze/orders (partitioned by year) ---")
df_orders_with_year = df_orders.withColumn("order_year", year(col("order_date")))

(
    df_orders_with_year.write
    .format("delta")
    .mode("overwrite")
    .partitionBy("order_year")
    .save("s3a://warehouse/bronze/orders")
)
print("Written to s3a://warehouse/bronze/orders")

# ---------------------------------------------------------------------------
# 6. Write customers to Delta bronze
# ---------------------------------------------------------------------------
print("\n--- Writing bronze/customers ---")
(
    df_customers.write
    .format("delta")
    .mode("overwrite")
    .save("s3a://warehouse/bronze/customers")
)
print("Written to s3a://warehouse/bronze/customers")

# ---------------------------------------------------------------------------
# 7. Verify
# ---------------------------------------------------------------------------
print("\n--- Verification ---")
bronze_orders = spark.read.format("delta").load("s3a://warehouse/bronze/orders")
bronze_customers = spark.read.format("delta").load("s3a://warehouse/bronze/customers")
print(f"Bronze orders:    {bronze_orders.count()} rows")
print(f"Bronze customers: {bronze_customers.count()} rows")

print("\n" + "=" * 60)
print("  Step 1 Complete: Bronze layer populated")
print("=" * 60)

spark.stop()
