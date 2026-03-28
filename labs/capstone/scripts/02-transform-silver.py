"""
02-transform-silver.py -- Transform bronze to silver layer.

Reads bronze orders + customers, joins on customer_id,
deduplicates orders, adds computed columns, writes enriched table.

Usage:
  docker exec spark-master spark-submit \
    --master spark://spark-master:7077 \
    --packages io.delta:delta-spark_2.13:4.0.0,org.apache.hadoop:hadoop-aws:3.4.1 \
    /opt/scripts/02-transform-silver.py
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, month, row_number
from pyspark.sql.window import Window

# ---------------------------------------------------------------------------
# 1. SparkSession
# ---------------------------------------------------------------------------
spark = (
    SparkSession.builder
    .appName("Capstone-02-TransformSilver")
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
print("  Step 2: Bronze -> Silver (Transform + Enrich)")
print("=" * 60)

# ---------------------------------------------------------------------------
# 2. Read bronze tables
# ---------------------------------------------------------------------------
print("\n--- Reading bronze tables ---")
df_orders = spark.read.format("delta").load("s3a://warehouse/bronze/orders")
df_customers = spark.read.format("delta").load("s3a://warehouse/bronze/customers")

print(f"Bronze orders:    {df_orders.count()} rows")
print(f"Bronze customers: {df_customers.count()} rows")

# ---------------------------------------------------------------------------
# 3. Deduplicate orders by order_id (keep latest by order_date)
# ---------------------------------------------------------------------------
print("\n--- Deduplicating orders ---")
window_dedup = Window.partitionBy("order_id").orderBy(col("order_date").desc())

df_deduped = (
    df_orders
    .withColumn("_row_num", row_number().over(window_dedup))
    .filter(col("_row_num") == 1)
    .drop("_row_num")
)
print(f"After dedup: {df_deduped.count()} rows (removed {df_orders.count() - df_deduped.count()} duplicates)")

# ---------------------------------------------------------------------------
# 4. Join orders + customers on customer_id
# ---------------------------------------------------------------------------
print("\n--- Joining orders with customers ---")
df_enriched = (
    df_deduped
    .join(df_customers, on="customer_id", how="left")
)
print(f"Enriched rows: {df_enriched.count()}")

# ---------------------------------------------------------------------------
# 5. Add computed columns
# ---------------------------------------------------------------------------
print("\n--- Adding computed columns ---")
df_enriched = (
    df_enriched
    .withColumn("total_amount", col("quantity") * col("price"))
    .withColumn("order_month", month(col("order_date")))
)

df_enriched.printSchema()
df_enriched.show(5, truncate=False)

# ---------------------------------------------------------------------------
# 6. Write silver enriched_orders
# ---------------------------------------------------------------------------
print("\n--- Writing silver/enriched_orders ---")
(
    df_enriched.write
    .format("delta")
    .mode("overwrite")
    .save("s3a://warehouse/silver/enriched_orders")
)
print("Written to s3a://warehouse/silver/enriched_orders")

# ---------------------------------------------------------------------------
# 7. Verify
# ---------------------------------------------------------------------------
print("\n--- Verification ---")
silver = spark.read.format("delta").load("s3a://warehouse/silver/enriched_orders")
print(f"Silver enriched_orders: {silver.count()} rows, {len(silver.columns)} columns")
print(f"Columns: {silver.columns}")

print("\n" + "=" * 60)
print("  Step 2 Complete: Silver layer populated")
print("=" * 60)

spark.stop()
