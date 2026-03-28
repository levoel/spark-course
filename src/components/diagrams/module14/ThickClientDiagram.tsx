/**
 * ThickClientDiagram
 *
 * Traditional Spark thick client: Python + JVM driver on client machine
 * directly connected to cluster executors via RPC.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function ThickClientDiagram() {
  return (
    <DiagramContainer
      title="Традиционный режим (thick client)"
      description="Crash клиента = потеря всего job"
      color="blue"
    >
      <FlowRow gap={12} wrap align="center">
        {/* Client Machine */}
        <div className="rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
          <div className="text-xs text-blue-300/70 mb-2">Client Machine</div>
          <FlowNode variant="app" size="md">
            <FlowColumn gap={1} align="center">
              <span>Python Process</span>
              <span className="text-[10px] opacity-70">+ JVM Driver</span>
              <span className="text-[10px] opacity-70">+ SparkContext</span>
              <span className="text-[10px] text-amber-300">(~300MB pyspark)</span>
            </FlowColumn>
          </FlowNode>
        </div>

        <Arrow direction="right" label="RPC" />

        {/* Cluster */}
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
          <div className="text-xs text-emerald-300/70 mb-2">Cluster</div>
          <FlowColumn gap={3} align="center">
            {[1, 2, 3].map((i) => (
              <FlowNode key={i} variant="compute" size="sm">
                Executor {i}
              </FlowNode>
            ))}
          </FlowColumn>
        </div>
      </FlowRow>
    </DiagramContainer>
  );
}
