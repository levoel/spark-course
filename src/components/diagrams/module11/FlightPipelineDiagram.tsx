/** @jsxImportSource solid-js */
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
            <span class="text-xs opacity-70">Columnar Storage</span>
          </FlowColumn>
        </FlowNode>

        <FlowColumn gap={4} align="center">
          {[1, 2, 3].map((n) => (
            <div class="flex items-center gap-1">
              <Arrow direction="right" />
              <span class="text-xs text-emerald-700/80 whitespace-nowrap font-mono">
                RecordBatch #{n}
              </span>
            </div>
          ))}
          <span class="text-[10px] text-[var(--ink-muted)] mt-1">…parallel streams…</span>
        </FlowColumn>

        <FlowNode variant="app" size="md">
          <FlowColumn gap={2} align="center">
            <span>Клиент</span>
            <span class="text-xs opacity-70">Arrow RecordBatch</span>
            <span class="text-xs opacity-70">ready to process (no deser.)</span>
          </FlowColumn>
        </FlowNode>
      </FlowRow>
    </DiagramContainer>
  );
}
