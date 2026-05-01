/**
 * RowVsColumnarDiagram
 *
 * Visual comparison: Row-oriented storage (reads all columns)
 * vs Columnar storage (reads only needed columns).
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';

const rows = [
  { id: 1, name: 'Анна', age: 28, dept: 'IT', salary: '95K' },
  { id: 2, name: 'Борис', age: 34, dept: 'HR', salary: '78K' },
  { id: 3, name: 'Вера', age: 41, dept: 'IT', salary: '112K' },
];

const columns = [
  { name: 'id', values: '[1, 2, 3]', skip: true },
  { name: 'name', values: '[Анна, …]', skip: true },
  { name: 'age', values: '[28, 34, 41]', skip: true },
  { name: 'dept', values: '[IT, HR, IT]', skip: true },
  { name: 'salary', values: '[95K, 78K, 112K]', skip: false },
];

export function RowVsColumnarDiagram() {
  return (
    <DiagramContainer
      title="Row vs Columnar"
      description="SELECT AVG(salary) — нужна только 1 колонка из 6"
      color="blue"
    >
      <FlowRow gap={24} wrap align="start">
        {/* Row-oriented */}
        <FlowColumn gap={4} align="start" className="flex-1 min-w-[220px]">
          <div className="text-xs font-semibold text-rose-700">
            Row-oriented (строчное хранение)
          </div>
          <div className="rounded-lg border border-rose-400/20 bg-rose-500/5 p-2 w-full">
            {rows.map((row, i) => (
              <div key={i} className="text-xs font-mono text-[var(--ink-default)] py-0.5 flex gap-1 flex-wrap">
                <span className="text-rose-700/40">id={row.id}</span>
                <span className="text-rose-700/40">name="{row.name}"</span>
                <span className="text-rose-700/40">age={row.age}</span>
                <span className="text-rose-700/40">dept="{row.dept}"</span>
                <span className="text-emerald-700">salary={row.salary}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-rose-700/70">
            ← читаем ВСЁ, 83% данных выбрасываются
          </div>
        </FlowColumn>

        {/* Columnar */}
        <FlowColumn gap={4} align="start" className="flex-1 min-w-[200px]">
          <div className="text-xs font-semibold text-emerald-700">
            Columnar (колоночное хранение)
          </div>
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-2 w-full">
            {columns.map((col, i) => (
              <div
                key={i}
                className={`text-xs font-mono py-0.5 flex items-center gap-2 ${
                  col.skip ? 'text-[var(--ink-subtle)]' : 'text-emerald-700'
                }`}
              >
                <span className="w-14 shrink-0">{col.name}:</span>
                <span>{col.values}</span>
                <span className="text-[10px]">
                  {col.skip ? '← пропускаем' : '← читаем ТОЛЬКО это!'}
                </span>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-emerald-700/70">
            ← читаем только salary
          </div>
        </FlowColumn>
      </FlowRow>
    </DiagramContainer>
  );
}
