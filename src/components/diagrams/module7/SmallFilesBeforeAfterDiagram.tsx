/**
 * SmallFilesBeforeAfterDiagram
 *
 * Streaming-table file explosion: 150,000 small files over 30 days
 * vs 90 compacted files after OPTIMIZE. Toggleable before/after.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';

interface State {
  label: string;
  partitionExample: string;
  filesPerPartition: string;
  totalFiles: string;
  totalSize: string;
  queryTime: string;
}

const before: State = {
  label: 'BEFORE (streaming job, 30 дней)',
  partitionExample: 'event_date=2024-01-XX/',
  filesPerPartition: '5,000 файлов по 50KB = 250MB',
  totalFiles: '150,000 файлов',
  totalSize: '7.5GB',
  queryTime: '~45 секунд (overhead 95%)',
};

const after: State = {
  label: 'AFTER (compaction)',
  partitionExample: 'event_date=2024-01-XX/',
  filesPerPartition: '3 файла по ~85MB = 250MB',
  totalFiles: '90 файлов',
  totalSize: '7.5GB (данные те же!)',
  queryTime: '~3 секунды (15x быстрее)',
};

export function SmallFilesBeforeAfterDiagram() {
  const [showAfter, setShowAfter] = useState(false);
  const state = showAfter ? after : before;
  const color = showAfter ? 'emerald' : 'rose';

  return (
    <DiagramContainer
      title="Small Files: Before / After Compaction"
      color={showAfter ? 'emerald' : 'rose'}
    >
      <div className="flex flex-col gap-4">
        {/* Toggle */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setShowAfter(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !showAfter
                ? 'bg-rose-500/20 border border-rose-400/40 text-rose-200'
                : 'bg-gray-500/10 border border-gray-500/20 text-gray-400 hover:bg-gray-500/15'
            }`}
          >
            Before
          </button>
          <button
            onClick={() => setShowAfter(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showAfter
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                : 'bg-gray-500/10 border border-gray-500/20 text-gray-400 hover:bg-gray-500/15'
            }`}
          >
            After
          </button>
        </div>

        <div className={`border border-${color}-400/20 rounded-xl overflow-hidden`}>
          <div className={`px-4 py-2 bg-${color}-500/15 text-sm font-semibold text-${color}-200`}>
            {state.label}
          </div>
          <div className="p-3 space-y-1 text-xs font-mono">
            <div className={`text-${color}-300/70`}>/data/events/</div>
            {['01', '02', '...', '30'].map((day, i) => (
              <div key={i} className={`ml-4 flex items-center gap-2 text-${color}-300/60`}>
                <span className="text-gray-500">{day === '30' ? '└──' : '├──'}</span>
                <span>
                  event_date=2024-01-{day === '...' ? '...' : day}/
                </span>
                {day !== '...' && (
                  <span className="text-gray-500">({state.filesPerPartition})</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-500/10 rounded-lg p-2">
            <div className="text-[10px] text-gray-500 uppercase">Файлов</div>
            <div className={`text-sm font-mono font-semibold text-${color}-300`}>{state.totalFiles}</div>
          </div>
          <div className="bg-gray-500/10 rounded-lg p-2">
            <div className="text-[10px] text-gray-500 uppercase">Размер</div>
            <div className="text-sm font-mono font-semibold text-gray-300">{state.totalSize}</div>
          </div>
          <div className="bg-gray-500/10 rounded-lg p-2">
            <div className="text-[10px] text-gray-500 uppercase">Запрос 1 день</div>
            <div className={`text-sm font-mono font-semibold text-${color}-300`}>{state.queryTime}</div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
