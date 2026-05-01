/**
 * VacuumDiagram
 *
 * Shows which files VACUUM deletes (files older than retention) vs keeps
 * (current version files, recent files, metadata).
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowColumn } from '@primitives/FlowColumn';

interface FileEntry {
  name: string;
  size: string;
  status: 'current' | 'recent' | 'old' | 'metadata';
  age?: string;
}

const files: FileEntry[] = [
  { name: 'part-00000.parquet', size: '98MB', status: 'current' },
  { name: 'part-00001.parquet', size: '102MB', status: 'current' },
  { name: '_delta_log/', size: '', status: 'metadata' },
  { name: 'old-part-00000.parquet', size: '800KB', status: 'old', age: '7+ дней' },
  { name: 'old-part-00001.parquet', size: '1.2MB', status: 'old', age: '7+ дней' },
  { name: 'old-part-00002.parquet', size: '500KB', status: 'recent', age: '3 дня' },
  { name: 'old-part-00003.parquet', size: '900KB', status: 'old', age: '7+ дней' },
];

const statusStyles = {
  current: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    text: 'text-emerald-700',
    badge: 'Сохранён (текущий)',
    badgeColor: 'bg-emerald-500/20 text-emerald-700',
  },
  recent: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
    text: 'text-blue-700',
    badge: 'Сохранён (< 7 дней)',
    badgeColor: 'bg-blue-500/20 text-blue-700',
  },
  old: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    text: 'text-red-700',
    badge: 'Удалён',
    badgeColor: 'bg-red-500/20 text-red-700',
  },
  metadata: {
    bg: 'bg-[var(--bg-deep)]',
    border: 'border-[var(--line-medium)]',
    text: 'text-[var(--ink-default)]',
    badge: 'Сохранён (metadata)',
    badgeColor: 'bg-[var(--bg-deep)] text-[var(--ink-default)]',
  },
};

export function VacuumDiagram() {
  return (
    <DiagramContainer title="VACUUM RETAIN 168 HOURS (7 дней)" color="rose">
      <FlowColumn gap={2} align="start" className="w-full">
        {files.map((f, i) => {
          const st = statusStyles[f.status];
          return (
            <div
              key={i}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-xs font-mono
                ${st.bg} ${st.border} ${st.text}
              `}
            >
              <span className="text-[var(--ink-subtle)]">
                {i < files.length - 1 ? '├──' : '└──'}
              </span>
              <span className="flex-1">{f.name}</span>
              {f.size && <span className="text-[var(--ink-subtle)]">{f.size}</span>}
              {f.age && <span className="text-[var(--ink-subtle)]">({f.age})</span>}
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${st.badgeColor}`}>
                {st.badge}
              </span>
            </div>
          );
        })}
      </FlowColumn>
      <p className="text-xs text-[var(--ink-subtle)] mt-3 text-center">
        3 файла удалены — старше 7 дней retention period
      </p>
    </DiagramContainer>
  );
}
