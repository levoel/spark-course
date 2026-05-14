/** @jsxImportSource solid-js */
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
        <div class="w-full max-w-md rounded-xl border border-rose-400/20 bg-rose-500/5 p-4">
          <div class="text-xs text-rose-700/70 mb-2">managed by Databricks</div>
          <FlowNode variant="service" size="md" className="w-full">
            <FlowColumn gap={1} align="center">
              <span>Databricks Control Plane</span>
            </FlowColumn>
          </FlowNode>
          <div class="mt-2 flex flex-wrap gap-2 justify-center">
            <span class="text-[10px] text-rose-700 bg-rose-500/10 rounded px-2 py-0.5">
              Workspace Manager
            </span>
            <span class="text-[10px] text-rose-700 bg-rose-500/10 rounded px-2 py-0.5">
              Jobs Scheduler
            </span>
            <span class="text-[10px] text-rose-700 bg-rose-500/10 rounded px-2 py-0.5">
              Unity Catalog
            </span>
          </div>
        </div>

        <Arrow direction="down" label="API" />

        <div class="w-full max-w-md rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
          <div class="text-xs text-blue-700/70 mb-2">your cloud</div>
          <FlowNode variant="cluster" size="md" className="w-full">
            <FlowColumn gap={1} align="center">
              <span>Data Plane</span>
            </FlowColumn>
          </FlowNode>
          <div class="mt-2 flex flex-wrap gap-2 justify-center">
            <span class="text-[10px] text-blue-700 bg-blue-500/10 rounded px-2 py-0.5">
              Compute Clusters
            </span>
            <span class="text-[10px] text-blue-700 bg-blue-500/10 rounded px-2 py-0.5">
              Delta Lake Storage
            </span>
            <span class="text-[10px] text-blue-700 bg-blue-500/10 rounded px-2 py-0.5">
              Network (your VPC)
            </span>
          </div>
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
}
