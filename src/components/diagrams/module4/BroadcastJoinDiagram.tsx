/**
 * BroadcastJoinDiagram (DIAG-06)
 *
 * Side-by-side comparison of Broadcast Join vs Shuffle Join.
 * Shows network I/O difference: 30MB broadcast vs ~100GB shuffle.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';

type JoinMode = 'broadcast' | 'shuffle';

interface ExecutorView {
  id: number;
  label: string;
  factSize: string;
  dimSize: string;
}

const EXECUTORS: ExecutorView[] = [
  { id: 0, label: 'Executor 0', factSize: '25 GB', dimSize: '10 MB' },
  { id: 1, label: 'Executor 1', factSize: '25 GB', dimSize: '10 MB' },
  { id: 2, label: 'Executor 2', factSize: '25 GB', dimSize: '10 MB' },
  { id: 3, label: 'Executor 3', factSize: '25 GB', dimSize: '10 MB' },
];

export function BroadcastJoinDiagram() {
  const [mode, setMode] = useState<JoinMode>('broadcast');

  return (
    <DiagramContainer title="Broadcast Join vs Shuffle Join" color="blue">
      <div className="flex flex-col gap-4">
        {/* Toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setMode('broadcast')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'broadcast'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            Broadcast Join
          </button>
          <button
            onClick={() => setMode('shuffle')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'shuffle'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            Shuffle Join
          </button>
        </div>

        {/* Threshold indicator */}
        <div className="text-center">
          <span className="text-xs px-2 py-1 rounded bg-blue-500/15 text-blue-300 border border-blue-400/30 font-mono">
            spark.sql.autoBroadcastJoinThreshold = 10 MB
          </span>
        </div>

        {/* Tables overview */}
        <div className="flex justify-center gap-6">
          <DiagramTooltip content="Dimension table: справочник городов, валют или категорий. Маленький, часто join-ится с фактами.">
            <div className={`px-4 py-2 rounded-lg border text-center transition-all ${
              mode === 'broadcast'
                ? 'bg-emerald-500/10 border-emerald-400/40'
                : 'bg-amber-500/10 border-amber-400/40'
            }`}>
              <p className="text-xs text-gray-400">dimensions</p>
              <p className="text-lg font-semibold text-white">10 MB</p>
            </div>
          </DiagramTooltip>

          <DiagramTooltip content="Fact table: таблица заказов, событий или транзакций. Большая, распределена по executors.">
            <div className="px-4 py-2 rounded-lg border bg-blue-500/10 border-blue-400/40 text-center">
              <p className="text-xs text-gray-400">facts</p>
              <p className="text-lg font-semibold text-white">100 GB</p>
            </div>
          </DiagramTooltip>
        </div>

        {/* Data flow arrow indicator */}
        <div className="text-center text-gray-500">
          {mode === 'broadcast' ? (
            <span className="text-xs">
              <span className="text-emerald-400">dimensions</span> broadcast на все executors
            </span>
          ) : (
            <span className="text-xs">
              <span className="text-amber-400">обе таблицы</span> перераспределяются по join key
            </span>
          )}
        </div>

        {/* Executors grid */}
        <div className="grid grid-cols-2 gap-3">
          {EXECUTORS.map((exec) => (
            <DiagramTooltip
              key={exec.id}
              content={
                mode === 'broadcast'
                  ? `${exec.label}: facts (${exec.factSize}) остаются на месте, dimensions (${exec.dimSize}) скопированы через broadcast. Join выполняется локально.`
                  : `${exec.label}: данные обеих таблиц перераспределены по hash(join_key). Каждый executor получает ~25 GB facts + часть dimensions через сеть.`
              }
            >
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs font-semibold text-gray-300 mb-2">{exec.label}</p>

                <div className="space-y-1.5">
                  {/* Facts partition */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-blue-500/20 rounded h-5 flex items-center px-2">
                      <span className="text-[10px] font-mono text-blue-300">facts: {exec.factSize}</span>
                    </div>
                    {mode === 'broadcast' ? (
                      <span className="text-[10px] text-gray-500">in-place</span>
                    ) : (
                      <span className="text-[10px] text-amber-400">shuffled</span>
                    )}
                  </div>

                  {/* Dims partition */}
                  <div className="flex items-center gap-2">
                    <div className={`rounded h-5 flex items-center px-2 ${
                      mode === 'broadcast'
                        ? 'bg-emerald-500/20 w-12'
                        : 'bg-amber-500/20 w-8'
                    }`}>
                      <span className="text-[10px] font-mono text-white whitespace-nowrap">
                        {mode === 'broadcast' ? '10 MB' : '2.5 MB'}
                      </span>
                    </div>
                    {mode === 'broadcast' ? (
                      <span className="text-[10px] text-emerald-400">broadcast</span>
                    ) : (
                      <span className="text-[10px] text-amber-400">shuffled</span>
                    )}
                  </div>

                  {/* Local join indicator */}
                  <div className="text-[10px] text-gray-500 pt-1 border-t border-white/5">
                    {mode === 'broadcast' ? 'Hash lookup (local)' : 'SortMergeJoin (after shuffle)'}
                  </div>
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>

        {/* Network I/O comparison */}
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {mode === 'broadcast' ? (
            <>
              <DataBox label="Network I/O" value="30 MB" variant="highlight" />
              <DataBox label="Механика" value="10 MB x 3 copies" />
              <DataBox label="Shuffle" value="Нет" variant="highlight" />
              <DataBox label="Physical Plan" value="BroadcastHashJoin" />
            </>
          ) : (
            <>
              <DataBox label="Network I/O" value="~100 GB" variant="highlight" />
              <DataBox label="Механика" value="Full redistribution" />
              <DataBox label="Shuffle" value="Обе таблицы" variant="highlight" />
              <DataBox label="Physical Plan" value="SortMergeJoin" />
            </>
          )}
        </div>

        {/* Speed comparison */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
          {mode === 'broadcast' ? (
            <p className="text-sm text-emerald-300">
              Broadcast: <strong>30 MB</strong> по сети = мгновенно. Facts остаются на месте.
            </p>
          ) : (
            <p className="text-sm text-amber-300">
              Shuffle: <strong>~100 GB</strong> по сети. На 10 Gbit/s = ~80 секунд только трансфер.
            </p>
          )}
        </div>
      </div>
    </DiagramContainer>
  );
}
