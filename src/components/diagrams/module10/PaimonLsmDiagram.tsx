/**
 * PaimonLsmDiagram
 *
 * LSM-tree architecture: Write buffer → Level 0 → Level 1 → Level 2+,
 * with annotations on write/read/compaction characteristics.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';

const levels = [
  {
    label: 'Write buffer (MemTable)',
    detail: '← Записи в памяти',
    color: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-700',
  },
  {
    label: 'Level 0 (unsorted SST files)',
    detail: '← Flush из memory',
    color: 'bg-blue-500/15 border-blue-400/30 text-blue-700',
  },
  {
    label: 'Level 1 (sorted, merged SST files)',
    detail: '← Compaction L0 → L1',
    color: 'bg-amber-500/15 border-amber-400/30 text-amber-700',
  },
  {
    label: 'Level 2+ (sorted, larger files)',
    detail: '← Compaction L1 → L2',
    color: 'bg-purple-500/15 border-purple-400/30 text-purple-700',
  },
];

const traits = [
  { label: 'Запись', value: 'O(1) — всегда sequential append' },
  { label: 'Чтение', value: 'O(N levels) — merge из нескольких уровней' },
  { label: 'Compaction', value: 'Фоновый процесс для уменьшения read amplification' },
];

export function PaimonLsmDiagram() {
  return (
    <DiagramContainer
      title="Paimon LSM-tree архитектура"
      description="Write-optimized хранение через Log-Structured Merge-tree"
      color="emerald"
    >
      <div className="flex flex-col gap-1 w-full">
        {levels.map((lvl, i) => (
          <div
            key={i}
            className={`rounded-lg border p-2.5 flex items-center justify-between gap-3 ${lvl.color}`}
          >
            <span className="text-sm font-medium">{lvl.label}</span>
            <span className="text-xs opacity-70 shrink-0">{lvl.detail}</span>
          </div>
        ))}

        <div className="mt-3 pt-3 border-t border-[var(--line-thin)]">
          {traits.map((t, i) => (
            <div key={i} className="flex gap-2 text-xs text-[var(--ink-default)] py-0.5">
              <span className="font-semibold text-[var(--ink-default)] shrink-0 w-24">{t.label}:</span>
              <span className="opacity-80">{t.value}</span>
            </div>
          ))}
        </div>
      </div>
    </DiagramContainer>
  );
}
