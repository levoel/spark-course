/**
 * ApacheAtlasDiagram
 *
 * Apache Atlas architecture: Type System + Lineage Engine + REST API + Classification.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';

export function ApacheAtlasDiagram() {
  return (
    <DiagramContainer title="Apache Atlas" color="indigo">
      <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4">
        <FlowColumn gap={6} align="stretch">
          {/* Row 1 */}
          <FlowRow gap={6} wrap align="start">
            <FlowNode variant="database" size="sm" className="flex-1 min-w-[140px]">
              <FlowColumn gap={1} align="center">
                <span>Type System</span>
                <span className="text-[10px] opacity-70">hive_table · spark_job</span>
                <span className="text-[10px] opacity-70">kafka_topic</span>
              </FlowColumn>
            </FlowNode>
            <FlowNode variant="compute" size="sm" className="flex-1 min-w-[140px]">
              <FlowColumn gap={1} align="center">
                <span>Lineage Engine</span>
                <span className="text-[10px] opacity-70">input → process → output</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>

          {/* Row 2 */}
          <FlowRow gap={6} wrap align="start">
            <FlowNode variant="service" size="sm" className="flex-1 min-w-[140px]">
              <FlowColumn gap={1} align="center">
                <span>REST API</span>
                <span className="text-[10px] opacity-70">CRUD · Search · Lineage</span>
              </FlowColumn>
            </FlowNode>
            <FlowNode variant="security" size="sm" className="flex-1 min-w-[140px]">
              <FlowColumn gap={1} align="center">
                <span>Classification</span>
                <span className="text-[10px] opacity-70">PII · financial · confidential</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>
        </FlowColumn>
      </div>
    </DiagramContainer>
  );
}
