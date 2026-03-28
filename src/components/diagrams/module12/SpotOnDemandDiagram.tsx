/**
 * SpotOnDemandDiagram
 *
 * Cost optimization architecture: On-Demand driver + Core executors + Spot task executors.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowColumn } from '@primitives/FlowColumn';

interface LayerConfig {
  label: string;
  detail: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

const layers: LayerConfig[] = [
  {
    label: 'Driver: ВСЕГДА On-Demand',
    detail: 'потеря driver = потеря всего job',
    color: 'text-red-300',
    borderColor: 'border-red-400/30',
    bgColor: 'bg-red-500/5',
  },
  {
    label: 'Core Executors: On-Demand (30%)',
    detail: 'гарантированный минимум для shuffle',
    color: 'text-amber-300',
    borderColor: 'border-amber-400/30',
    bgColor: 'bg-amber-500/5',
  },
  {
    label: 'Task Executors: Spot (70%)',
    detail: 'масштабирование, потеря допустима',
    color: 'text-emerald-300',
    borderColor: 'border-emerald-400/30',
    bgColor: 'bg-emerald-500/5',
  },
];

export function SpotOnDemandDiagram() {
  return (
    <DiagramContainer title="Архитектура: On-Demand + Spot" color="amber">
      <FlowColumn gap={0} align="stretch">
        {layers.map((layer, i) => (
          <div
            key={i}
            className={`p-4 border ${layer.borderColor} ${layer.bgColor} ${
              i === 0 ? 'rounded-t-xl' : ''
            } ${i === layers.length - 1 ? 'rounded-b-xl' : ''} ${
              i > 0 ? 'border-t-0' : ''
            }`}
          >
            <div className={`text-sm font-medium ${layer.color}`}>{layer.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">({layer.detail})</div>
          </div>
        ))}
      </FlowColumn>
    </DiagramContainer>
  );
}
