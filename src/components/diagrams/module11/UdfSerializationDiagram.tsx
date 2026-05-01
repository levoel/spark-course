/**
 * UdfSerializationDiagram
 *
 * Side-by-side comparison: Python UDF (pickle, per-row) vs Pandas UDF (Arrow, per-batch).
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowRow } from '@primitives/FlowRow';
import { FlowColumn } from '@primitives/FlowColumn';
import { Arrow } from '@primitives/Arrow';

export function UdfSerializationDiagram() {
  return (
    <DiagramContainer
      title="Python UDF vs Pandas UDF"
      description="1M socket-вызовов vs 100 Arrow transfers"
      color="blue"
    >
      <FlowRow gap={24} wrap align="start">
        {/* Legacy UDF */}
        <FlowColumn gap={8} align="center" className="flex-1 min-w-[200px]">
          <div className="text-xs font-semibold text-rose-700">Python UDF (pickle, per-row)</div>
          <FlowRow gap={8} wrap={false} align="center">
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={1} align="center">
                <span>JVM Executor</span>
                <span className="text-[10px] opacity-70">Row 1…1M</span>
              </FlowColumn>
            </FlowNode>
            <FlowColumn gap={2} align="center">
              <Arrow direction="right" label="pickle" />
              <Arrow direction="left" label="pickle" />
            </FlowColumn>
            <FlowNode variant="app" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Python Worker</span>
                <span className="text-[10px] opacity-70">func(x) × 1M</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>
          <div className="text-[10px] text-rose-700/70">
            1M socket-вызовов, 1M pickle сериализаций
          </div>
        </FlowColumn>

        {/* Pandas UDF */}
        <FlowColumn gap={8} align="center" className="flex-1 min-w-[200px]">
          <div className="text-xs font-semibold text-emerald-700">Pandas UDF (Arrow, per-batch)</div>
          <FlowRow gap={8} wrap={false} align="center">
            <FlowNode variant="compute" size="sm">
              <FlowColumn gap={1} align="center">
                <span>JVM Executor</span>
                <span className="text-[10px] opacity-70">Batch 1…100</span>
                <span className="text-[10px] opacity-70">(10K rows)</span>
              </FlowColumn>
            </FlowNode>
            <FlowColumn gap={2} align="center">
              <Arrow direction="right" label="Arrow IPC" />
              <Arrow direction="left" label="Arrow IPC" />
            </FlowColumn>
            <FlowNode variant="app" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Python Worker</span>
                <span className="text-[10px] opacity-70">func(series)</span>
                <span className="text-[10px] opacity-70">Vectorized NumPy</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>
          <div className="text-[10px] text-emerald-700/70">
            100 Arrow transfers (вместо 1M pickle transfers)
          </div>
        </FlowColumn>
      </FlowRow>
    </DiagramContainer>
  );
}
