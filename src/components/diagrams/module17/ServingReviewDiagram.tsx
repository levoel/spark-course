/**
 * ServingReviewDiagram
 *
 * Full capstone pipeline review: sources → Bronze → GE Gate → Silver → GE Gate → Gold → Serving,
 * with side-channel quarantine tables and quality log.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function ServingReviewDiagram() {
  return (
    <DiagramContainer title="Pipeline Architecture (Review)" color="emerald">
      <FlowRow gap={8} wrap={false} align="start">
        {/* Main pipeline */}
        <FlowColumn gap={6} align="center" className="flex-1">
          {/* Sources */}
          <FlowRow gap={4} wrap align="center">
            <FlowNode variant="database" size="sm">
              <FlowColumn gap={0} align="center">
                <span>orders.csv</span>
                <span className="text-[9px] opacity-70">(source)</span>
              </FlowColumn>
            </FlowNode>
            <FlowNode variant="database" size="sm">
              <FlowColumn gap={0} align="center">
                <span>customers.json</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>

          <Arrow direction="down" />

          {/* Bronze */}
          <div className="w-full rounded-xl border border-amber-700/30 bg-amber-900/10 p-3">
            <FlowNode variant="storage" size="sm" className="w-full">
              <FlowColumn gap={1} align="center">
                <span className="text-amber-600 font-medium">BRONZE LAYER</span>
                <span className="text-[9px] opacity-70">orders_bronze (Delta, part.)</span>
                <span className="text-[9px] opacity-70">customers_bronze (Delta)</span>
              </FlowColumn>
            </FlowNode>
          </div>

          {/* GE Bronze Gate */}
          <FlowNode variant="security" size="sm">
            <FlowColumn gap={0} align="center">
              <span>GE Bronze Gate</span>
              <span className="text-[9px] opacity-70">null checks, ranges, valid status</span>
            </FlowColumn>
          </FlowNode>

          <Arrow direction="down" />

          {/* Silver */}
          <div className="w-full rounded-xl border border-[var(--line-medium)] bg-[var(--bg-deep)] p-3">
            <FlowNode variant="storage" size="sm" className="w-full">
              <FlowColumn gap={1} align="center">
                <span className="text-[var(--ink-default)] font-medium">SILVER LAYER</span>
                <span className="text-[9px] opacity-70">enriched_orders (join + dedup)</span>
                <span className="text-[9px] opacity-70">customers_dim (SCD Type 1)</span>
              </FlowColumn>
            </FlowNode>
          </div>

          {/* GE Silver Gate */}
          <FlowNode variant="security" size="sm">
            <FlowColumn gap={0} align="center">
              <span>GE Silver Gate</span>
              <span className="text-[9px] opacity-70">unique order_id, ref integrity</span>
            </FlowColumn>
          </FlowNode>

          <Arrow direction="down" />

          {/* Gold */}
          <div className="w-full rounded-xl border border-yellow-400/30 bg-yellow-500/5 p-3">
            <FlowNode variant="storage" size="sm" className="w-full">
              <FlowColumn gap={1} align="center">
                <span className="text-yellow-700 font-medium">GOLD LAYER</span>
                <span className="text-[9px] opacity-70">daily_revenue · city_revenue (+ running total)</span>
                <span className="text-[9px] opacity-70">product_rankings (+ dense_rank)</span>
              </FlowColumn>
            </FlowNode>
          </div>

          <Arrow direction="down" />

          {/* Serving */}
          <FlowNode variant="sink" size="md">
            <FlowColumn gap={1} align="center">
              <span>SERVING LAYER</span>
              <span className="text-[10px] opacity-70">Parquet exports for BI/ML</span>
            </FlowColumn>
          </FlowNode>
        </FlowColumn>

        {/* Side channel */}
        <div className="shrink-0 mt-auto">
          <div className="rounded-xl border border-red-400/20 bg-red-500/5 p-3">
            <div className="text-xs text-red-700/70 mb-2">Side channel</div>
            <FlowColumn gap={2} align="center">
              <FlowNode variant="monitoring" size="sm">
                <FlowColumn gap={0} align="center">
                  <span>Quarantine tables</span>
                  <span className="text-[9px] opacity-70">invalid rows</span>
                </FlowColumn>
              </FlowNode>
              <FlowNode variant="monitoring" size="sm">
                <FlowColumn gap={0} align="center">
                  <span>Quality log</span>
                  <span className="text-[9px] opacity-70">validation metrics</span>
                </FlowColumn>
              </FlowNode>
            </FlowColumn>
          </div>
        </div>
      </FlowRow>
    </DiagramContainer>
  );
}
