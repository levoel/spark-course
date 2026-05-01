/**
 * CrossValidatorDiagram
 *
 * CrossValidator flow: ParamGrid × K-Fold cross-validation →
 * average metrics → best params → retrain.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';

export function CrossValidatorDiagram() {
  return (
    <DiagramContainer title="CrossValidator Flow" color="amber">
      <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
        <div className="text-sm font-medium text-amber-700 mb-3">
          ParamGrid: 18 комбинаций
        </div>

        <FlowColumn gap={4} align="stretch">
          {/* Folds */}
          <div className="rounded-lg border border-amber-400/15 bg-amber-500/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--ink-muted)]">K-Fold Cross-Validation</span>
              <span className="text-[10px] text-amber-700 font-mono">× 18 params</span>
            </div>
            {[1, 2, 3].map((fold) => (
              <div key={fold} className="flex items-center gap-2 mb-1">
                <FlowNode variant="compute" size="sm" className="flex-1">
                  <span className="text-[11px]">
                    Fold {fold}: train(66%) / validate(33%)
                  </span>
                </FlowNode>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="space-y-2 text-xs text-[var(--ink-default)] pl-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">→</span>
              Average metrics across 3 folds
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">→</span>
              Select params with best average
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">→</span>
              Retrain on full training data
            </div>
          </div>
        </FlowColumn>
      </div>
    </DiagramContainer>
  );
}
