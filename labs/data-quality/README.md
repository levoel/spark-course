# Data Quality Lab (LAB-04)

Spark + Great Expectations: валидация качества данных с помощью expectation suite и генерация Data Docs HTML-отчёта.

## Архитектура

```
spark-master (8080) + spark-worker ── Spark кластер
       |
       |── jupyter (8888) ── 01-ge-validation.py
       |                     |
       |                     |── sample-data.csv (102 записи)
       |                     |── requirements.txt (GE + PySpark)
       |                     |
       |                     └── Data Docs HTML-отчёт
```

**Memory budget:** ~4 GB (spark-master 1g + spark-worker 1g + jupyter 2g)

## Требования

- Docker Desktop с выделенными 4 GB+ памяти
- Свободные порты: 8080, 8888, 7077, 4040

## Quick Start

```bash
# 1. Запуск кластера
docker compose up -d

# 2. Дождитесь запуска всех сервисов (~60 секунд)
docker compose ps

# 3. Откройте Jupyter
open http://localhost:8888
# Token: spark
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

Jupyter установит Great Expectations при первом запуске -- это может занять ~30 секунд.

### Шаг 2: Открыть Jupyter

Откройте http://localhost:8888 в браузере.

- **Token:** `spark`
- Перейдите в директорию `work/`

### Шаг 3: Запуск валидации

Откройте файл `01-ge-validation.py` или создайте новый ноутбук.

Если создаёте ноутбук -- копируйте ячейки из скрипта по порядку:

1. **Импорт и SparkSession** -- создание Spark-сессии
2. **Загрузка данных** -- чтение sample-data.csv в DataFrame
3. **Настройка GE** -- ephemeral context, data source, asset
4. **Expectation Suite** -- 8 expectations для проверки качества
5. **Запуск валидации** -- checkpoint с результатами
6. **Анализ результатов** -- pass/fail по каждому expectation
7. **Data Docs** -- HTML-отчёт для браузера
8. **Сводка** -- рекомендации по исправлению

### Шаг 4: Анализ результатов

Скрипт выведет таблицу результатов:

| Expectation | Статус | Описание |
|-------------|--------|----------|
| `id` NOT NULL | PASS | Все записи имеют id |
| `email` NOT NULL | FAIL | ~5 записей без email |
| `id` UNIQUE | FAIL | id=3 дублируется |
| `salary` >= 0 | FAIL | 3 отрицательные зарплаты |
| `department` EXISTS | PASS | Колонка существует |
| `email` REGEX | FAIL | null emails не проходят |
| `status` IN SET | PASS | Все значения допустимы |
| `salary` RANGE | FAIL | Отрицательные зарплаты |

### Шаг 5: Data Docs

Great Expectations автоматически генерирует HTML-отчёт (Data Docs).

В Jupyter терминале или ноутбуке увидите путь к отчёту. Откройте его в браузере для интерактивного просмотра:

- Общий статус валидации
- Детали по каждому expectation
- Примеры проблемных записей
- Статистика по колонкам

### Шаг 6: Эксперименты

Попробуйте:

1. **Добавить expectations** -- например, `expect_column_values_to_match_strftime_format` для `hire_date`
2. **Изменить данные** -- исправьте проблемы в `sample-data.csv` и перезапустите
3. **Настроить пороги** -- используйте `mostly=0.95` для допуска 5% ошибок
4. **Добавить custom expectations** -- создайте свои проверки

## Lite Variant (для 8 GB машин)

Если на машине только 8 GB RAM, уменьшите память Spark:

```yaml
# В docker-compose.yml замените:
spark-master:
  mem_limit: 512m    # было 1g

spark-worker:
  environment:
    - SPARK_WORKER_MEMORY=512m  # было 1g
  mem_limit: 512m    # было 1g

jupyter:
  mem_limit: 1g      # было 2g
```

Общий бюджет: ~2 GB вместо 4 GB.

## Memory Budget

| Service | mem_limit | Описание |
|---------|-----------|----------|
| spark-master | 1g | Spark Master + UI |
| spark-worker | 1g | SPARK_WORKER_MEMORY=1g |
| jupyter | 2g | Jupyter + Great Expectations + PySpark |
| **Итого** | **~4 GB** | Помещается в 4 GB budget |

## Troubleshooting

### Jupyter не запускается

- Проверьте логи: `docker compose logs jupyter`
- Убедитесь, что порт 8888 свободен: `lsof -i :8888`
- GE устанавливается при первом запуске -- подождите ~60 секунд

### Great Expectations ImportError

- Проверьте установку: `docker exec spark-jupyter-dq pip list | grep great`
- Переустановите: `docker exec spark-jupyter-dq pip install great_expectations>=0.18.0`

### Spark не подключается

- Убедитесь, что spark-master healthy: `docker compose ps`
- Проверьте Spark UI: http://localhost:8080
- В скрипте используется `local[*]` -- Spark запускается внутри Jupyter

### Порт 8080 или 8888 занят

- Остановите другие Spark-лабы: `docker compose -f ../lakehouse/docker-compose.yml down`
- Или измените порты в docker-compose.yml

### Нехватка памяти

- Используйте Lite Variant (см. выше)
- Остановите другие контейнеры: `docker ps` и `docker stop <id>`
- Увеличьте память Docker Desktop: Settings > Resources > Memory

### Data Docs не генерируются

- GE Ephemeral Context хранит Data Docs в памяти
- Для сохранения на диск используйте `FileDataContext` вместо ephemeral
- Путь по умолчанию: `gx/uncommitted/data_docs/local_site/index.html`

## Cleanup

```bash
# Остановка и удаление всех контейнеров + volumes
docker compose down -v
```
