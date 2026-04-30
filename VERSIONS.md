# Course versions — Apache Spark Deep-Dive

Last review: 2026-04-30
Next review: 2026-07-30

## Cadence

Квартальный — Spark 4.x и Comet активно эволюционируют, Photon в DBR обновляется ежеквартально, transformWithState и VARIANT тип — новые фичи, требующие регулярной ревизии.

## Pinned baseline (April 2026)

| Component | Version | Released | Course depth |
|-----------|---------|----------|--------------|
| Apache Spark | 4.0 | 2025-03 | full |
| Apache Spark | 4.1 | 2025+ | full |
| transformWithState (Structured Streaming) | GA в 4.0 | 2025-03 | full |
| VARIANT type (semi-structured) | GA в 4.0 | 2025-03 | full |
| Apache Comet | 0.14.0 | 2026-03 | full |
| Photon (Databricks DBR 16/17) | latest | 2026-Q1 | partial |
| Spark Connect | stable | 2025+ | full |
| Apache Iceberg integration | V3 | 2025-06 | full |
| Delta Lake integration | 4.0 / 4.1 | 2025+ | full |
| Apache Hudi integration | 1.0 | 2025+ | partial |
| Apache Arrow (Java) | latest stable | 2026-Q1 | full |
| PySpark | 4.0 / 4.1 | 2025+ | full |
| Spark on Kubernetes | stable | 2026 | full |
| External Shuffle Service / Cloud Shuffle Storage | stable | 2026 | partial |

## Forthcoming (next review)

- Spark 4.2 — дальнейшая стабилизация Spark Connect, новые transformWithState API.
- Comet 0.15 / 1.0 GA — full-stage Arrow execution.
- Photon-альтернативы в OSS (Velox / Comet / Gluten — сравнение).
- Iceberg V3 deletion vectors / row lineage в Spark writers.
- Spark + Iceberg REST catalog (Polaris / Unity OSS / Lakekeeper) production patterns.

## Recent updates

- 2026-04-30 — Wave 1 P0 правки (Spark 4.0/4.1, Comet 0.14.0, Photon DBR 16/17) + Wave 2 новые уроки (transformWithState, VARIANT, alternative execution engines) + Wave 3 cross-refs (storage-formats, kafka-course, datafusion-course).
