/**
 * TraditionalCopyDiagram
 *
 * Shows 3-step data transfer with serialization:
 * Process A → Serialize → Copy → Deserialize → Process B.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

const steps = [
  { label: '1. Serialize', detail: 'encode to bytes', time: '~2.5 сек' },
  { label: '2. Copy', detail: 'memcpy / socket', time: '~0.5 сек' },
  { label: '3. Deserialize', detail: 'decode from bytes', time: '~2.5 сек' },
];

export function TraditionalCopyDiagram() {
  return (
    <DiagramContainer
      title="Традиционная передача данных"
      description="~5.5 сек для 1 GB, 2× потребление памяти"
      color="rose"
    >
      <FlowRow gap={24} wrap={false} align="center">
        {/* Process A */}
        <FlowNode variant="compute" size="md">
          <FlowColumn gap={2} align="center">
            <span>Процесс A</span>
            <span className="text-xs opacity-70">Данные в RAM</span>
            <span className="text-xs opacity-70">(1 GB)</span>
          </FlowColumn>
        </FlowNode>

        {/* Steps */}
        <FlowColumn gap={6} align="center">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <Arrow direction="right" />
              <div className="text-xs text-[var(--ink-default)]">
                <div className="font-semibold">{s.label}</div>
                <div className="opacity-60">{s.detail}</div>
                <div className="text-amber-700/80">{s.time}</div>
              </div>
            </div>
          ))}
        </FlowColumn>

        {/* Process B */}
        <FlowNode variant="compute" size="md">
          <FlowColumn gap={2} align="center">
            <span>Процесс B</span>
            <span className="text-xs opacity-70">Данные в RAM</span>
            <span className="text-xs opacity-70">(1 GB)</span>
          </FlowColumn>
        </FlowNode>
      </FlowRow>

      <div className="text-center text-xs text-[var(--ink-muted)] mt-3">
        Итого: ~5.5 сек для 1 GB, 2× memory usage
      </div>
    </DiagramContainer>
  );
}
