/**
 * DatabricksArchDiagram
 *
 * Databricks architecture: Control Plane (managed) → Data Plane (customer cloud).
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { Arrow } from '@primitives/Arrow';

export function DatabricksArchDiagram() {
  return (
    <DiagramContainer title="Databricks Architecture" color="rose">
      <FlowColumn gap={12} align="center">
        <div className="w-full max-w-md rounded-xl border border-rose-400/20 bg-rose-500/5 p-4">
          <div className="text-xs text-rose-300/70 mb-2">managed by Databricks</div>
          <FlowNode variant="service" size="md" className="w-full">
            <FlowColumn gap={1} align="center">
              <span>Databricks Control Plane</span>
            </FlowColumn>
          </FlowNode>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            <span className="text-[10px] text-rose-300 bg-rose-500/10 rounded px-2 py-0.5">
              Workspace Manager
            </span>
            <span className="text-[10px] text-rose-300 bg-rose-500/10 rounded px-2 py-0.5">
              Jobs Scheduler
            </span>
            <span className="text-[10px] text-rose-300 bg-rose-500/10 rounded px-2 py-0.5">
              Unity Catalog
            </span>
          </div>
        </div>

        <Arrow direction="down" label="API" />

        <div className="w-full max-w-md rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
          <div className="text-xs text-blue-300/70 mb-2">your cloud</div>
          <FlowNode variant="cluster" size="md" className="w-full">
            <FlowColumn gap={1} align="center">
              <span>Data Plane</span>
            </FlowColumn>
          </FlowNode>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            <span className="text-[10px] text-blue-300 bg-blue-500/10 rounded px-2 py-0.5">
              Compute Clusters
            </span>
            <span className="text-[10px] text-blue-300 bg-blue-500/10 rounded px-2 py-0.5">
              Delta Lake Storage
            </span>
            <span className="text-[10px] text-blue-300 bg-blue-500/10 rounded px-2 py-0.5">
              Network (your VPC)
            </span>
          </div>
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
}
