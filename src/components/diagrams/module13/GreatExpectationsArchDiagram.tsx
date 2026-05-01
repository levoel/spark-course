/**
 * GreatExpectationsArchDiagram
 *
 * Great Expectations architecture: Data Context with Data Sources,
 * Expectation Suites, Checkpoints → Validator → Data Docs.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function GreatExpectationsArchDiagram() {
  return (
    <DiagramContainer title="Great Expectations Architecture" color="purple">
      <div className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-4">
        <div className="text-xs text-purple-700/70 mb-3">Data Context (центральная конфигурация проекта)</div>

        <FlowColumn gap={10} align="center">
          {/* Top row: 3 components */}
          <FlowRow gap={6} wrap align="start">
            <FlowNode variant="database" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Data Sources</span>
                <span className="text-[10px] opacity-70">Spark DF · Pandas DF · SQL DB</span>
              </FlowColumn>
            </FlowNode>
            <FlowNode variant="security" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Expectation Suites</span>
                <span className="text-[10px] opacity-70">[правила]</span>
              </FlowColumn>
            </FlowNode>
            <FlowNode variant="service" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Checkpoint</span>
                <span className="text-[10px] opacity-70">[запуск валидации]</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>

          <Arrow direction="down" />

          {/* Validator */}
          <FlowNode variant="compute" size="md">
            <FlowColumn gap={1} align="center">
              <span>Validator</span>
              <span className="text-xs opacity-70">(проверяет данные)</span>
            </FlowColumn>
          </FlowNode>

          <Arrow direction="down" />

          {/* Data Docs */}
          <FlowNode variant="sink" size="md">
            <FlowColumn gap={1} align="center">
              <span>Data Docs</span>
              <span className="text-xs opacity-70">(HTML отчёт)</span>
            </FlowColumn>
          </FlowNode>
        </FlowColumn>
      </div>
    </DiagramContainer>
  );
}
