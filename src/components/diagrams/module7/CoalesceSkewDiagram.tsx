/**
 * CoalesceSkewDiagram
 *
 * Shows how coalesce(2) from 4 partitions can produce uneven file sizes
 * when source partitions have different sizes.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowRow } from '@primitives/FlowRow';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';

interface PartitionPair {
  sources: { label: string; size: string }[];
  targetLabel: string;
  targetSize: string;
  skewed: boolean;
}

const pairs: PartitionPair[] = [
  {
    sources: [
      { label: 'Партиция 1', size: '100MB' },
      { label: 'Партиция 2', size: '100MB' },
    ],
    targetLabel: 'Файл 1',
    targetSize: '200MB',
    skewed: false,
  },
  {
    sources: [
      { label: 'Партиция 3', size: '10MB' },
      { label: 'Партиция 4', size: '10MB' },
    ],
    targetLabel: 'Файл 2',
    targetSize: '20MB',
    skewed: true,
  },
];

export function CoalesceSkewDiagram() {
  return (
    <DiagramContainer title="coalesce(2): неравномерные файлы" color="amber">
      <div className="flex flex-col gap-4">
        <div className="text-center text-xs text-[var(--ink-muted)] font-mono mb-1">
          coalesce(2) из 4 партиций:
        </div>
        {pairs.map((pair, pi) => (
          <FlowRow key={pi} gap={8} wrap={false} justify="center">
            <div className="flex flex-col gap-1 items-end">
              {pair.sources.map((s, si) => (
                <FlowNode key={si} variant="connector" size="sm">
                  {s.label} ({s.size})
                </FlowNode>
              ))}
            </div>
            <Arrow direction="right" />
            <FlowNode
              variant={pair.skewed ? 'app' : 'compute'}
              size="sm"
            >
              {pair.targetLabel} ({pair.targetSize})
              {pair.skewed && (
                <span className="text-amber-400 ml-1">← неравномерно!</span>
              )}
            </FlowNode>
          </FlowRow>
        ))}
      </div>
    </DiagramContainer>
  );
}
