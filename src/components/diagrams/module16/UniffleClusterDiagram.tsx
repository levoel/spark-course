/**
 * UniffleClusterDiagram
 *
 * Uniffle architecture: Coordinator (HA) → Shuffle Servers (Memory + Local + HDFS),
 * Spark Executors push/read data.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function UniffleClusterDiagram() {
  return (
    <DiagramContainer title="Uniffle Cluster" color="purple">
      <FlowColumn gap={10} align="center">
        {/* Uniffle Cluster box */}
        <div className="w-full rounded-xl border border-purple-400/20 bg-purple-500/5 p-4">
          <FlowColumn gap={8} align="center">
            {/* Coordinators */}
            <FlowRow gap={4} wrap align="center">
              <FlowNode variant="cluster" size="sm">
                <FlowColumn gap={0} align="center">
                  <span>Coordinator (assigns)</span>
                </FlowColumn>
              </FlowNode>
              <FlowNode variant="cluster" size="sm">
                <FlowColumn gap={0} align="center">
                  <span className="opacity-60">Coordinator (standby)</span>
                </FlowColumn>
              </FlowNode>
              <span className="text-[10px] text-purple-700">HA cluster</span>
            </FlowRow>

            <Arrow direction="down" label="heartbeat + assignment" />

            {/* Shuffle Servers */}
            <div className="w-full rounded-lg border border-purple-400/15 bg-purple-500/5 p-3">
              <div className="text-xs text-purple-700/70 mb-2">Shuffle Servers</div>
              <FlowRow gap={4} wrap align="center">
                {[1, 2].map((i) => (
                  <FlowNode key={i} variant="storage" size="sm">
                    <FlowColumn gap={0} align="center">
                      <span>Server {i}</span>
                      <span className="text-[9px] opacity-70">Memory + Local + HDFS</span>
                    </FlowColumn>
                  </FlowNode>
                ))}
              </FlowRow>
            </div>
          </FlowColumn>
        </div>

        {/* Push/Read arrows + Executors */}
        <FlowRow gap={12} wrap align="start">
          <FlowColumn gap={2} align="center">
            <Arrow direction="up" label="push data" />
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={0} align="center">
                <span>Spark Executor</span>
                <span className="text-[9px] opacity-70">(Map tasks)</span>
              </FlowColumn>
            </FlowNode>
          </FlowColumn>

          <FlowColumn gap={2} align="center">
            <Arrow direction="down" label="read data" />
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={0} align="center">
                <span>Spark Executor</span>
                <span className="text-[9px] opacity-70">(Reduce tasks)</span>
              </FlowColumn>
            </FlowNode>
          </FlowColumn>
        </FlowRow>
      </FlowColumn>
    </DiagramContainer>
  );
}
