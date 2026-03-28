/**
 * CdcPipelineDiagram
 *
 * Shows the full CDC pipeline: Database → Debezium → Kafka → Spark Structured Streaming → Delta Lake.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

const stages = [
  { label: 'Database\n(source)', variant: 'database' as const, sub: 'WAL/binlog' },
  { label: 'Debezium\nConnector', variant: 'connector' as const, sub: 'CDC events' },
  { label: 'Kafka\n(events)', variant: 'queue' as const, sub: 'JSON/Avro' },
  { label: 'Spark\nStructured\nStreaming', variant: 'compute' as const, sub: 'Parse + merge' },
  { label: 'Delta Lake\n(target)', variant: 'storage' as const, sub: 'ACID table' },
];

export function CdcPipelineDiagram() {
  return (
    <DiagramContainer
      title="CDC Pipeline"
      description="Database → Debezium → Kafka → Spark → Delta Lake"
      color="emerald"
    >
      <FlowRow gap={8} wrap align="center">
        {stages.map((s, i) => (
          <FlowRow key={i} gap={8} wrap={false} align="center">
            <FlowNode variant={s.variant} size="sm">
              <div className="flex flex-col items-center gap-0.5">
                {s.label.split('\n').map((line, j) => (
                  <span key={j}>{line}</span>
                ))}
                <span className="text-[10px] opacity-60 mt-0.5">{s.sub}</span>
              </div>
            </FlowNode>
            {i < stages.length - 1 && <Arrow direction="right" />}
          </FlowRow>
        ))}
      </FlowRow>
    </DiagramContainer>
  );
}
