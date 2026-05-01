/**
 * ArrowBatchVsPerRowDiagram
 *
 * Comparison of per-row serialization (Python UDF) vs per-batch Arrow transfer
 * (Pandas UDF) showing the 10,000x reduction in socket calls.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowRow } from '@primitives/FlowRow';
import { FlowColumn } from '@primitives/FlowColumn';
import { Arrow } from '@primitives/Arrow';

export function ArrowBatchVsPerRowDiagram() {
  return (
    <DiagramContainer title="Per-Row (Python UDF) vs Per-Batch (Pandas UDF, Arrow)" color="blue">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Per-row side */}
        <div className="flex flex-col gap-3">
          <div className="text-center text-sm font-semibold text-rose-700 mb-1">
            Python UDF (per-row)
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 space-y-1">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2 text-[11px] font-mono text-rose-700">
                <FlowNode variant="compute" size="sm" className="!py-0.5 !px-2 !text-[10px]">
                  JVM
                </FlowNode>
                <span className="text-[var(--ink-subtle)]">──[row {n}]──→</span>
                <FlowNode variant="app" size="sm" className="!py-0.5 !px-2 !text-[10px]">
                  Python
                </FlowNode>
                <span className="text-[var(--ink-subtle)]">──[result {n}]──→</span>
                <FlowNode variant="compute" size="sm" className="!py-0.5 !px-2 !text-[10px]">
                  JVM
                </FlowNode>
              </div>
            ))}
            <div className="text-center text-[10px] text-[var(--ink-subtle)] pt-1">
              ... (1 миллиард socket-вызовов)
            </div>
          </div>
        </div>

        {/* Per-batch side */}
        <div className="flex flex-col gap-3">
          <div className="text-center text-sm font-semibold text-emerald-700 mb-1">
            Pandas UDF (per-batch, Arrow)
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-700">
              <FlowNode variant="compute" size="sm" className="!py-0.5 !px-2 !text-[10px]">
                JVM
              </FlowNode>
              <span className="text-[var(--ink-muted)] text-center flex-1">
                ──[batch 10,000 rows, Arrow]──→
              </span>
              <FlowNode variant="app" size="sm" className="!py-0.5 !px-2 !text-[10px]">
                Python
              </FlowNode>
            </div>
            <div className="text-center text-[10px] text-emerald-400/60">
              (1 socket-вызов, columnar, zero-copy)
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-700">
              <FlowNode variant="app" size="sm" className="!py-0.5 !px-2 !text-[10px]">
                Python
              </FlowNode>
              <span className="text-[var(--ink-muted)] text-center flex-1">
                ──[batch 10,000 results, Arrow]──→
              </span>
              <FlowNode variant="compute" size="sm" className="!py-0.5 !px-2 !text-[10px]">
                JVM
              </FlowNode>
            </div>
            <div className="text-center text-[10px] text-emerald-400/60">
              ... (100,000 socket-вызовов вместо 1 миллиарда)
            </div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
