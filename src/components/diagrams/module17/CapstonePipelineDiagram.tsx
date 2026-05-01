/**
 * CapstonePipelineDiagram
 *
 * Capstone project data pipeline: sources → Bronze → Silver → Gold → consumers,
 * with GE validation gates between layers.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function CapstonePipelineDiagram() {
  return (
    <DiagramContainer title="Архитектура Data Pipeline" color="blue">
      <FlowColumn gap={8} align="center">
        {/* Sources */}
        <FlowRow gap={4} wrap align="center">
          <FlowNode variant="database" size="sm">orders.csv</FlowNode>
          <FlowNode variant="database" size="sm">customers.json</FlowNode>
        </FlowRow>

        <Arrow direction="down" />

        {/* Bronze */}
        <div className="w-full max-w-md rounded-xl border border-amber-700/30 bg-amber-900/10 p-3">
          <FlowNode variant="storage" size="md" className="w-full">
            <FlowColumn gap={1} align="center">
              <span className="text-amber-600">Bronze Layer</span>
              <span className="text-[10px] opacity-70">сырые данные, partitioned by date</span>
            </FlowColumn>
          </FlowNode>
        </div>

        <div className="text-[10px] text-emerald-400 font-mono">GE валидация ①</div>
        <Arrow direction="down" />

        {/* Silver */}
        <div className="w-full max-w-md rounded-xl border border-[var(--line-medium)] bg-[var(--bg-deep)] p-3">
          <FlowNode variant="storage" size="md" className="w-full">
            <FlowColumn gap={1} align="center">
              <span className="text-[var(--ink-default)]">Silver Layer</span>
              <span className="text-[10px] opacity-70">enriched: join orders + customers</span>
              <span className="text-[10px] opacity-70">dedup, SCD Type 1 merge</span>
            </FlowColumn>
          </FlowNode>
        </div>

        <div className="text-[10px] text-emerald-400 font-mono">GE валидация ②</div>
        <Arrow direction="down" />

        {/* Gold */}
        <div className="w-full max-w-md rounded-xl border border-yellow-400/30 bg-yellow-500/5 p-3">
          <FlowNode variant="storage" size="md" className="w-full">
            <FlowColumn gap={1} align="center">
              <span className="text-yellow-700">Gold Layer</span>
              <span className="text-[10px] opacity-70">daily_revenue · city_revenue · product_rankings</span>
            </FlowColumn>
          </FlowNode>
        </div>

        <Arrow direction="down" />

        {/* Consumers */}
        <FlowRow gap={4} wrap align="center">
          <FlowNode variant="sink" size="sm">BI / Dashboards</FlowNode>
          <FlowNode variant="sink" size="sm">Ad-hoc Analytics</FlowNode>
          <FlowNode variant="sink" size="sm">ML Features</FlowNode>
        </FlowRow>
      </FlowColumn>
    </DiagramContainer>
  );
}
