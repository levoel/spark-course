/**
 * RapidsGpuDiagram
 *
 * Standard Spark (CPU) vs RAPIDS (GPU) execution pipelines.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function RapidsGpuDiagram() {
  return (
    <DiagramContainer title="Без RAPIDS vs С RAPIDS" color="emerald">
      <FlowColumn gap={10} align="stretch">
        {/* Without RAPIDS */}
        <div>
          <div className="text-xs text-[var(--ink-muted)] mb-2">Без RAPIDS (стандартный Spark):</div>
          <FlowRow gap={4} wrap align="center">
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={0} align="center">
                <span>Logical Plan</span>
                <span className="text-[9px] opacity-70">(Catalyst)</span>
              </FlowColumn>
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={0} align="center">
                <span>Physical Plan</span>
                <span className="text-[9px] opacity-70">(CPU ops)</span>
              </FlowColumn>
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={0} align="center">
                <span>CPU Execution</span>
                <span className="text-[9px] opacity-70">(JVM threads)</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>
        </div>

        {/* With RAPIDS */}
        <div>
          <div className="text-xs text-emerald-700 mb-2">С RAPIDS:</div>
          <FlowRow gap={4} wrap align="center">
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={0} align="center">
                <span>Logical Plan</span>
                <span className="text-[9px] opacity-70">(Catalyst)</span>
              </FlowColumn>
            </FlowNode>
            <Arrow direction="right" />
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-2">
              <FlowNode variant="connector" size="sm">
                <FlowColumn gap={0} align="center">
                  <span>Physical Plan</span>
                  <span className="text-[9px] opacity-70">(GPU ops)</span>
                </FlowColumn>
              </FlowNode>
              <div className="mt-1 text-[9px] text-emerald-700 text-center">
                GPU Plugin replaces CPU ops
              </div>
            </div>
            <Arrow direction="right" />
            <FlowNode variant="connector" size="sm">
              <FlowColumn gap={0} align="center">
                <span>GPU Execution</span>
                <span className="text-[9px] opacity-70">(CUDA cores)</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
}
