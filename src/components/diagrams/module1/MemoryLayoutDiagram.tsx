/**
 * MemoryLayoutDiagram
 *
 * Executor JVM Heap memory layout showing three regions:
 * Reserved Memory, User Memory, and Spark Memory (Storage + Execution).
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';

export function MemoryLayoutDiagram() {
  return (
    <DiagramContainer
      title="Executor JVM Heap (spark.executor.memory = 4g)"
      color="purple"
    >
      <FlowColumn gap={6}>
        {/* Reserved Memory */}
        <FlowNode variant="security" size="sm">
          Reserved Memory: 300 MB (фиксировано)
        </FlowNode>

        {/* User Memory */}
        <FlowColumn gap={2}>
          <FlowNode variant="service" size="md">
            User Memory: (1 − fraction) × (total − 300MB)
          </FlowNode>
          <div className="flex flex-wrap gap-1.5 pl-4">
            <FlowNode variant="service" size="sm">UDF-объекты</FlowNode>
            <FlowNode variant="service" size="sm">RDD internal metadata</FlowNode>
            <FlowNode variant="service" size="sm">
              Пользовательские структуры данных
            </FlowNode>
          </div>
        </FlowColumn>

        {/* Spark Memory */}
        <FlowColumn gap={4}>
          <FlowNode variant="cluster" size="lg">
            Spark Memory: fraction × (total − 300MB)
          </FlowNode>

          <FlowRow>
            {/* Storage Memory */}
            <FlowColumn gap={2}>
              <FlowNode variant="storage" size="md">
                Storage Memory
              </FlowNode>
              <div className="flex flex-col gap-1 pl-2">
                <FlowNode variant="storage" size="sm">
                  Кэшированные RDD / DataFrame
                </FlowNode>
                <FlowNode variant="storage" size="sm">
                  Broadcast-переменные
                </FlowNode>
                <FlowNode variant="storage" size="sm">
                  Unroll memory
                </FlowNode>
              </div>
            </FlowColumn>

            {/* Execution Memory */}
            <FlowColumn gap={2}>
              <FlowNode variant="connector" size="md">
                Execution Memory
              </FlowNode>
              <div className="flex flex-col gap-1 pl-2">
                <FlowNode variant="connector" size="sm">
                  Shuffle buffers
                </FlowNode>
                <FlowNode variant="connector" size="sm">
                  Join buffers
                </FlowNode>
                <FlowNode variant="connector" size="sm">
                  Sort buffers
                </FlowNode>
                <FlowNode variant="connector" size="sm">
                  Aggregation buffers
                </FlowNode>
              </div>
            </FlowColumn>
          </FlowRow>
        </FlowColumn>
      </FlowColumn>
    </DiagramContainer>
  );
}
