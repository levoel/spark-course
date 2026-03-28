/**
 * CustomMetricsPipelineDiagram
 *
 * Shows the integration pipeline: AccumulatorV2 → Driver, SparkListener → Logging,
 * Custom MetricSource → Prometheus → Grafana → Alerts.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

interface PipelineBranch {
  source: string;
  target: string;
  sourceVariant: 'app' | 'compute' | 'service' | 'monitoring' | 'connector';
  targetVariant: 'app' | 'compute' | 'service' | 'monitoring' | 'connector';
  chain?: string[];
}

const branches: PipelineBranch[] = [
  {
    source: 'AccumulatorV2',
    target: 'Driver (post-job analysis)',
    sourceVariant: 'compute',
    targetVariant: 'service',
  },
  {
    source: 'SparkListener',
    target: 'Structured Logging (ELK/Loki)',
    sourceVariant: 'compute',
    targetVariant: 'service',
  },
  {
    source: 'Custom MetricSource',
    target: 'Prometheus',
    sourceVariant: 'compute',
    targetVariant: 'monitoring',
    chain: ['Grafana', 'Alerts'],
  },
];

export function CustomMetricsPipelineDiagram() {
  return (
    <DiagramContainer title="Custom Metrics: полный pipeline" color="emerald">
      <FlowColumn gap={6}>
        <FlowNode variant="app" size="md">
          Application Code
        </FlowNode>

        <div className="flex flex-col gap-4 w-full">
          {branches.map((branch, i) => (
            <FlowRow key={i} gap={6} wrap={true} justify="center">
              <FlowNode variant={branch.sourceVariant} size="sm">
                {branch.source}
              </FlowNode>
              <Arrow direction="right" />
              <FlowNode variant={branch.targetVariant} size="sm">
                {branch.target}
              </FlowNode>
              {branch.chain?.map((step, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Arrow direction="right" />
                  <FlowNode variant="monitoring" size="sm">
                    {step}
                  </FlowNode>
                </div>
              ))}
            </FlowRow>
          ))}
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
}
