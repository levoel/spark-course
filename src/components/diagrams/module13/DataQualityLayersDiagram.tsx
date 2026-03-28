/**
 * DataQualityLayersDiagram
 *
 * Data quality layers: Bronze → Silver → Gold with progressive validation checks.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowColumn } from '@primitives/FlowColumn';
import { Arrow } from '@primitives/Arrow';

interface QualityLayer {
  name: string;
  subtitle: string;
  checks: string[];
  color: string;
  borderColor: string;
  bgColor: string;
}

const layers: QualityLayer[] = [
  {
    name: 'BRONZE',
    subtitle: 'raw ingestion',
    checks: [
      'Schema validation (типы, имена колонок)',
      'Row count > 0',
      'Primary key NOT NULL',
      'Timestamp в разумном диапазоне',
    ],
    color: 'text-amber-600',
    borderColor: 'border-amber-700/30',
    bgColor: 'bg-amber-900/10',
  },
  {
    name: 'SILVER',
    subtitle: 'cleaned, conformed',
    checks: [
      'Все Bronze проверки +',
      'Business rules (amount > 0, email valid)',
      'Referential integrity (FK exists)',
      'Uniqueness constraints',
      'Completeness > threshold (99.5%)',
    ],
    color: 'text-gray-300',
    borderColor: 'border-gray-400/30',
    bgColor: 'bg-gray-500/5',
  },
  {
    name: 'GOLD',
    subtitle: 'aggregated, business-ready',
    checks: [
      'Все Silver проверки +',
      'Aggregation consistency (sum matches)',
      'Cross-table validation',
      'Statistical anomaly detection',
      'Row count vs expected (±20%)',
    ],
    color: 'text-yellow-300',
    borderColor: 'border-yellow-400/30',
    bgColor: 'bg-yellow-500/5',
  },
];

export function DataQualityLayersDiagram() {
  return (
    <DiagramContainer title="Data Quality Layers" color="amber">
      <FlowColumn gap={8} align="stretch">
        {layers.map((layer, i) => (
          <div key={i}>
            <div className={`rounded-xl border ${layer.borderColor} ${layer.bgColor} p-4`}>
              <div className={`text-sm font-semibold ${layer.color} mb-2`}>
                {layer.name}{' '}
                <span className="text-xs font-normal opacity-70">({layer.subtitle})</span>
              </div>
              <div className="space-y-1">
                {layer.checks.map((check, ci) => (
                  <div key={ci} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>
            {i < layers.length - 1 && (
              <div className="flex justify-center py-1">
                <Arrow direction="down" />
              </div>
            )}
          </div>
        ))}
      </FlowColumn>
    </DiagramContainer>
  );
}
