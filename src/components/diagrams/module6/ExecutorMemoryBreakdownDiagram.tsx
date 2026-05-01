/**
 * ExecutorMemoryBreakdownDiagram
 *
 * Shows memory layout of an executor JVM when running Python UDFs:
 * Spark execution memory, Python workers, and buffer memory.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

interface MemorySegment {
  label: string;
  size: string;
  color: string;
  tooltip: string;
  flex: number;
}

const segments: MemorySegment[] = [
  {
    label: 'Spark execution memory',
    size: '~2.4GB',
    color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700',
    tooltip: 'Основная память Spark: shuffle buffers, joins, sort, кэш.',
    flex: 6,
  },
  {
    label: 'Python worker 1',
    size: '~100MB',
    color: 'bg-rose-500/20 border-rose-500/30 text-rose-700',
    tooltip: 'Полноценный Python-интерпретатор: runtime + UDF + данные.',
    flex: 1,
  },
  {
    label: 'Python worker 2',
    size: '~100MB',
    color: 'bg-rose-500/20 border-rose-500/30 text-rose-700',
    tooltip: 'Второй Python worker для параллельных tasks.',
    flex: 1,
  },
  {
    label: 'Buffer memory',
    size: '~200MB',
    color: 'bg-[var(--bg-deep)] border-[var(--line-medium)] text-[var(--ink-default)]',
    tooltip: 'Буферная память для I/O и внутренних структур.',
    flex: 1,
  },
];

export function ExecutorMemoryBreakdownDiagram() {
  return (
    <DiagramContainer title="Executor JVM (4GB) с Python UDF" color="rose">
      <div className="flex flex-col gap-3">
        <div className="flex w-full rounded-xl overflow-hidden border border-[var(--line-thin)]">
          {segments.map((s, i) => (
            <DiagramTooltip key={i} content={s.tooltip}>
              <div
                className={`border-r last:border-r-0 p-2 text-center cursor-help ${s.color}`}
                style={{ flex: s.flex, minWidth: 0 }}
              >
                <div className="text-[10px] font-semibold truncate">{s.label}</div>
                <div className="text-[10px] opacity-70">{s.size}</div>
              </div>
            </DiagramTooltip>
          ))}
        </div>
        <p className="text-xs text-[var(--ink-subtle)] text-center">
          Итого: 4GB + 200MB Python overhead на executor
        </p>
      </div>
    </DiagramContainer>
  );
}
