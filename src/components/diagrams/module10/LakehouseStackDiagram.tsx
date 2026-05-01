/**
 * LakehouseStackDiagram
 *
 * 3-layer Lakehouse architecture stack:
 * Compute Engines → Metadata Layer → Object Storage.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';

export function LakehouseStackDiagram() {
  return (
    <DiagramContainer
      title="Lakehouse архитектура"
      description="Вычислительные движки → Metadata Layer → Объектное хранилище"
      color="purple"
    >
      <div className="flex flex-col w-full">
        {/* Compute Engines */}
        <div className="rounded-t-xl border border-blue-400/30 bg-blue-500/10 p-3 text-center">
          <div className="text-sm font-semibold text-blue-700 mb-1">
            Вычислительные движки
          </div>
          <div className="text-xs text-blue-700/70">
            Spark, Flink, Trino, Presto
          </div>
        </div>

        {/* Metadata Layer */}
        <div className="border-x border-emerald-400/30 bg-emerald-500/10 p-3 text-center">
          <div className="text-sm font-semibold text-emerald-700 mb-1">
            Metadata Layer
          </div>
          <div className="text-xs text-emerald-700/70">
            transaction log, schema enforcement, snapshots
          </div>
          <div className="text-xs text-emerald-700/70">
            Delta Lake / Iceberg / Hudi / Paimon
          </div>
        </div>

        {/* Object Storage */}
        <div className="rounded-b-xl border border-purple-400/30 bg-purple-500/10 p-3 text-center">
          <div className="text-sm font-semibold text-purple-700 mb-1">
            Объектное хранилище
          </div>
          <div className="text-xs text-purple-700/70">
            S3, GCS, ADLS, MinIO
          </div>
          <div className="text-xs text-purple-700/70">
            Файлы: Parquet, ORC, Avro
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
