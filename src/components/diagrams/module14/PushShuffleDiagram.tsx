/**
 * PushShuffleDiagram
 *
 * Traditional pull-based shuffle vs Push-based shuffle with merge service.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function PushShuffleDiagram() {
  return (
    <DiagramContainer title="Traditional vs Push-based Shuffle" color="amber">
      <FlowColumn gap={10} align="stretch">
        {/* Traditional - pull-based */}
        <div>
          <div className="text-xs text-gray-400 mb-2">Traditional shuffle (pull-based):</div>
          <FlowRow gap={6} wrap align="center">
            <FlowColumn gap={2} align="center">
              {[1, 2, 3].map((i) => (
                <FlowNode key={i} variant="compute" size="sm">
                  <span className="text-[11px]">Mapper {i}</span>
                </FlowNode>
              ))}
            </FlowColumn>
            <Arrow direction="right" label="PULL" />
            <FlowNode variant="compute" size="md">
              <FlowColumn gap={1} align="center">
                <span>Reducer</span>
                <span className="text-[9px] opacity-70">PULLS from ALL mappers</span>
                <span className="text-[9px] opacity-70">(N×M connections)</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>
        </div>

        {/* Push-based */}
        <div>
          <div className="text-xs text-emerald-300 mb-2">Push-based shuffle:</div>
          <FlowRow gap={6} wrap align="center">
            <FlowColumn gap={2} align="center">
              {[1, 2, 3].map((i) => (
                <FlowNode key={i} variant="compute" size="sm">
                  <span className="text-[11px]">Mapper {i}</span>
                </FlowNode>
              ))}
            </FlowColumn>
            <Arrow direction="right" label="PUSH" />
            <FlowNode variant="service" size="md">
              <FlowColumn gap={1} align="center">
                <span>Merge Service</span>
                <span className="text-[9px] opacity-70">locally merged file</span>
              </FlowColumn>
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="compute" size="md">
              <FlowColumn gap={1} align="center">
                <span>Reducer</span>
                <span className="text-[9px] opacity-70">reads merged</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
}
