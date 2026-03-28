/**
 * OpenLineageEventDiagram
 *
 * OpenLineage event structure: Input/Output Datasets connected via Job + Run.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function OpenLineageEventDiagram() {
  return (
    <DiagramContainer title="OpenLineage Event" color="cyan">
      <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-4">
        <FlowColumn gap={10} align="center">
          {/* Datasets */}
          <FlowRow gap={8} wrap align="center">
            <FlowNode variant="database" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Dataset (input)</span>
                <span className="text-[10px] opacity-70">namespace · name · facets</span>
              </FlowColumn>
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="database" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Dataset (output)</span>
                <span className="text-[10px] opacity-70">namespace · name · facets</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>

          <Arrow direction="down" label="связаны через" />

          {/* Job + Run */}
          <FlowRow gap={8} wrap align="center">
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Job</span>
                <span className="text-[10px] opacity-70">name · facets</span>
              </FlowColumn>
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="service" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Run</span>
                <span className="text-[10px] opacity-70">id · state · facets</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>
        </FlowColumn>
      </div>
    </DiagramContainer>
  );
}
