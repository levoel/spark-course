/**
 * ZeroCopyDiagram
 *
 * Shows zero-copy via shared memory: both processes share a pointer
 * to the same Arrow Buffer in shared memory.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';

export function ZeroCopyDiagram() {
  return (
    <DiagramContainer
      title="Zero-copy передача"
      description="~0 сек, 1× потребление памяти"
      color="emerald"
    >
      <FlowColumn gap={12} align="center">
        {/* Processes */}
        <FlowRow gap={48} wrap={false} align="center">
          <FlowNode variant="compute" size="md">
            <FlowColumn gap={2} align="center">
              <span>Процесс A</span>
              <span className="text-xs opacity-70">Pointer ─────┐</span>
            </FlowColumn>
          </FlowNode>

          <FlowNode variant="compute" size="md">
            <FlowColumn gap={2} align="center">
              <span>Процесс B</span>
              <span className="text-xs opacity-70">┌───── Pointer</span>
            </FlowColumn>
          </FlowNode>
        </FlowRow>

        {/* Shared memory */}
        <div className="w-full max-w-md">
          <FlowNode variant="storage" size="lg" className="w-full">
            <FlowColumn gap={2} align="center">
              <span className="font-semibold">Shared Memory (1 GB)</span>
              <span className="text-xs opacity-70">Arrow Buffer</span>
              <span className="text-xs opacity-70">(одна копия данных)</span>
            </FlowColumn>
          </FlowNode>
        </div>

        <div className="text-center text-xs text-gray-400">
          Итого: ~0 сек, 1× memory usage
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
}
