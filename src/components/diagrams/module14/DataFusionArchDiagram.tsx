/**
 * DataFusionArchDiagram
 *
 * DataFusion architecture: SQL Parser → Logical Optimizer → Physical Executor → Arrow RecordBatch.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function DataFusionArchDiagram() {
  return (
    <DiagramContainer title="DataFusion Architecture" color="cyan">
      <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-4">
        <div className="text-xs text-cyan-700/70 mb-3">DataFusion</div>

        <FlowColumn gap={10} align="center">
          <FlowRow gap={4} wrap align="center">
            <FlowNode variant="service" size="sm">
              <FlowColumn gap={0} align="center">
                <span>SQL Parser</span>
                <span className="text-[9px] opacity-70">+ Planner</span>
              </FlowColumn>
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={0} align="center">
                <span>Logical</span>
                <span className="text-[9px] opacity-70">Optimizer</span>
              </FlowColumn>
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={0} align="center">
                <span>Physical</span>
                <span className="text-[9px] opacity-70">Executor</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>

          <Arrow direction="down" />

          <FlowNode variant="storage" size="md">
            <FlowColumn gap={1} align="center">
              <span>Apache Arrow RecordBatch</span>
              <span className="text-xs opacity-70">(columnar, zero-copy)</span>
            </FlowColumn>
          </FlowNode>
        </FlowColumn>
      </div>
    </DiagramContainer>
  );
}
