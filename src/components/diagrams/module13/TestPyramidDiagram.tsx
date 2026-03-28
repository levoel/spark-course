/**
 * TestPyramidDiagram
 *
 * Testing pyramid: Unit (fast, every commit) → Integration (module) → E2E (rare).
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowColumn } from '@primitives/FlowColumn';

interface PyramidLayer {
  label: string;
  detail: string;
  trigger: string;
  color: string;
  borderColor: string;
  bgColor: string;
  width: string;
}

const layers: PyramidLayer[] = [
  {
    label: 'E2E (rare)',
    detail: 'Полный pipeline на реальном кластере',
    trigger: 'Запуск: вручную / release',
    color: 'text-red-300',
    borderColor: 'border-red-400/30',
    bgColor: 'bg-red-500/5',
    width: 'max-w-[200px]',
  },
  {
    label: 'Integration (module)',
    detail: 'Spark + DB/Kafka/S3',
    trigger: 'Запуск: merge to main / nightly',
    color: 'text-amber-300',
    borderColor: 'border-amber-400/30',
    bgColor: 'bg-amber-500/5',
    width: 'max-w-[300px]',
  },
  {
    label: 'Unit (fast)',
    detail: 'Чистые функции, local SparkSession',
    trigger: 'Запуск: каждый commit / pre-commit',
    color: 'text-emerald-300',
    borderColor: 'border-emerald-400/30',
    bgColor: 'bg-emerald-500/5',
    width: 'max-w-[400px]',
  },
];

export function TestPyramidDiagram() {
  return (
    <DiagramContainer title="Пирамида тестирования" color="blue">
      <FlowColumn gap={0} align="center">
        {layers.map((layer, i) => (
          <div
            key={i}
            className={`w-full ${layer.width} mx-auto p-3 border ${layer.borderColor} ${layer.bgColor} ${
              i === 0 ? 'rounded-t-xl' : ''
            } ${i === layers.length - 1 ? 'rounded-b-xl' : ''} ${
              i > 0 ? 'border-t-0' : ''
            }`}
          >
            <div className={`text-sm font-medium ${layer.color} text-center`}>
              {layer.label}
            </div>
            <div className="text-xs text-gray-400 text-center mt-0.5">{layer.detail}</div>
            <div className="text-[10px] text-gray-500 text-center mt-0.5">{layer.trigger}</div>
          </div>
        ))}
      </FlowColumn>
    </DiagramContainer>
  );
}
