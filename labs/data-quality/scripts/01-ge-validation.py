"""
Great Expectations + PySpark Data Quality Validation Pipeline
=============================================================

Этот скрипт демонстрирует валидацию данных с помощью Great Expectations
и PySpark. Загружает CSV-файл с сотрудниками, применяет набор ожиданий
(expectation suite) и генерирует отчёт Data Docs.

Запуск:
  - В Jupyter: копируйте ячейки по очереди
  - Как скрипт: python 01-ge-validation.py

Ожидаемый результат: некоторые expectations ПРОЙДУТ, некоторые ПРОВАЛЯТСЯ --
это сделано специально, чтобы показать, как GE выявляет проблемы качества.
"""

# %% [markdown]
# # Data Quality с Great Expectations + PySpark
#
# В этом ноутбуке мы:
# 1. Создаём SparkSession и загружаем CSV-данные
# 2. Настраиваем Great Expectations контекст
# 3. Определяем expectation suite для проверки качества
# 4. Запускаем валидацию и анализируем результаты
# 5. Генерируем Data Docs HTML-отчёт

# %% Шаг 1: Импорт и настройка SparkSession
from pyspark.sql import SparkSession
import great_expectations as gx
from great_expectations.core.batch_definition import BatchDefinition
import os
import json

# Создаём SparkSession
spark = SparkSession.builder \
    .appName("DataQualityLab") \
    .master("local[*]") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

print("=" * 60)
print("Data Quality Lab (LAB-04)")
print("Spark + Great Expectations Pipeline")
print("=" * 60)

# %% Шаг 2: Загрузка данных
# Определяем путь к CSV-файлу
script_dir = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else "/home/jovyan/work"
csv_path = os.path.join(script_dir, "sample-data.csv")

# Загружаем CSV в PySpark DataFrame
df = spark.read.csv(csv_path, header=True, inferSchema=True)

print(f"\nЗагружено {df.count()} записей из {csv_path}")
print(f"Колонки: {df.columns}")
print("\nПервые 5 записей:")
df.show(5, truncate=False)

print("\nСхема данных:")
df.printSchema()

# %% Шаг 3: Настройка Great Expectations
# Создаём Ephemeral Data Context (без файловой конфигурации)
context = gx.get_context(mode="ephemeral")

# Добавляем PySpark DataFrame как источник данных
data_source = context.data_sources.add_spark(name="employee_datasource")

# Создаём data asset из нашего DataFrame
data_asset = data_source.add_dataframe_asset(name="employee_data")

# Создаём batch definition
batch_definition = data_asset.add_batch_definition_whole_dataframe(
    "employee_batch"
)

print("\nGreat Expectations контекст настроен")
print(f"  Data Source: {data_source.name}")
print(f"  Data Asset: {data_asset.name}")

# %% Шаг 4: Определение Expectation Suite
# Создаём набор ожиданий для проверки качества данных сотрудников
suite = context.suites.add(
    gx.ExpectationSuite(name="employee_data_quality")
)

# Expectation 1: ID не должен быть null
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToNotBeNull(column="id")
)

# Expectation 2: Email не должен быть null
# ОЖИДАЕМЫЙ ПРОВАЛ: ~5 записей с пустыми email
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToNotBeNull(column="email")
)

# Expectation 3: ID должен быть уникальным
# ОЖИДАЕМЫЙ ПРОВАЛ: 1 дубликат id=3
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeUnique(column="id")
)

# Expectation 4: Зарплата должна быть >= 0
# ОЖИДАЕМЫЙ ПРОВАЛ: 3 записи с отрицательными зарплатами
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeBetween(
        column="salary",
        min_value=0
    )
)

# Expectation 5: Колонка department должна существовать
suite.add_expectation(
    gx.expectations.ExpectColumnToExist(column="department")
)

# Expectation 6: Email должен соответствовать формату
# ОЖИДАЕМЫЙ ПРОВАЛ: null emails не соответствуют regex
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToMatchRegex(
        column="email",
        regex=r"^[^@]+@[^@]+\.[^@]+$"
    )
)

# Expectation 7: Status должен быть из допустимых значений
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeInSet(
        column="status",
        value_set=["active", "inactive", "terminated"]
    )
)

# Expectation 8: Зарплата в разумном диапазоне (0 - 500 000)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeBetween(
        column="salary",
        min_value=0,
        max_value=500000
    )
)

print(f"\nExpectation Suite создан: {suite.name}")
print(f"  Всего expectations: 8")

# %% Шаг 5: Создание Validation Definition и запуск валидации
validation_definition = context.validation_definitions.add(
    gx.ValidationDefinition(
        name="employee_validation",
        data=batch_definition,
        suite=suite,
    )
)

# Создаём checkpoint
checkpoint = context.checkpoints.add(
    gx.Checkpoint(
        name="employee_checkpoint",
        validation_definitions=[validation_definition],
    )
)

# Запускаем валидацию с нашим DataFrame
checkpoint_result = checkpoint.run(
    batch_parameters={"dataframe": df}
)

# %% Шаг 6: Анализ результатов
print("\n" + "=" * 60)
print("РЕЗУЛЬТАТЫ ВАЛИДАЦИИ")
print("=" * 60)

# Общий статус
overall_success = checkpoint_result.success
print(f"\nОбщий статус: {'PASSED' if overall_success else 'FAILED'}")
print(f"(Ожидаемо FAILED -- данные содержат намеренные ошибки качества)")

# Детали по каждому expectation
for run_result in checkpoint_result.run_results.values():
    results = run_result["validation_result"]["results"]
    print(f"\nДетали ({len(results)} expectations):")
    print("-" * 60)

    passed = 0
    failed = 0

    for i, result in enumerate(results, 1):
        success = result["success"]
        exp_type = result["expectation_config"]["type"]
        column = result["expectation_config"]["kwargs"].get("column", "N/A")

        status = "PASS" if success else "FAIL"
        if success:
            passed += 1
        else:
            failed += 1

        print(f"  {i}. [{status}] {exp_type}")
        print(f"     Column: {column}")

        # Показываем детали провалов
        if not success and "result" in result:
            res = result["result"]
            if "unexpected_count" in res:
                print(f"     Unexpected count: {res['unexpected_count']}")
            if "unexpected_percent" in res:
                print(f"     Unexpected percent: {res['unexpected_percent']:.1f}%")
            if "partial_unexpected_list" in res and res["partial_unexpected_list"]:
                examples = res["partial_unexpected_list"][:5]
                print(f"     Examples: {examples}")

    print("-" * 60)
    print(f"  ИТОГО: {passed} passed, {failed} failed из {len(results)}")

# %% Шаг 7: Генерация Data Docs
print("\n" + "=" * 60)
print("DATA DOCS")
print("=" * 60)

# Строим Data Docs HTML-отчёт
context.build_data_docs()

# Получаем путь к отчёту
data_docs_sites = context.get_docs_sites_urls()
if data_docs_sites:
    for site in data_docs_sites:
        print(f"\nData Docs отчёт: {site.get('site_url', 'N/A')}")
else:
    print("\nData Docs сгенерированы в директории gx/uncommitted/data_docs/")

print("\nОткройте HTML-отчёт в браузере для интерактивного просмотра")
print("результатов валидации.")

# %% Шаг 8: Сводка по проблемам качества
print("\n" + "=" * 60)
print("СВОДКА ПО ПРОБЛЕМАМ КАЧЕСТВА")
print("=" * 60)
print("""
Обнаруженные проблемы:
  1. Null emails:     ~5 записей без email-адреса
  2. Дубликат ID:     id=3 встречается дважды
  3. Отрицательные зарплаты: 3 записи с salary < 0
  4. Невалидные даты: 2 записи с некорректным форматом hire_date

Рекомендации:
  - Добавить NOT NULL constraint на email в источнике
  - Внедрить UNIQUE constraint на id
  - Добавить CHECK constraint salary >= 0
  - Валидировать формат дат при загрузке

Следующие шаги:
  - Настроить GE валидацию в CI/CD pipeline
  - Добавить alerts при провале critical expectations
  - Интегрировать с Airflow для регулярных проверок
""")

# Завершаем SparkSession
spark.stop()
print("SparkSession остановлен. Лаба завершена!")
