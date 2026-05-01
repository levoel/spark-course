/**
 * SparkConnectDiagram
 *
 * Spark Connect client-server architecture: lightweight gRPC client
 * sends protobuf query plans, server returns Arrow RecordBatch results.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { Arrow } from '@primitives/Arrow';

export function SparkConnectDiagram() {
  return (
    <DiagramContainer
      title="Spark Connect"
      description="Без JVM, ~50 MB, ~100 MB RAM — gRPC + Arrow Flight"
      color="emerald"
    >
      <FlowColumn gap={12} align="center">
        {/* Client */}
        <div className="w-full max-w-sm rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
          <div className="text-xs text-emerald-700/70 mb-2">Машина разработчика</div>
          <FlowNode variant="connector" size="md" className="w-full">
            <FlowColumn gap={2} align="center">
              <span>Python process ONLY</span>
              <span className="text-xs opacity-70">pip install pyspark[connect]</span>
              <span className="text-xs opacity-70">(лёгкий gRPC клиент)</span>
              <span className="text-[10px] text-emerald-700 mt-1">Без JVM! ~100 MB RAM</span>
            </FlowColumn>
          </FlowNode>
        </div>

        <Arrow direction="down" label="gRPC + Arrow Flight" />

        {/* Server */}
        <div className="w-full max-w-md rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
          <div className="text-xs text-blue-700/70 mb-2">Spark Connect Server</div>
          <FlowNode variant="service" size="md" className="w-full">
            <FlowColumn gap={2} align="center">
              <span>gRPC endpoint</span>
              <span className="text-xs opacity-70">Unresolved Plan → Catalyst → Execute → Arrow RecordBatch</span>
            </FlowColumn>
          </FlowNode>
          <div className="mt-2">
            <FlowNode variant="cluster" size="sm" className="w-full">
              <FlowColumn gap={1} align="center">
                <span>Executors</span>
                <span className="text-xs opacity-70">(data processing)</span>
              </FlowColumn>
            </FlowNode>
          </div>
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
}
