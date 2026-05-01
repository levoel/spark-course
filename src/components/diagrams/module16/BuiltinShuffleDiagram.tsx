/**
 * BuiltinShuffleDiagram
 *
 * Built-in pull-based shuffle: Map executor writes to local disk,
 * Reduce executor fetches — executor death = data loss.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function BuiltinShuffleDiagram() {
  return (
    <DiagramContainer
      title="Built-in Shuffle (pull-based)"
      description="Problem: executor dies → shuffle files LOST → recompute"
      color="red"
    >
      <FlowRow gap={10} wrap align="center">
        <div className="rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
          <div className="text-xs text-blue-700/70 mb-2">Executor 1 (Map)</div>
          <FlowNode variant="compute" size="sm">
            <FlowColumn gap={1} align="center">
              <span>Map Task</span>
              <span className="text-[10px] opacity-70">↓ Local Disk</span>
              <span className="text-[10px] opacity-70">shuffle files</span>
            </FlowColumn>
          </FlowNode>
        </div>

        <Arrow direction="right" label="pull" />

        <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
          <div className="text-xs text-amber-700/70 mb-2">Executor 3 (Reduce)</div>
          <FlowNode variant="compute" size="sm">
            <FlowColumn gap={1} align="center">
              <span>Reduce Task</span>
              <span className="text-[10px] opacity-70">↑ Fetch</span>
            </FlowColumn>
          </FlowNode>
        </div>
      </FlowRow>
    </DiagramContainer>
  );
}
