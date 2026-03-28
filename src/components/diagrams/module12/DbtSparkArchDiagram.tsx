/**
 * DbtSparkArchDiagram
 *
 * dbt architecture with Spark: dbt CLI/Cloud → Spark Thrift Server → Spark Engine.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { Arrow } from '@primitives/Arrow';

export function DbtSparkArchDiagram() {
  return (
    <DiagramContainer title="dbt Architecture с Spark" color="emerald">
      <FlowColumn gap={12} align="center">
        <div className="w-full max-w-sm rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
          <FlowNode variant="app" size="md" className="w-full">
            <FlowColumn gap={1} align="center">
              <span>dbt CLI / Cloud</span>
            </FlowColumn>
          </FlowNode>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            <span className="text-[10px] text-emerald-300 bg-emerald-500/10 rounded px-2 py-0.5">
              Models (SELECT SQL)
            </span>
            <span className="text-[10px] text-emerald-300 bg-emerald-500/10 rounded px-2 py-0.5">
              Tests (data assertions)
            </span>
            <span className="text-[10px] text-emerald-300 bg-emerald-500/10 rounded px-2 py-0.5">
              Docs (auto-lineage)
            </span>
          </div>
        </div>

        <Arrow direction="down" label="SQL через dbt-spark adapter" />

        <FlowNode variant="service" size="md">
          <FlowColumn gap={1} align="center">
            <span>Spark Thrift Server</span>
            <span className="text-xs opacity-70">(или Databricks SQL)</span>
          </FlowColumn>
        </FlowNode>

        <Arrow direction="down" />

        <FlowNode variant="compute" size="md">
          <FlowColumn gap={1} align="center">
            <span>Spark Engine</span>
            <span className="text-xs opacity-70">(execution)</span>
          </FlowColumn>
        </FlowNode>
      </FlowColumn>
    </DiagramContainer>
  );
}
