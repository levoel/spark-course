/**
 * RemoteShuffleDiagram
 *
 * Remote push-based shuffle (Celeborn/Uniffle): Map executor pushes async
 * to shuffle service, Reduce executor fetches merged data.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function RemoteShuffleDiagram() {
  return (
    <DiagramContainer
      title="Remote Shuffle (push-based)"
      description="Benefit: executor dies → shuffle data SAFE on remote servers"
      color="emerald"
    >
      <FlowRow gap={6} wrap align="center">
        <div className="rounded-xl border border-blue-400/20 bg-blue-500/5 p-3">
          <div className="text-xs text-blue-700/70 mb-2">Executor 1 (Map)</div>
          <FlowNode variant="compute" size="sm">
            <FlowColumn gap={1} align="center">
              <span>Map Task</span>
              <span className="text-[10px] opacity-70">ShuffleClient (async)</span>
            </FlowColumn>
          </FlowNode>
        </div>

        <Arrow direction="right" label="push" />

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3">
          <div className="text-xs text-emerald-700/70 mb-2">Shuffle Service</div>
          <FlowNode variant="service" size="sm">
            <FlowColumn gap={1} align="center">
              <span>Merged data</span>
              <span className="text-[10px] opacity-70">by partition</span>
              <span className="text-[10px] opacity-70">Replicated storage</span>
            </FlowColumn>
          </FlowNode>
        </div>

        <Arrow direction="right" />

        <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-3">
          <div className="text-xs text-amber-700/70 mb-2">Executor 3 (Reduce)</div>
          <FlowNode variant="compute" size="sm">
            <FlowColumn gap={1} align="center">
              <span>Reduce Task</span>
              <span className="text-[10px] opacity-70">Fetch merged data</span>
            </FlowColumn>
          </FlowNode>
        </div>
      </FlowRow>
    </DiagramContainer>
  );
}
