"""
generate-data.py -- Generate sample e-commerce data for capstone pipeline.

Usage:
  python3 generate-data.py                     # 100K orders, 1K customers (full)
  python3 generate-data.py --rows 1000 --customers 100  # lite variant
"""

import argparse
import csv
import json
import os
import random
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
CITIES = [
    "Москва", "Санкт-Петербург", "Казань",
    "Новосибирск", "Екатеринбург",
]

STATUSES = ["completed", "pending", "cancelled", "returned"]
STATUS_WEIGHTS = [0.65, 0.15, 0.12, 0.08]

PRODUCTS = [f"PROD-{i:04d}" for i in range(1, 201)]

START_DATE = datetime(2024, 1, 1)
END_DATE = datetime(2024, 12, 31)
DATE_RANGE_DAYS = (END_DATE - START_DATE).days

FIRST_NAMES = [
    "Алексей", "Мария", "Дмитрий", "Анна", "Сергей",
    "Елена", "Павел", "Ольга", "Андрей", "Наталья",
    "Иван", "Екатерина", "Михаил", "Татьяна", "Николай",
    "Светлана", "Артём", "Юлия", "Владимир", "Ирина",
]

LAST_NAMES = [
    "Иванов", "Петрова", "Сидоров", "Кузнецова", "Волков",
    "Фёдорова", "Морозов", "Новикова", "Соколов", "Лебедева",
    "Козлов", "Попова", "Смирнов", "Васильева", "Орлов",
    "Захарова", "Белов", "Медведева", "Тихонов", "Борисова",
]


def random_date() -> str:
    delta = timedelta(days=random.randint(0, DATE_RANGE_DAYS))
    return (START_DATE + delta).strftime("%Y-%m-%d")


def generate_customers(n: int) -> list[dict]:
    customers = []
    for i in range(1, n + 1):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        customers.append({
            "customer_id": i,
            "name": f"{last} {first}",
            "city": random.choice(CITIES),
            "email": f"user{i}@example.com",
            "registered_date": random_date(),
        })
    return customers


def generate_orders(n: int, num_customers: int) -> list[list]:
    orders = []
    for i in range(1, n + 1):
        orders.append([
            i,                                          # order_id
            random.randint(1, num_customers),            # customer_id
            random.choice(PRODUCTS),                     # product_id
            random.randint(1, 20),                       # quantity
            round(random.uniform(100, 50000), 2),        # price
            random.choices(STATUSES, STATUS_WEIGHTS)[0], # status
            random_date(),                               # order_date
        ])
    return orders


def main():
    parser = argparse.ArgumentParser(description="Generate capstone lab data")
    parser.add_argument("--rows", type=int, default=100_000,
                        help="Number of order rows (default: 100000)")
    parser.add_argument("--customers", type=int, default=1000,
                        help="Number of customers (default: 1000)")
    parser.add_argument("--seed", type=int, default=42,
                        help="Random seed for reproducibility")
    args = parser.parse_args()

    random.seed(args.seed)
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # --- Generate customers ---
    customers = generate_customers(args.customers)
    customers_path = os.path.join(script_dir, "customers.json")
    with open(customers_path, "w", encoding="utf-8") as f:
        json.dump(customers, f, ensure_ascii=False, indent=2)
    print(f"Generated {len(customers)} customers -> {customers_path}")

    # --- Generate orders ---
    orders = generate_orders(args.rows, args.customers)
    orders_path = os.path.join(script_dir, "orders.csv")
    with open(orders_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "order_id", "customer_id", "product_id",
            "quantity", "price", "status", "order_date",
        ])
        writer.writerows(orders)
    print(f"Generated {len(orders)} orders -> {orders_path}")


if __name__ == "__main__":
    main()
