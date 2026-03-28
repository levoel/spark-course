/**
 * StandaloneArchDiagram
 *
 * Spark Standalone cluster: Master node with RPC/UI ports,
 * Workers registering to the master.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function StandaloneArchDiagram() {
  return (
    <DiagramContainer title="Standalone Architecture" color="blue">
      <FlowColumn gap={12} align="center">
        <FlowNode variant="cluster" size="md">
          <FlowColumn gap={1} align="center">
            <span>Spark Master</span>
            <span className="text-xs opacity-70">(scheduler)</span>
            <span className="text-[10px] text-blue-300">:8080 (UI) · :7077 (RPC)</span>
          </FlowColumn>
        </FlowNode>

        <Arrow direction="down" label="регистрация" />

        <FlowRow gap={6} wrap align="center">
          {[1, 2, 3].map((i) => (
            <FlowNode key={i} variant="compute" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Worker {i}</span>
                <span className="text-[10px] opacity-70">:8081</span>
              </FlowColumn>
            </FlowNode>
          ))}
        </FlowRow>
      </FlowColumn>
    </DiagramContainer>
  );
}
