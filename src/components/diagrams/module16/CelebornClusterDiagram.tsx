/**
 * CelebornClusterDiagram
 *
 * Celeborn architecture: Master (Raft HA) → Workers (SSD/HDD + HDFS),
 * Spark Executors push/fetch data, Driver manages lifecycle.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function CelebornClusterDiagram() {
  return (
    <DiagramContainer title="Celeborn Cluster" color="blue">
      <FlowColumn gap={10} align="center">
        {/* Celeborn Cluster box */}
        <div className="w-full rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
          <FlowColumn gap={8} align="center">
            {/* Masters */}
            <FlowRow gap={4} wrap align="center">
              <FlowNode variant="cluster" size="sm">
                <FlowColumn gap={0} align="center">
                  <span>Master (active)</span>
                </FlowColumn>
              </FlowNode>
              <FlowNode variant="cluster" size="sm">
                <FlowColumn gap={0} align="center">
                  <span className="opacity-60">Master (standby)</span>
                </FlowColumn>
              </FlowNode>
              <FlowNode variant="cluster" size="sm">
                <FlowColumn gap={0} align="center">
                  <span className="opacity-60">Master (standby)</span>
                </FlowColumn>
              </FlowNode>
              <span className="text-[10px] text-blue-300">Raft HA</span>
            </FlowRow>

            <Arrow direction="down" label="slot allocation" />

            {/* Workers */}
            <div className="w-full rounded-lg border border-blue-400/15 bg-blue-500/5 p-3">
              <div className="text-xs text-blue-300/70 mb-2">Workers</div>
              <FlowRow gap={4} wrap align="center">
                {[1, 2].map((i) => (
                  <FlowNode key={i} variant="storage" size="sm">
                    <FlowColumn gap={0} align="center">
                      <span>Worker {i}</span>
                      <span className="text-[9px] opacity-70">SSD/HDD + HDFS</span>
                    </FlowColumn>
                  </FlowNode>
                ))}
                <span className="text-xs text-gray-500">...</span>
              </FlowRow>
            </div>
          </FlowColumn>
        </div>

        {/* Push/Fetch arrows + Executors */}
        <FlowRow gap={12} wrap align="start">
          <FlowColumn gap={2} align="center">
            <Arrow direction="up" label="push data" />
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={0} align="center">
                <span>Spark Executor</span>
                <span className="text-[9px] opacity-70">ShuffleClient (Map)</span>
              </FlowColumn>
            </FlowNode>
          </FlowColumn>

          <FlowColumn gap={2} align="center">
            <Arrow direction="down" label="fetch merged" />
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={0} align="center">
                <span>Spark Executor</span>
                <span className="text-[9px] opacity-70">ShuffleClient (Reduce)</span>
              </FlowColumn>
            </FlowNode>
          </FlowColumn>

          <FlowColumn gap={2} align="center">
            <Arrow direction="up" label="metadata" />
            <FlowNode variant="app" size="sm">
              <FlowColumn gap={0} align="center">
                <span>Spark Driver</span>
                <span className="text-[9px] opacity-70">LifecycleManager</span>
              </FlowColumn>
            </FlowNode>
          </FlowColumn>
        </FlowRow>
      </FlowColumn>
    </DiagramContainer>
  );
}
