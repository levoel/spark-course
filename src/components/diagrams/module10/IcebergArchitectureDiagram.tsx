/**
 * IcebergArchitectureDiagram
 *
 * 5-layer Iceberg metadata hierarchy:
 * Catalog → Metadata File → Manifest List → Manifest Files → Data Files.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';

const layers = [
  {
    label: 'Catalog',
    detail: 'Указатель на текущий snapshot\n(Hive Metastore, REST, Glue, Nessie)',
    color: 'bg-blue-500/15 border-blue-400/30 text-blue-700',
  },
  {
    label: 'Metadata File (.json)',
    detail: 'Текущая схема, partition spec,\nsnapshot history',
    color: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-700',
  },
  {
    label: 'Manifest List (.avro)',
    detail: 'Список manifest-файлов\nдля текущего snapshot',
    color: 'bg-amber-500/15 border-amber-400/30 text-amber-700',
  },
  {
    label: 'Manifest Files (.avro)',
    detail: 'Список data-файлов с column\nstatistics (min/max/count)',
    color: 'bg-purple-500/15 border-purple-400/30 text-purple-700',
  },
  {
    label: 'Data Files (.parquet)',
    detail: 'Сами данные',
    color: 'bg-rose-500/15 border-rose-400/30 text-rose-700',
  },
];

export function IcebergArchitectureDiagram() {
  return (
    <DiagramContainer
      title="Iceberg архитектура"
      description="Catalog-first: 5-уровневая структура metadata"
      color="blue"
    >
      <div className="flex flex-col gap-1 w-full">
        {layers.map((layer, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 ${layer.color}`}
          >
            <div className="text-sm font-semibold mb-0.5">{layer.label}</div>
            <div className="text-xs opacity-70 whitespace-pre-line">
              {layer.detail}
            </div>
          </div>
        ))}
      </div>
    </DiagramContainer>
  );
}
