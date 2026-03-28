/**
 * CompactionBeforeAfterDiagram
 *
 * Shows file layout before OPTIMIZE (10,000 small files) and after
 * (100 large files). Clickable toggle for before/after.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowColumn } from '@primitives/FlowColumn';

interface FileSet {
  label: string;
  files: { name: string; size: string }[];
  summary: string;
}

const beforeState: FileSet = {
  label: 'До OPTIMIZE (10,000 файлов по ~1MB)',
  files: [
    { name: 'part-00000.parquet', size: '800KB' },
    { name: 'part-00001.parquet', size: '1.2MB' },
    { name: 'part-00002.parquet', size: '500KB' },
    { name: '... (9,997 файлов)', size: '' },
    { name: 'part-09999.parquet', size: '900KB' },
  ],
  summary: '10,000 файлов × ~1MB = ~10GB',
};

const afterState: FileSet = {
  label: 'После OPTIMIZE (100 файлов по ~100MB)',
  files: [
    { name: 'part-00000.parquet', size: '98MB' },
    { name: 'part-00001.parquet', size: '102MB' },
    { name: '... (98 файлов)', size: '' },
    { name: 'part-00099.parquet', size: '95MB' },
  ],
  summary: '100 файлов × ~100MB = ~10GB (данные те же!)',
};

export function CompactionBeforeAfterDiagram() {
  const [showAfter, setShowAfter] = useState(false);
  const state = showAfter ? afterState : beforeState;
  const color = showAfter ? 'emerald' : 'rose';

  return (
    <DiagramContainer
      title="OPTIMIZE: Compaction"
      color={showAfter ? 'emerald' : 'amber'}
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
            До OPTIMIZE
          </button>
          <button
            onClick={() => setShowAfter(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showAfter
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                : 'bg-gray-500/10 border border-gray-500/20 text-gray-400 hover:bg-gray-500/15'
            }`}
          >
            После OPTIMIZE
          </button>
        </div>

        {/* File list */}
        <div className={`border border-${color}-400/20 rounded-xl overflow-hidden transition-all`}>
          <div className={`px-4 py-2 bg-${color}-500/15 text-sm font-semibold text-${color}-200`}>
            {state.label}
          </div>
          <div className="p-3 space-y-1">
            {state.files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <span className="text-gray-500">
                  {i < state.files.length - 1 ? '├──' : '└──'}
                </span>
                <span className={`text-${color}-300/80`}>{f.name}</span>
                {f.size && (
                  <span className="text-gray-500 ml-auto">({f.size})</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 font-mono">
          {state.summary}
        </div>
      </div>
    </DiagramContainer>
  );
}
