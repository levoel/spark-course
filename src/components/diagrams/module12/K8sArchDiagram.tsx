/**
 * K8sArchDiagram
 *
 * Kubernetes Spark architecture: API Server → Driver Pod → Executor Pods.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function K8sArchDiagram() {
  return (
    <DiagramContainer title="Kubernetes Architecture" color="cyan">
      <FlowColumn gap={12} align="center">
        <FlowNode variant="service" size="md">
          Kubernetes API Server
        </FlowNode>

        <Arrow direction="down" />

        <FlowNode variant="app" size="md">
          <FlowColumn gap={1} align="center">
            <span>Spark Driver Pod</span>
            <span className="text-xs opacity-70">(creates executor pods)</span>
          </FlowColumn>
        </FlowNode>

        <Arrow direction="down" />

        <FlowRow gap={6} wrap align="center">
          {[1, 2, 3].map((i) => (
            <FlowNode key={i} variant="compute" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Executor</span>
                <span className="text-[10px] opacity-70">Pod {i}</span>
              </FlowColumn>
            </FlowNode>
          ))}
        </FlowRow>
      </FlowColumn>
    </DiagramContainer>
  );
}
