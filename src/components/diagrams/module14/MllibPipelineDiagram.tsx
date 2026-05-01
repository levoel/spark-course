/**
 * MllibPipelineDiagram
 *
 * MLlib Pipeline stages: Estimators fit to Models (Transformers),
 * Pipeline.fit(train_df) → PipelineModel.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';
import { FlowNode } from '@primitives/FlowNode';

interface PipelineStage {
  name: string;
  type: 'estimator' | 'transformer';
  modelName: string;
  modelType: string;
}

const stages: PipelineStage[] = [
  { name: 'StringIndex', type: 'estimator', modelName: 'IndexModel', modelType: 'Transform' },
  { name: 'VectorAssembler', type: 'transformer', modelName: 'VectorAssembler', modelType: 'Transformer' },
  { name: 'StandardScaler', type: 'estimator', modelName: 'ScalerModel', modelType: 'Transformer' },
  { name: 'LogisticRegress.', type: 'estimator', modelName: 'LR Model', modelType: 'Transformer' },
];

export function MllibPipelineDiagram() {
  return (
    <DiagramContainer
      title="Pipeline Stages"
      description="Pipeline.fit(train_df) → PipelineModel.transform(test_df) → predictions"
      color="purple"
    >
      <FlowColumn gap={8} align="center">
        {/* Top row: Stages (Estimators/Transformers) */}
        <div>
          <div className="text-xs text-[var(--ink-muted)] mb-2 text-center">Stages (fit)</div>
          <FlowRow gap={4} wrap align="center">
            {stages.map((stage, i) => (
              <div key={i} className="flex items-center gap-2">
                <FlowNode
                  variant={stage.type === 'estimator' ? 'compute' : 'connector'}
                  size="sm"
                >
                  <FlowColumn gap={0} align="center">
                    <span className="text-[11px]">{stage.name}</span>
                    <span className="text-[9px] opacity-70">
                      ({stage.type === 'estimator' ? 'Estimator' : 'Transformer'})
                    </span>
                  </FlowColumn>
                </FlowNode>
                {i < stages.length - 1 && <Arrow direction="right" />}
              </div>
            ))}
          </FlowRow>
        </div>

        {/* Arrow down: fit() -> Model */}
        <div className="text-xs text-[var(--ink-muted)] text-center">
          fit() → Model / pass-through
        </div>

        {/* Bottom row: Models (all Transformers) */}
        <div>
          <div className="text-xs text-[var(--ink-muted)] mb-2 text-center">PipelineModel (transform)</div>
          <FlowRow gap={4} wrap align="center">
            {stages.map((stage, i) => (
              <div key={i} className="flex items-center gap-2">
                <FlowNode variant="connector" size="sm">
                  <FlowColumn gap={0} align="center">
                    <span className="text-[11px]">{stage.modelName}</span>
                    <span className="text-[9px] opacity-70">({stage.modelType})</span>
                  </FlowColumn>
                </FlowNode>
                {i < stages.length - 1 && <Arrow direction="right" />}
              </div>
            ))}
          </FlowRow>
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
}
