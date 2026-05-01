/**
 * MinMaxStatsDiagram
 *
 * Shows Parquet row groups with min/max statistics for order_date, amount, city —
 * and how Spark skips groups using predicate pushdown.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { FlowColumn } from '@primitives/FlowColumn';

interface RowGroupStats {
  label: string;
  rowCount: string;
  stats: { col: string; min: string; max: string }[];
}

const rowGroups: RowGroupStats[] = [
  {
    label: 'Row Group 1',
    rowCount: '50,000 строк',
    stats: [
      { col: 'order_date', min: '2024-01-01', max: '2024-01-15' },
      { col: 'amount', min: '10.0', max: '5000.0' },
      { col: 'city', min: 'Екатеринбург', max: 'Москва' },
    ],
  },
  {
    label: 'Row Group 2',
    rowCount: '50,000 строк',
    stats: [
      { col: 'order_date', min: '2024-01-16', max: '2024-01-31' },
      { col: 'amount', min: '5.0', max: '8000.0' },
      { col: 'city', min: 'Казань', max: 'Ярославль' },
    ],
  },
  {
    label: 'Row Group 3',
    rowCount: '50,000 строк',
    stats: [
      { col: 'order_date', min: '2024-02-01', max: '2024-02-15' },
      { col: 'amount', min: '15.0', max: '3000.0' },
      { col: 'city', min: 'Владивосток', max: 'Новосибирск' },
    ],
  },
];

export function MinMaxStatsDiagram() {
  return (
    <DiagramContainer title="Parquet: min/max statistics per Row Group" color="amber">
      <FlowColumn gap={0} align="start" className="w-full">
        {rowGroups.map((rg, i) => (
          <div
            key={i}
            className={`
              w-full border border-amber-400/30 bg-amber-500/10 px-4 py-3
              ${i === 0 ? 'rounded-t-xl' : ''}
              ${i === rowGroups.length - 1 ? 'rounded-b-xl' : ''}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-amber-700">
                {rg.label}
              </span>
              <span className="text-[10px] text-[var(--ink-muted)] font-mono">{rg.rowCount}</span>
            </div>
            <div className="space-y-0.5 ml-2">
              {rg.stats.map((s, j) => (
                <div key={j} className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-amber-700/70 w-24">{s.col}:</span>
                  <span className="text-emerald-400/70">min={s.min}</span>
                  <span className="text-rose-400/70">max={s.max}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </FlowColumn>
    </DiagramContainer>
  );
}
