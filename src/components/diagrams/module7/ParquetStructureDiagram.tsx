/**
 * ParquetStructureDiagram
 *
 * Visualizes Parquet file structure: Row Groups containing Column Chunks
 * with min/max statistics, plus a footer with schema + statistics.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { FlowColumn } from '@primitives/FlowColumn';

interface RowGroupData {
  label: string;
  columns: { name: string; stat: string }[];
}

const rowGroups: RowGroupData[] = [
  {
    label: 'Row Group 1 (128MB)',
    columns: [
      { name: 'Column "id": [1..50000]', stat: 'min=1, max=50000' },
      { name: 'Column "name": [...]', stat: '' },
      { name: 'Column "salary": [...]', stat: 'min=30000, max=150000' },
    ],
  },
  {
    label: 'Row Group 2 (128MB)',
    columns: [
      { name: 'Column "id": [50001..]', stat: 'min=50001, max=100000' },
      { name: '...', stat: '' },
    ],
  },
];

export function ParquetStructureDiagram() {
  return (
    <DiagramContainer title="Parquet файл: структура" color="purple">
      <FlowColumn gap={0} align="start" className="w-full">
        {rowGroups.map((rg, i) => (
          <div
            key={i}
            className="w-full border border-purple-400/30 bg-purple-500/10 px-4 py-3 first:rounded-t-xl"
          >
            <div className="text-sm font-semibold text-purple-200 mb-2">
              {rg.label}
            </div>
            {rg.columns.map((col, j) => (
              <div key={j} className="flex items-center gap-2 ml-4 text-xs font-mono text-purple-300/80">
                <span className="text-gray-500">{j < rg.columns.length - 1 ? '├──' : '└──'}</span>
                <span>{col.name}</span>
                {col.stat && (
                  <span className="text-amber-400/70 ml-1">← {col.stat}</span>
                )}
              </div>
            ))}
          </div>
        ))}
        <div className="w-full border border-purple-400/30 bg-purple-500/20 px-4 py-2 rounded-b-xl">
          <DiagramTooltip content="Footer содержит schema всех колонок и агрегированную статистику. Spark читает footer первым для планирования запроса.">
            <span className="text-sm font-semibold text-purple-200 cursor-help">
              Footer: schema + statistics
            </span>
          </DiagramTooltip>
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
}
