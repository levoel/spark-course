/**
 * PartitionSkewDiagram (DIAG-05)
 *
 * Interactive visualization of partition data skew with AQE toggle.
 * Shows Moscow-skewed partitions rebalanced by AQE split operation.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';

interface PartitionData {
  city: string;
  rows: number;
  timeMs: number;
}

const PARTITIONS_SKEWED: PartitionData[] = [
  { city: 'Москва', rows: 800000, timeMs: 42000 },
  { city: 'Санкт-Петербург', rows: 80000, timeMs: 4200 },
  { city: 'Казань', rows: 60000, timeMs: 3100 },
  { city: 'Новосибирск', rows: 60000, timeMs: 3100 },
];

interface AQEPartition {
  label: string;
  rows: number;
  timeMs: number;
}

const PARTITIONS_AQE: AQEPartition[] = [
  { label: 'Москва (1/4)', rows: 200000, timeMs: 10500 },
  { label: 'Москва (2/4)', rows: 200000, timeMs: 10500 },
  { label: 'Москва (3/4)', rows: 200000, timeMs: 10500 },
  { label: 'Москва (4/4)', rows: 200000, timeMs: 10500 },
  { label: 'СПб', rows: 80000, timeMs: 4200 },
  { label: 'Казань', rows: 60000, timeMs: 3100 },
  { label: 'Новосибирск', rows: 60000, timeMs: 3100 },
];

function formatRows(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

function formatTime(ms: number): string {
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)} мин`;
  return `${(ms / 1000).toFixed(1)} сек`;
}

export function PartitionSkewDiagram() {
  const [aqeEnabled, setAqeEnabled] = useState(false);

  const maxRows = 800000;

  return (
    <DiagramContainer title="Partition Skew: До и после AQE" color="amber">
      <div className="flex flex-col gap-4">
        {/* Toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setAqeEnabled(false)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !aqeEnabled
                ? 'bg-amber-500/20 text-amber-700 border border-amber-400/50'
                : 'bg-[var(--bg-surface)] text-[var(--ink-muted)] border border-[var(--line-thin)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            AQE OFF
          </button>
          <button
            onClick={() => setAqeEnabled(true)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              aqeEnabled
                ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-400/50'
                : 'bg-[var(--bg-surface)] text-[var(--ink-muted)] border border-[var(--line-thin)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            AQE ON
          </button>
        </div>

        {/* Partition bars */}
        <div className="space-y-2">
          {!aqeEnabled ? (
            /* Skewed state */
            PARTITIONS_SKEWED.map((p) => {
              const widthPercent = Math.max((p.rows / maxRows) * 100, 4);
              const isSkewed = p.rows > 200000;
              return (
                <DiagramTooltip
                  key={p.city}
                  content={`${p.city}: ${formatRows(p.rows)} строк, ~${formatTime(p.timeMs)} обработки`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-28 text-xs text-right text-[var(--ink-muted)] shrink-0 truncate">
                      {p.city}
                    </span>
                    <div className="flex-1 bg-[var(--bg-sunken)] rounded-full overflow-hidden h-7">
                      <div
                        className={`h-full rounded-full flex items-center px-2 transition-all duration-500 ${
                          isSkewed
                            ? 'bg-amber-500/60 border border-amber-400/40'
                            : 'bg-[var(--bg-sunken)] border border-[var(--line-medium)]'
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      >
                        <span className="text-xs font-mono text-[var(--ink-strong)] whitespace-nowrap">
                          {formatRows(p.rows)}
                        </span>
                      </div>
                    </div>
                  </div>
                </DiagramTooltip>
              );
            })
          ) : (
            /* AQE balanced state */
            PARTITIONS_AQE.map((p, i) => {
              const widthPercent = Math.max((p.rows / maxRows) * 100, 4);
              const isMoscowSplit = p.label.includes('Москва');
              return (
                <DiagramTooltip
                  key={`${p.label}-${i}`}
                  content={`${p.label}: ${formatRows(p.rows)} строк, ~${formatTime(p.timeMs)} обработки`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-28 text-xs text-right text-[var(--ink-muted)] shrink-0 truncate">
                      {p.label}
                    </span>
                    <div className="flex-1 bg-[var(--bg-sunken)] rounded-full overflow-hidden h-7">
                      <div
                        className={`h-full rounded-full flex items-center px-2 transition-all duration-500 ${
                          isMoscowSplit
                            ? 'bg-emerald-500/50 border border-emerald-400/40'
                            : 'bg-[var(--bg-sunken)] border border-[var(--line-medium)]'
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      >
                        <span className="text-xs font-mono text-[var(--ink-strong)] whitespace-nowrap">
                          {formatRows(p.rows)}
                        </span>
                      </div>
                    </div>
                  </div>
                </DiagramTooltip>
              );
            })
          )}
        </div>

        {/* Summary metrics */}
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {!aqeEnabled ? (
            <>
              <DataBox label="Макс. партиция" value="800K строк" variant="highlight" />
              <DataBox label="Макс. время задачи" value="42 сек" />
              <DataBox label="Skew factor" value="10x" variant="highlight" />
            </>
          ) : (
            <>
              <DataBox label="Макс. партиция" value="200K строк" />
              <DataBox label="Макс. время задачи" value="10.5 сек" />
              <DataBox label="Split операция" value="4 sub-partitions" variant="highlight" />
            </>
          )}
        </div>

        {/* Legend */}
        <div className="text-xs text-[var(--ink-muted)] text-center mt-1">
          {!aqeEnabled ? (
            <span>
              <span className="inline-block w-3 h-3 rounded-full bg-amber-500/60 mr-1 align-middle" />
              Skewed партиция -- обрабатывается в 10x дольше остальных
            </span>
          ) : (
            <span>
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-500/50 mr-1 align-middle" />
              AQE split -- Москва разбита на 4 равные sub-partitions
            </span>
          )}
        </div>
      </div>
    </DiagramContainer>
  );
}
