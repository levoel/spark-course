/**
 * JdbcPipelineDiagram
 *
 * Shows the JDBC/ODBC data transfer bottleneck:
 * Row-by-row serialization, text encoding, single TCP stream.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowRow } from '@primitives/FlowRow';
import { FlowColumn } from '@primitives/FlowColumn';
import { Arrow } from '@primitives/Arrow';

const problems = [
  '1. Row-by-row serialization',
  '2. TCP transfer (with row framing)',
];

export function JdbcPipelineDiagram() {
  return (
    <DiagramContainer
      title="JDBC/ODBC pipeline"
      description="~30 сек для 1 GB, CPU-bound serialization"
      color="rose"
    >
      <FlowRow gap={16} wrap={false} align="center">
        <FlowNode variant="database" size="md">
          <FlowColumn gap={2} align="center">
            <span>Сервер</span>
            <span className="text-xs opacity-70">Columnar Storage</span>
          </FlowColumn>
        </FlowNode>

        <FlowColumn gap={4} align="center">
          {problems.map((p, i) => (
            <div key={i} className="flex items-center gap-1">
              <Arrow direction="right" />
              <span className="text-xs text-gray-400 whitespace-nowrap">{p}</span>
            </div>
          ))}
          <span className="text-[10px] text-rose-300/70 mt-1">text/binary encoding</span>
        </FlowColumn>

        <FlowNode variant="app" size="md">
          <FlowColumn gap={2} align="center">
            <span>Клиент</span>
            <span className="text-xs opacity-70">Parse rows → rebuild columns</span>
          </FlowColumn>
        </FlowNode>
      </FlowRow>
    </DiagramContainer>
  );
}
