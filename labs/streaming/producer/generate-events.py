"""
Kafka Event Producer -- generates JSON transaction events.

Usage:
  docker exec spark-master python3 /opt/producer/generate-events.py

Environment variables:
  KAFKA_BOOTSTRAP_SERVERS  Kafka broker address (default: kafka:9092)
  TOPIC_NAME               Target topic (default: transactions)
  EVENTS_PER_SECOND        Production rate (default: 1)
"""

import json
import os
import random
import sys
import time
import uuid
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
TOPIC = os.getenv("TOPIC_NAME", "transactions")
EPS = float(os.getenv("EVENTS_PER_SECOND", "1"))

CATEGORIES = ["purchase", "refund", "transfer"]
USER_IDS = [f"user_{i}" for i in range(1, 21)]

# ---------------------------------------------------------------------------
# Install kafka-python-ng if missing (convenience for Docker)
# ---------------------------------------------------------------------------
try:
    from kafka import KafkaProducer
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "kafka-python-ng"])
    from kafka import KafkaProducer


def make_event() -> dict:
    """Create a single random transaction event."""
    return {
        "event_id": str(uuid.uuid4()),
        "user_id": random.choice(USER_IDS),
        "amount": round(random.uniform(10.0, 1000.0), 2),
        "event_time": datetime.now(timezone.utc).isoformat(),
        "category": random.choice(CATEGORIES),
    }


def main() -> None:
    print(f"Connecting to Kafka at {BOOTSTRAP_SERVERS} ...")
    producer = KafkaProducer(
        bootstrap_servers=BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        retries=5,
        retry_backoff_ms=1000,
    )
    print(f"Connected. Producing to topic '{TOPIC}' at {EPS} events/sec.")
    print("Press Ctrl+C to stop.\n")

    count = 0
    try:
        while True:
            event = make_event()
            producer.send(TOPIC, value=event)
            count += 1
            print(f"[{count}] {event['event_id'][:8]}... "
                  f"user={event['user_id']} "
                  f"amount={event['amount']} "
                  f"category={event['category']}")
            time.sleep(1.0 / EPS)
    except KeyboardInterrupt:
        print(f"\nStopped after {count} events.")
    finally:
        producer.flush()
        producer.close()


if __name__ == "__main__":
    main()
