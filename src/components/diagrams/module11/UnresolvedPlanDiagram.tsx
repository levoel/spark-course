/**
 * UnresolvedPlanDiagram
 *
 * Shows the protobuf-encoded UnresolvedPlan structure:
 * Aggregate → Filter → Read, ~500 bytes.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowColumn } from '@primitives/FlowColumn';

const planLines = [
  { text: 'UnresolvedPlan {', indent: 0 },
  { text: 'root: Aggregate {', indent: 1 },
  { text: 'groupBy: ["dept"]', indent: 2 },
  { text: 'agg: [avg("salary")]', indent: 2 },
  { text: 'child: Filter {', indent: 2 },
  { text: 'condition: "age > 30"', indent: 3 },
  { text: 'child: Read {', indent: 3 },
  { text: 'source: "s3://data/events/"', indent: 4 },
  { text: '}', indent: 3 },
  { text: '}', indent: 2 },
  { text: '}', indent: 1 },
  { text: '}', indent: 0 },
];

export function UnresolvedPlanDiagram() {
  return (
    <DiagramContainer
      title="Protobuf Query Plan"
      description="~500 байт — передаётся план, не данные"
      color="amber"
    >
      <FlowColumn gap={0} align="start">
        <div className="font-mono text-xs text-[var(--ink-default)] bg-[var(--bg-sunken)] rounded-lg p-3 w-full">
          {planLines.map((line, i) => (
            <div key={i} style={{ paddingLeft: `${line.indent * 16}px` }}>
              <span className={line.text.includes(':') ? 'text-amber-700' : 'text-[var(--ink-muted)]'}>
                {line.text}
              </span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-[var(--ink-subtle)] mt-2 text-center w-full">
          ~500 байт protobuf (не данные!)
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
}
