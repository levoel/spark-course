# Lab 02: Streaming + Kafka

Kafka KRaft + Spark Structured Streaming -- pipeline c producer-ом событий.

## Архитектура

```
generate-events.py ──> Kafka (KRaft, 9092) ──> Spark Structured Streaming ──> console
                                                    |
                                              spark-master (8080)
                                              spark-worker-1
```

**Memory budget:** ~2.0 GB (kafka 384m + master 512m + worker 512m + jupyter 640m)

## Требования

- Docker Desktop с выделенными 4 GB+ памяти
- Свободные порты: 8080, 8888, 9092, 4040, 7077

## Quick Start

```bash
# 1. Запуск кластера
docker compose up -d

# 2. Проверка здоровья (подождите ~30-60 секунд)
docker compose ps

# 3. Запуск producer-а событий
docker exec -it spark-master python3 /opt/producer/generate-events.py

# 4. В другом терминале -- запуск streaming pipeline
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.13:4.0.0 \
  /opt/scripts/streaming-pipeline.py
```

## Пошаговое руководство

### Шаг 1: Запуск кластера

```bash
docker compose up -d
```

Дождитесь, пока все сервисы станут healthy:

```bash
docker compose ps
```

### Шаг 2: Проверка Kafka

```bash
# Список топиков (пока пуст)
docker exec kafka kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --list

# Создание топика вручную (опционально -- producer создаст автоматически)
docker exec kafka kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --create --topic transactions \
  --partitions 3 --replication-factor 1
```

### Шаг 3: Запуск producer-а

Producer генерирует JSON-события транзакций со скоростью 1 событие/сек:

```bash
docker exec -it spark-master python3 /opt/producer/generate-events.py
```

Пример вывода:
```
[1] a3f2b1c8... user=user_5 amount=342.17 category=purchase
[2] 7d4e9f01... user=user_12 amount=88.50 category=refund
[3] c1a8e3d6... user=user_3 amount=715.33 category=transfer
```

### Шаг 4: Запуск streaming pipeline

В **новом терминале** запустите Structured Streaming pipeline:

```bash
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.13:4.0.0 \
  /opt/scripts/streaming-pipeline.py
```

Pipeline читает события из Kafka, применяет watermark (10 минут) и агрегирует в 5-минутные tumbling windows по категориям.

### Шаг 5: Наблюдение за результатами

Каждые 10 секунд в консоли появляется таблица агрегатов:

```
+------------------------------------------+--------+-----------+------------+-----------+
|window                                    |category|event_count|total_amount|avg_amount |
+------------------------------------------+--------+-----------+------------+-----------+
|{2024-01-15 10:00:00, 2024-01-15 10:05:00}|purchase|5          |2150.75     |430.15     |
|{2024-01-15 10:00:00, 2024-01-15 10:05:00}|refund  |2          |445.20      |222.60     |
+------------------------------------------+--------+-----------+------------+-----------+
```

### Шаг 6: Остановка

```bash
# Ctrl+C в терминалах с producer-ом и pipeline

# Остановка всех сервисов
docker compose down -v
```

## Memory budget

| Service | mem_limit | Описание |
|---------|-----------|----------|
| kafka | 384m | KRaft combined mode, KAFKA_HEAP_OPTS="-Xmx256m" |
| spark-master | 512m | Spark Master + UI |
| spark-worker-1 | 512m | SPARK_WORKER_MEMORY=384m |
| jupyter | 640m | Jupyter Notebook + pyspark + kafka-python |
| **Итого** | **~2.0 GB** | Помещается в 4 GB budget |

## Настройка producer-а

Переменные окружения для `generate-events.py`:

| Переменная | Default | Описание |
|------------|---------|----------|
| `KAFKA_BOOTSTRAP_SERVERS` | kafka:9092 | Адрес Kafka broker |
| `TOPIC_NAME` | transactions | Целевой топик |
| `EVENTS_PER_SECOND` | 1 | Скорость генерации событий |

Для ускорения:

```bash
docker exec -e EVENTS_PER_SECOND=5 spark-master python3 /opt/producer/generate-events.py
```

## Схема событий

```json
{
  "event_id": "a3f2b1c8-...",
  "user_id": "user_5",
  "amount": 342.17,
  "event_time": "2024-01-15T10:02:33.123456+00:00",
  "category": "purchase"
}
```

Категории: `purchase`, `refund`, `transfer`.

## Troubleshooting

### Kafka OOM (контейнер перезапускается)
- Убедитесь, что `KAFKA_HEAP_OPTS="-Xmx256m -Xms256m"` задан
- Проверьте Docker stats: `docker stats kafka`

### Spark "Connection refused" при подключении к Kafka
- Подождите healthcheck Kafka (~30 секунд после старта)
- Проверьте: `docker exec kafka kafka-broker-api-versions.sh --bootstrap-server localhost:9092`

### "Failed to find data source: kafka"
- Убедитесь, что `--packages org.apache.spark:spark-sql-kafka-0-10_2.13:4.0.0` передан spark-submit

### Producer не подключается к Kafka
- Проверьте, что Kafka контейнер healthy: `docker compose ps`
- kafka-python-ng установится автоматически при первом запуске

## Cleanup

```bash
# Остановка и удаление всех контейнеров + volumes
docker compose down -v
```
