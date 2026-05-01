/**
 * StreamingMicroBatchDiagram
 *
 * Visualizes the Structured Streaming micro-batch model:
 * Unbounded Input Table → DataFrame API (Catalyst) → Result Table (sink).
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

const batches = [
  { label: 'Batch 0', detail: 'rows 1-100' },
  { label: 'Batch 1', detail: 'rows 101-250' },
  { label: 'Batch 2', detail: 'rows 251-400' },
  { label: 'Batch 3 …', detail: 'rows 401+' },
];

export function StreamingMicroBatchDiagram() {
  return (
    <DiagramContainer
      title="Micro-batch модель"
      description="Unbounded Input Table → DataFrame API → Result Table"
      color="blue"
    >
      <FlowColumn gap={16} align="center">
        {/* Unbounded Input Table */}
        <FlowNode variant="queue" size="lg">
          <FlowColumn gap={4} align="center">
            <span className="font-semibold">Unbounded Input Table</span>
            <FlowRow gap={8} wrap>
              {batches.map((b, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-400/20 text-xs text-amber-700"
                >
                  {b.label}
                  <br />
                  <span className="text-[10px] opacity-70">{b.detail}</span>
                </span>
              ))}
            </FlowRow>
          </FlowColumn>
        </FlowNode>

        <Arrow direction="down" label="каждый batch" />

        {/* DataFrame API */}
        <FlowNode variant="compute" size="md">
          <FlowColumn gap={2} align="center">
            <span>DataFrame API</span>
            <span className="text-xs opacity-70">filter / join / agg</span>
            <span className="text-xs opacity-70">Catalyst Optimizer</span>
          </FlowColumn>
        </FlowNode>

        <Arrow direction="down" />

        {/* Result Table */}
        <FlowNode variant="storage" size="md">
          <FlowColumn gap={2} align="center">
            <span>Result Table</span>
            <span className="text-xs opacity-70">(sink output)</span>
          </FlowColumn>
        </FlowNode>
      </FlowColumn>
    </DiagramContainer>
  );
}
