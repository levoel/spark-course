/**
 * PerRowVsColumnarDiagram
 *
 * Shows how per-row cloudpickle serialization (N serialize calls) differs
 * from columnar Arrow batch (1 serialize call for the entire batch).
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowRow } from '@primitives/FlowRow';

export function PerRowVsColumnarDiagram() {
  return (
    <DiagramContainer title="Per-row (cloudpickle) vs Per-batch (Arrow)" color="emerald">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Per-row */}
        <div className="flex flex-col gap-2">
          <div className="text-center text-sm font-semibold text-rose-300 mb-1">
            Per-row (cloudpickle)
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 space-y-1">
            {[
              { label: 'Row 1: {a:1, b:2}', extra: '→ serialize' },
              { label: 'Row 2: {a:2, b:4}', extra: '→ serialize' },
              { label: 'Row 3: {a:3, b:6}', extra: '→ serialize' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] font-mono text-rose-300/80">
                <span>{row.label}</span>
                <span className="text-rose-400/50">{row.extra}</span>
              </div>
            ))}
            <div className="text-[10px] text-gray-500 pt-1">...</div>
            <div className="text-[11px] font-mono text-rose-400 font-semibold pt-1">
              N serializations
            </div>
          </div>
        </div>

        {/* Per-batch */}
        <div className="flex flex-col gap-2">
          <div className="text-center text-sm font-semibold text-emerald-300 mb-1">
            Per-batch (Arrow)
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 space-y-1">
            <div className="text-[11px] font-mono text-emerald-300/80">
              Column A: [1, 2, 3...]
            </div>
            <div className="text-[11px] font-mono text-emerald-300/80">
              Column B: [2, 4, 6...]
            </div>
            <div className="h-px bg-emerald-400/20 my-2" />
            <div className="text-[11px] font-mono text-emerald-400 font-semibold">
              1 serialize call for entire batch
            </div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
