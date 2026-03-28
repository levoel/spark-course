"""
Structured Streaming Pipeline -- Kafka source -> windowed aggregation -> console sink.

Demonstrates the M09 Structured Streaming concepts in a real pipeline:
- Kafka source with JSON deserialization
- Watermarks for late data handling
- 5-minute tumbling window aggregation
- Console sink for observation

Usage:
  docker exec spark-master spark-submit \
    --master spark://spark-master:7077 \
    --packages org.apache.spark:spark-sql-kafka-0-10_2.13:4.0.0 \
    /opt/scripts/streaming-pipeline.py
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col,
    from_json,
    sum as _sum,
    count as _count,
    avg as _avg,
    window,
)
from pyspark.sql.types import (
    DoubleType,
    StringType,
    StructType,
    TimestampType,
)

# ---------------------------------------------------------------------------
# 1. SparkSession
# ---------------------------------------------------------------------------
spark = (
    SparkSession.builder
    .appName("StreamingPipeline-LAB02")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("WARN")

# ---------------------------------------------------------------------------
# 2. Schema for incoming JSON events
# ---------------------------------------------------------------------------
event_schema = (
    StructType()
    .add("event_id", StringType())
    .add("user_id", StringType())
    .add("amount", DoubleType())
    .add("event_time", TimestampType())
    .add("category", StringType())
)

# ---------------------------------------------------------------------------
# 3. Read from Kafka
# ---------------------------------------------------------------------------
print("=" * 60)
print("  Structured Streaming Pipeline")
print("  Source: Kafka topic 'transactions'")
print("  Window: 5-minute tumbling")
print("  Watermark: 10 minutes")
print("=" * 60)

raw = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "kafka:9092")
    .option("subscribe", "transactions")
    .option("startingOffsets", "latest")
    .load()
)

# ---------------------------------------------------------------------------
# 4. Parse JSON value
# ---------------------------------------------------------------------------
parsed = (
    raw.select(
        from_json(col("value").cast("string"), event_schema).alias("data")
    )
    .select("data.*")
    .filter(col("event_id").isNotNull())
)

# ---------------------------------------------------------------------------
# 5. Windowed aggregation with watermark
# ---------------------------------------------------------------------------
windowed = (
    parsed
    .withWatermark("event_time", "10 minutes")
    .groupBy(
        window("event_time", "5 minutes"),
        "category",
    )
    .agg(
        _count("event_id").alias("event_count"),
        _sum("amount").alias("total_amount"),
        _avg("amount").alias("avg_amount"),
    )
)

# ---------------------------------------------------------------------------
# 6. Write to console
# ---------------------------------------------------------------------------
query = (
    windowed.writeStream
    .outputMode("update")
    .format("console")
    .option("truncate", "false")
    .option("numRows", 50)
    .trigger(processingTime="10 seconds")
    .start()
)

print("\nStreaming query started. Waiting for events...")
print("Run the producer: python3 /opt/producer/generate-events.py")
print("Press Ctrl+C to stop.\n")

query.awaitTermination()
