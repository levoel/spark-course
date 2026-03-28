/**
 * FlightPipelineDiagram
 *
 * Arrow Flight streaming: RecordBatch stream over gRPC with parallel streams.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowRow } from '@primitives/FlowRow';
import { FlowColumn } from '@primitives/FlowColumn';
import { Arrow } from '@primitives/Arrow';

export function FlightPipelineDiagram() {
  return (
    <DiagramContainer
      title="Arrow Flight pipeline"
      description="~0.3 сек для 1 GB, zero-serialization overhead"
      color="emerald"
    >
      <FlowRow gap={16} wrap={false} align="center">
        <FlowNode variant="database" size="md">
          <FlowColumn gap={2} align="center">
            <span>Сервер</span>
            <span className="text-xs opacity-70">Columnar Storage</span>
          </FlowColumn>
        </FlowNode>

        <FlowColumn gap={4} align="center">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-1">
              <Arrow direction="right" />
              <span className="text-xs text-emerald-300/80 whitespace-nowrap font-mono">
                RecordBatch #{n}
              </span>
            </div>
          ))}
          <span className="text-[10px] text-gray-400 mt-1">…parallel streams…</span>
        </FlowColumn>

        <FlowNode variant="app" size="md">
          <FlowColumn gap={2} align="center">
            <span>Клиент</span>
            <span className="text-xs opacity-70">Arrow RecordBatch</span>
            <span className="text-xs opacity-70">ready to process (no deser.)</span>
          </FlowColumn>
        </FlowNode>
      </FlowRow>
    </DiagramContainer>
  );
}
