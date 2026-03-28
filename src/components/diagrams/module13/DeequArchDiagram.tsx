/**
 * DeequArchDiagram
 *
 * Deequ architecture: Analyzers + Checks + Constraint Suggestions
 * → Verification Result → Metrics Repository.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function DeequArchDiagram() {
  return (
    <DiagramContainer title="Deequ Architecture" color="blue">
      <div className="rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
        <div className="text-xs text-blue-300/70 mb-3">Deequ</div>

        <FlowColumn gap={10} align="center">
          {/* Top row: 3 components */}
          <FlowRow gap={6} wrap align="start">
            <FlowNode variant="monitoring" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Analyzers</span>
                <span className="text-[10px] opacity-70">Метрики данных</span>
              </FlowColumn>
            </FlowNode>
            <FlowNode variant="security" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Checks</span>
                <span className="text-[10px] opacity-70">Правила валидации</span>
              </FlowColumn>
            </FlowNode>
            <FlowNode variant="service" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Constraint Suggestions</span>
                <span className="text-[10px] opacity-70">Авто-генерация</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>

          <Arrow direction="down" />

          {/* Verification Result */}
          <FlowNode variant="compute" size="md">
            Verification Result
          </FlowNode>

          <Arrow direction="down" />

          {/* Metrics Repository */}
          <FlowNode variant="database" size="md">
            <FlowColumn gap={1} align="center">
              <span>Metrics Repository</span>
              <span className="text-xs opacity-70">(time-series)</span>
            </FlowColumn>
          </FlowNode>
        </FlowColumn>
      </div>
    </DiagramContainer>
  );
}
