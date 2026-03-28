"""
03-gold-aggregates.py -- Create gold aggregate tables from silver layer.

Creates 3 gold tables:
  - daily_revenue: date, total_revenue, order_count
  - city_revenue: city, total_revenue, avg_order_value, customer_count
  - product_rankings: product_id, total_quantity, total_revenue, rank

Usage:
  docker exec spark-master spark-submit \
    --master spark://spark-master:7077 \
    --packages io.delta:delta-spark_2.13:4.0.0,org.apache.hadoop:hadoop-aws:3.4.1 \
    /opt/scripts/03-gold-aggregates.py
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, sum as _sum, count, avg, countDistinct, row_number, desc,
)
from pyspark.sql.window import Window

# ---------------------------------------------------------------------------
# 1. SparkSession
# ---------------------------------------------------------------------------
spark = (
    SparkSession.builder
    .appName("Capstone-03-GoldAggregates")
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
print("  Step 3: Silver -> Gold (Aggregates)")
print("=" * 60)

# ---------------------------------------------------------------------------
# 2. Read silver enriched_orders
# ---------------------------------------------------------------------------
print("\n--- Reading silver/enriched_orders ---")
df = spark.read.format("delta").load("s3a://warehouse/silver/enriched_orders")
print(f"Silver rows: {df.count()}")

# ---------------------------------------------------------------------------
# 3. Gold table: daily_revenue
# ---------------------------------------------------------------------------
print("\n--- Creating gold/daily_revenue ---")
df_daily = (
    df.filter(col("status") == "completed")
    .groupBy("order_date")
    .agg(
        _sum("total_amount").alias("total_revenue"),
        count("order_id").alias("order_count"),
    )
    .orderBy("order_date")
)

df_daily.show(10, truncate=False)
print(f"Daily revenue rows: {df_daily.count()}")

(
    df_daily.write
    .format("delta")
    .mode("overwrite")
    .save("s3a://warehouse/gold/daily_revenue")
)
print("Written to s3a://warehouse/gold/daily_revenue")

# ---------------------------------------------------------------------------
# 4. Gold table: city_revenue
# ---------------------------------------------------------------------------
print("\n--- Creating gold/city_revenue ---")
df_city = (
    df.filter(col("status") == "completed")
    .groupBy("city")
    .agg(
        _sum("total_amount").alias("total_revenue"),
        avg("total_amount").alias("avg_order_value"),
        countDistinct("customer_id").alias("customer_count"),
    )
    .orderBy(desc("total_revenue"))
)

df_city.show(truncate=False)
print(f"City revenue rows: {df_city.count()}")

(
    df_city.write
    .format("delta")
    .mode("overwrite")
    .save("s3a://warehouse/gold/city_revenue")
)
print("Written to s3a://warehouse/gold/city_revenue")

# ---------------------------------------------------------------------------
# 5. Gold table: product_rankings
# ---------------------------------------------------------------------------
print("\n--- Creating gold/product_rankings ---")
df_products = (
    df.filter(col("status") == "completed")
    .groupBy("product_id")
    .agg(
        _sum("quantity").alias("total_quantity"),
        _sum("total_amount").alias("total_revenue"),
    )
)

window_rank = Window.orderBy(desc("total_revenue"))
df_ranked = df_products.withColumn("rank", row_number().over(window_rank))

df_ranked.orderBy("rank").show(20, truncate=False)
print(f"Product ranking rows: {df_ranked.count()}")

(
    df_ranked.write
    .format("delta")
    .mode("overwrite")
    .save("s3a://warehouse/gold/product_rankings")
)
print("Written to s3a://warehouse/gold/product_rankings")

# ---------------------------------------------------------------------------
# 6. Verify
# ---------------------------------------------------------------------------
print("\n--- Verification ---")
for table in ["daily_revenue", "city_revenue", "product_rankings"]:
    path = f"s3a://warehouse/gold/{table}"
    cnt = spark.read.format("delta").load(path).count()
    print(f"  gold/{table}: {cnt} rows")

print("\n" + "=" * 60)
print("  Step 3 Complete: Gold layer populated")
print("=" * 60)

spark.stop()
