# Lab 03: Lakehouse -- Delta Lake + Apache Iceberg

MinIO object storage + Spark с демонстрацией Delta Lake time travel и Iceberg partition evolution.

## Архитектура

```
MinIO (9000/9001) ── S3A ──> spark-master (8080) + spark-worker-1
    |                              |
    |-- warehouse/delta/           |-- 01-delta-lake.py
    |-- warehouse/iceberg/         |-- 02-iceberg.py
    |-- checkpoints/
    |
mc-init (create buckets, exit)
```

**Memory budget:** ~2.1 GB (minio 256m + mc-init 64m + master 512m + worker 512m + jupyter 768m)

## Требования

- Docker Desktop с выделенными 4 GB+ памяти
- Свободные порты: 8080, 8888, 9000, 9001, 4040, 7077

## Quick Start

```bash
# 1. Запуск кластера
docker compose up -d

# 2. Дождитесь создания bucket-ов (~30 секунд)
docker compose ps

# 3. Запуск Delta Lake демо
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --packages io.delta:delta-spark_2.13:4.0.0,org.apache.hadoop:hadoop-aws:3.4.1 \
  --conf spark.sql.extensions=io.delta.sql.DeltaSparkSessionExtension \
  --conf spark.sql.catalog.spark_catalog=org.apache.spark.sql.delta.catalog.DeltaCatalog \
  /opt/scripts/01-delta-lake.py

# 4. Запуск Iceberg демо
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --packages org.apache.iceberg:iceberg-spark-runtime-4.0_2.13:1.10.1,org.apache.hadoop:hadoop-aws:3.4.1 \
  /opt/scripts/02-iceberg.py
```

## Пошаговое руководство

### Шаг 1: Запуск кластера

```bash
docker compose up -d
```

Дождитесь, пока все сервисы станут healthy. Сервис `mc-init` создаст bucket-ы и завершится:

```bash
docker compose ps
```

### Шаг 2: Проверка MinIO

Откройте MinIO Console: http://localhost:9001

- **Login:** minioadmin / minioadmin
- Проверьте наличие bucket-ов: `warehouse`, `checkpoints`

### Шаг 3: Запуск Delta Lake скрипта

```bash
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --packages io.delta:delta-spark_2.13:4.0.0,org.apache.hadoop:hadoop-aws:3.4.1 \
  --conf spark.sql.extensions=io.delta.sql.DeltaSparkSessionExtension \
  --conf spark.sql.catalog.spark_catalog=org.apache.spark.sql.delta.catalog.DeltaCatalog \
  /opt/scripts/01-delta-lake.py
```

Скрипт продемонстрирует:
1. Создание таблицы сотрудников (10 записей)
2. Запись в Delta формат на MinIO (`s3a://warehouse/delta/employees`)
3. Обновление записей (повышение зарплаты Engineering на 10%)
4. **Time Travel** -- сравнение version 0 (до обновления) и текущей версии
5. История изменений таблицы
6. Объяснение VACUUM

### Шаг 4: Просмотр Delta файлов в MinIO

В MinIO Console (http://localhost:9001) откройте:

```
warehouse > delta > employees > _delta_log/
```

Здесь находятся JSON-файлы транзакционного лога Delta Lake.

### Шаг 5: Запуск Iceberg скрипта

```bash
docker exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --packages org.apache.iceberg:iceberg-spark-runtime-4.0_2.13:1.10.1,org.apache.hadoop:hadoop-aws:3.4.1 \
  /opt/scripts/02-iceberg.py
```

Скрипт продемонстрирует:
1. Создание таблицы с партиционированием по `days(event_time)`
2. Вставка данных (2 batch-а по 10 записей)
3. **Snapshot history** -- просмотр всех снимков
4. **Time Travel** -- чтение из первого снимка vs текущего
5. **Partition Evolution** -- замена `days(event_time)` на `hours(event_time)`
6. Вставка данных после эволюции -- старые и новые партиции сосуществуют

### Шаг 6: Сравнение API time travel

| Операция | Delta Lake | Apache Iceberg |
|----------|-----------|---------------|
| Читать старую версию | `.option("versionAsOf", 0)` | `.option("snapshot-id", id)` |
| Идентификатор | Номер версии (0, 1, 2...) | Snapshot ID (long) |
| История | `DeltaTable.history()` | `SELECT * FROM table.snapshots` |
| Восстановление | `dt.restoreToVersion(0)` | `CALL rollback_to_snapshot()` |

## Memory budget

| Service | mem_limit | Описание |
|---------|-----------|----------|
| minio | 256m | S3-compatible object storage |
| mc-init | 64m | Создание bucket-ов (завершается) |
| spark-master | 512m | Spark Master + UI |
| spark-worker-1 | 512m | SPARK_WORKER_MEMORY=384m |
| jupyter | 768m | Jupyter Notebook + pyspark |
| **Итого** | **~2.1 GB** | Помещается в 4 GB budget |

## Troubleshooting

### S3A "Connection refused"
- Убедитесь, что MinIO healthy: `docker compose ps`
- Проверьте endpoint: `curl http://localhost:9000/minio/health/live`

### "NoSuchBucket" ошибка
- mc-init может не успеть создать bucket-ы
- Проверьте логи: `docker logs mc-init`
- Создайте вручную: `docker run --rm --net lakehouse-net minio/mc sh -c "mc alias set m http://minio:9000 minioadmin minioadmin && mc mb m/warehouse && mc mb m/checkpoints"`

### "ClassNotFoundException"
- Убедитесь, что `--packages` передан в spark-submit
- Delta Lake: `io.delta:delta-spark_2.13:4.0.0`
- Iceberg: `org.apache.iceberg:iceberg-spark-runtime-4.0_2.13:1.10.1`
- Hadoop AWS: `org.apache.hadoop:hadoop-aws:3.4.1`

### Spark не подключается к MinIO
Проверьте S3A конфигурацию:
```
spark.hadoop.fs.s3a.endpoint = http://minio:9000
spark.hadoop.fs.s3a.access.key = minioadmin
spark.hadoop.fs.s3a.secret.key = minioadmin
spark.hadoop.fs.s3a.path.style.access = true
```

### Порт 9000 или 9001 занят
- macOS: AirPlay Receiver иногда использует порт 5000/9000
- Отключите AirPlay Receiver в System Settings > General > AirDrop & Handoff

## Cleanup

```bash
# Остановка и удаление всех контейнеров + volumes
docker compose down -v
```
