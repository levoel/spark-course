/**
 * ClassicPySparkDiagram
 *
 * Traditional PySpark architecture: Python + JVM driver on developer machine.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { Arrow } from '@primitives/Arrow';

export function ClassicPySparkDiagram() {
  return (
    <DiagramContainer
      title="Традиционный PySpark"
      description="JVM на каждом клиенте, 4-8 GB RAM minimum"
      color="rose"
    >
      <FlowColumn gap={12} align="center">
        {/* Developer machine */}
        <div className="w-full max-w-md rounded-xl border border-rose-400/20 bg-rose-500/5 p-4">
          <div className="text-xs text-rose-300/70 mb-2">Машина разработчика</div>
          <FlowNode variant="app" size="md" className="w-full">
            <FlowColumn gap={2} align="center">
              <span>Python process</span>
              <span className="text-xs opacity-70">+ JVM process (driver)</span>
              <span className="text-xs opacity-70">+ Spark Core + Catalyst</span>
              <span className="text-xs opacity-70">+ Py4J bridge (Python ↔ JVM)</span>
              <span className="text-[10px] text-rose-300 mt-1">JVM на ноутбуке! 4-8 GB RAM</span>
            </FlowColumn>
          </FlowNode>
        </div>

        <Arrow direction="down" label="RPC (JVM → JVM)" />

        {/* Cluster */}
        <FlowNode variant="cluster" size="md">
          <FlowColumn gap={2} align="center">
            <span>Spark Cluster</span>
            <span className="text-xs opacity-70">(executors)</span>
          </FlowColumn>
        </FlowNode>
      </FlowColumn>
    </DiagramContainer>
  );
}
