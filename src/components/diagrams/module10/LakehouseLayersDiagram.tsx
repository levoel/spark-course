/**
 * LakehouseLayersDiagram (DIAG-09)
 *
 * Interactive medallion architecture visualization showing Bronze/Silver/Gold
 * layers with format logos, clickable expansion, and ETL pipeline flow.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';

type LayerKey = 'bronze' | 'silver' | 'gold';

interface LayerConfig {
  key: LayerKey;
  label: string;
  color: string;
  borderColor: string;
  activeColor: string;
  activeBorder: string;
  icon: string;
  summary: string[];
  details: string[];
  qualityGuarantee: string;
}

const LAYERS: LayerConfig[] = [
  {
    key: 'gold',
    label: 'Gold',
    color: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    activeColor: 'bg-yellow-500/20',
    activeBorder: 'border-yellow-500/50',
    icon: '\u2B50',
    summary: ['Business aggregates', 'KPI metrics', 'Join-enriched', '~50 tables'],
    details: [
      'Aggregation: GROUP BY + SUM/AVG/COUNT',
      'Joins with dimension tables (customers, products)',
      'Metric computation: revenue, churn, LTV',
      'Materialized views for BI dashboards',
    ],
    qualityGuarantee: 'Business-ready: aggregates verified, referential integrity enforced, metrics within expected ranges',
  },
  {
    key: 'silver',
    label: 'Silver',
    color: 'bg-gray-400/10',
    borderColor: 'border-gray-400/30',
    activeColor: 'bg-gray-400/20',
    activeBorder: 'border-gray-400/50',
    icon: '\u26AA',
    summary: ['Validated schema', 'Deduplicated', 'Type-safe columns', '~800K records/day'],
    details: [
      'Schema enforcement: strict type validation',
      'Null handling: filter or default values',
      'Business key deduplication (event_id)',
      'Data type casting (string -> timestamp, double)',
    ],
    qualityGuarantee: 'Clean data: NOT NULL enforced, types validated, duplicates removed, referential integrity checked',
  },
  {
    key: 'bronze',
    label: 'Bronze',
    color: 'bg-amber-600/10',
    borderColor: 'border-amber-600/30',
    activeColor: 'bg-amber-600/20',
    activeBorder: 'border-amber-600/50',
    icon: '\uD83D\uDFE4',
    summary: ['Raw JSON events', 'No schema validation', 'Append-only', '~1M records/day'],
    details: [
      'Parsing: raw bytes -> JSON structure',
      'Kafka metadata preserved (offset, partition, timestamp)',
      'No deduplication at this layer',
      'Full re-processing capability from source',
    ],
    qualityGuarantee: 'Completeness: all source records preserved as-is, Kafka metadata retained for audit',
  },
];

const FORMATS = ['Delta', 'Iceberg', 'Hudi', 'Paimon'] as const;

const FORMAT_COLORS: Record<string, string> = {
  Delta: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
  Iceberg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
  Hudi: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
  Paimon: 'bg-green-500/20 text-green-300 border-green-400/40',
};

function FlowArrow() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-4 bg-gradient-to-b from-white/30 to-white/10 animate-pulse" />
        <svg width="12" height="8" viewBox="0 0 12 8" className="text-white/30">
          <path d="M6 8L0 0h12z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

export function LakehouseLayersDiagram() {
  const [activeLayer, setActiveLayer] = useState<LayerKey | null>(null);

  return (
    <DiagramContainer title="Lakehouse Medallion Architecture" color="amber">
      <div className="flex flex-col gap-1">
        {/* ETL pipeline label */}
        <div className="text-xs text-gray-500 text-center mb-2">
          Raw JSON &rarr; Validated Parquet (Bronze) &rarr; Cleansed + Deduped (Silver) &rarr; Aggregated Metrics (Gold)
        </div>

        {/* Layers (Gold on top, Bronze on bottom) */}
        {LAYERS.map((layer, idx) => {
          const isActive = activeLayer === layer.key;
          return (
            <div key={layer.key}>
              {idx > 0 && <FlowArrow />}
              <DiagramTooltip content={layer.qualityGuarantee}>
                <button
                  onClick={() => setActiveLayer(isActive ? null : layer.key)}
                  className={`w-full text-left rounded-xl p-4 border backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                    isActive
                      ? `${layer.activeColor} ${layer.activeBorder}`
                      : `${layer.color} ${layer.borderColor} hover:${layer.activeColor}`
                  }`}
                >
                  {/* Layer header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{layer.icon}</span>
                      <span className="text-sm font-semibold text-white">
                        {layer.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {isActive ? 'click to collapse' : 'click to expand'}
                    </span>
                  </div>

                  {/* Summary chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {layer.summary.map((item) => (
                      <span
                        key={item}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Format labels */}
                  <div className="flex gap-1.5">
                    {FORMATS.map((fmt) => (
                      <span
                        key={fmt}
                        className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${FORMAT_COLORS[fmt]}`}
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>

                  {/* Expanded details */}
                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        Transformations:
                      </p>
                      {layer.details.map((detail) => (
                        <div key={detail} className="flex items-start gap-2">
                          <span className="text-emerald-400 text-xs mt-0.5 shrink-0">
                            &rarr;
                          </span>
                          <span className="text-xs text-gray-300">{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              </DiagramTooltip>
            </div>
          );
        })}

        {/* Data source label at bottom */}
        <div className="flex justify-center mt-2">
          <DataBox label="Source" value="Kafka / S3 / JDBC" />
        </div>

        {/* Summary metrics */}
        <div className="flex flex-wrap gap-3 justify-center mt-3">
          <DataBox label="Layers" value="3 (Bronze/Silver/Gold)" />
          <DataBox label="Formats" value="4 (Delta/Iceberg/Hudi/Paimon)" variant="highlight" />
          <DataBox label="Pattern" value="Medallion Architecture" />
        </div>

        {/* Legend */}
        <p className="text-xs text-gray-500 text-center mt-2">
          Click each layer to see transformations. Hover for data quality guarantees.
        </p>
      </div>
    </DiagramContainer>
  );
}
