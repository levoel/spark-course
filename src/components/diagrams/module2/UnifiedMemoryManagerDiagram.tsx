/**
 * UnifiedMemoryManagerDiagram
 *
 * Tree visualization of Spark's Unified Memory Manager breakdown:
 * JVM Heap → Reserved / User / Spark Memory (Storage + Execution).
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { FlowColumn } from '@primitives/FlowColumn';

interface TreeEntry {
  label: string;
  indent: number;
  color: string;
  tooltip: string;
  connector: string;
}

const tree: TreeEntry[] = [
  {
    label: 'Executor JVM Heap (spark.executor.memory, например 4g)',
    indent: 0,
    color: 'text-white',
    tooltip: 'Общий размер JVM heap, задаётся spark.executor.memory.',
    connector: '',
  },
  {
    label: 'Reserved Memory: 300 MB (hardcoded Spark)',
    indent: 1,
    color: 'text-gray-400',
    tooltip: 'Фиксированный резерв 300MB для внутренних нужд Spark. Не настраивается.',
    connector: '├──',
  },
  {
    label: 'User Memory: (1 - spark.memory.fraction) × (heap - 300MB)',
    indent: 1,
    color: 'text-purple-300',
    tooltip: 'Память для пользовательских структур данных, UDF-объектов и RDD metadata.',
    connector: '├──',
  },
  {
    label: 'UDF-объекты, RDD metadata, внутренние структуры',
    indent: 2,
    color: 'text-purple-400/70',
    tooltip: 'Всё, что создаёт ваш код: массивы, словари, объекты UDF.',
    connector: '└──',
  },
  {
    label: 'Spark Memory: spark.memory.fraction × (heap - 300MB)',
    indent: 1,
    color: 'text-blue-300',
    tooltip: 'Unified memory pool для Storage и Execution с мягкой границей.',
    connector: '└──',
  },
  {
    label: 'Storage Memory: storageFraction × sparkMemory',
    indent: 2,
    color: 'text-blue-400/80',
    tooltip: 'Для кэшированных RDD и broadcast-переменных. Может быть вытеснена Execution при давлении.',
    connector: '├──',
  },
  {
    label: 'Кэшированные RDD, broadcast-переменные',
    indent: 3,
    color: 'text-blue-400/60',
    tooltip: 'Данные, сохранённые через .cache() / .persist() и broadcast variables.',
    connector: '└──',
  },
  {
    label: 'Execution Memory: (1 - storageFraction) × sparkMemory',
    indent: 2,
    color: 'text-emerald-400/80',
    tooltip: 'Для shuffle, join, sort и aggregation buffers. Имеет приоритет над Storage.',
    connector: '└──',
  },
  {
    label: 'Shuffle buffers, join buffers, sort buffers',
    indent: 3,
    color: 'text-emerald-400/60',
    tooltip: 'При нехватке — spill to disk. Execution memory не может быть вытеснена Storage.',
    connector: '└──',
  },
];

export function UnifiedMemoryManagerDiagram() {
  return (
    <DiagramContainer title="Unified Memory Manager" color="blue">
      <FlowColumn gap={1} align="start" className="w-full">
        {tree.map((entry, i) => (
          <DiagramTooltip key={i} content={entry.tooltip}>
            <div
              className={`flex items-center gap-1 text-xs font-mono cursor-help ${entry.color}`}
              style={{ paddingLeft: `${entry.indent * 20}px` }}
            >
              {entry.connector && (
                <span className="text-gray-600 w-8 shrink-0">{entry.connector}</span>
              )}
              <span>{entry.label}</span>
            </div>
          </DiagramTooltip>
        ))}
      </FlowColumn>
    </DiagramContainer>
  );
}
