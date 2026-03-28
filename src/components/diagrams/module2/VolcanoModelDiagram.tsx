/**
 * VolcanoModelDiagram
 *
 * Simple call chain showing the Volcano Iterator Model:
 * Aggregate.next() → Filter.next() → Project.next() → Scan.next()
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { FlowColumn } from '@primitives/FlowColumn';

const operators = [
  'Aggregate.next()',
  'Filter.next()',
  'Project.next()',
  'Scan.next()',
];

export function VolcanoModelDiagram() {
  return (
    <DiagramContainer title="Volcano Iterator Model" color="rose">
      <FlowColumn gap={4}>
        {operators.map((op, i) => (
          <div key={i} className="flex flex-col items-center">
            <FlowNode variant="connector" size="sm">
              {op}
            </FlowNode>
            {i < operators.length - 1 && (
              <Arrow direction="down" label="next()" />
            )}
          </div>
        ))}
      </FlowColumn>
    </DiagramContainer>
  );
}
