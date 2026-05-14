/** @jsxImportSource solid-js */
import { createSignal } from 'solid-js';
/**
 * BroadcastJoinDiagram (DIAG-06)
 *
 * Side-by-side comparison of Broadcast Join vs Shuffle Join.
 * Shows network I/O difference: 30MB broadcast vs ~100GB shuffle.
 */

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
  const [mode, setMode] = createSignal<JoinMode>('broadcast');

  return (
    <DiagramContainer title="Broadcast Join vs Shuffle Join" color="blue">
      <div class="flex flex-col gap-4">
        {/* Toggle */}
        <div class="flex items-center justify-center gap-3">
          <button
            onClick={() => setMode('broadcast')}
            class={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode() === 'broadcast'
                ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-400/50'
                : 'bg-[var(--bg-surface)] text-[var(--ink-muted)] border border-[var(--line-thin)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            Broadcast Join
          </button>
          <button
            onClick={() => setMode('shuffle')}
            class={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode() === 'shuffle'
                ? 'bg-amber-500/20 text-amber-700 border border-amber-400/50'
                : 'bg-[var(--bg-surface)] text-[var(--ink-muted)] border border-[var(--line-thin)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            Shuffle Join
          </button>
        </div>

        {/* Threshold indicator */}
        <div class="text-center">
          <span class="text-xs px-2 py-1 rounded bg-blue-500/15 text-blue-700 border border-blue-400/30 font-mono">
            spark.sql.autoBroadcastJoinThreshold = 10 MB
          </span>
        </div>

        {/* Tables overview */}
        <div class="flex justify-center gap-6">
          <DiagramTooltip content="Dimension table: справочник городов, валют или категорий. Маленький, часто join-ится с фактами.">
            <div class={`px-4 py-2 rounded-lg border text-center transition-all ${
              mode() === 'broadcast'
                ? 'bg-emerald-500/10 border-emerald-400/40'
                : 'bg-amber-500/10 border-amber-400/40'
            }`}>
              <p class="text-xs text-[var(--ink-muted)]">dimensions</p>
              <p class="text-lg font-semibold text-[var(--ink-strong)]">10 MB</p>
            </div>
          </DiagramTooltip>

          <DiagramTooltip content="Fact table: таблица заказов, событий или транзакций. Большая, распределена по executors.">
            <div class="px-4 py-2 rounded-lg border bg-blue-500/10 border-blue-400/40 text-center">
              <p class="text-xs text-[var(--ink-muted)]">facts</p>
              <p class="text-lg font-semibold text-[var(--ink-strong)]">100 GB</p>
            </div>
          </DiagramTooltip>
        </div>

        {/* Data flow arrow indicator */}
        <div class="text-center text-[var(--ink-subtle)]">
          {mode() === 'broadcast' ? (
            <span class="text-xs">
              <span class="text-emerald-400">dimensions</span> broadcast на все executors
            </span>
          ) : (
            <span class="text-xs">
              <span class="text-amber-400">обе таблицы</span> перераспределяются по join key
            </span>
          )}
        </div>

        {/* Executors grid */}
        <div class="grid grid-cols-2 gap-3">
          {EXECUTORS.map((exec) => (
            <DiagramTooltip

              content={
                mode() === 'broadcast'
                  ? `${exec.label}: facts (${exec.factSize}) остаются на месте, dimensions (${exec.dimSize}) скопированы через broadcast. Join выполняется локально.`
                  : `${exec.label}: данные обеих таблиц перераспределены по hash(join_key). Каждый executor получает ~25 GB facts + часть dimensions через сеть.`
              }
            >
              <div class="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--line-thin)]">
                <p class="text-xs font-semibold text-[var(--ink-default)] mb-2">{exec.label}</p>

                <div class="space-y-1.5">
                  {/* Facts partition */}
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-blue-500/20 rounded h-5 flex items-center px-2">
                      <span class="text-[10px] font-mono text-blue-700">facts: {exec.factSize}</span>
                    </div>
                    {mode() === 'broadcast' ? (
                      <span class="text-[10px] text-[var(--ink-subtle)]">in-place</span>
                    ) : (
                      <span class="text-[10px] text-amber-400">shuffled</span>
                    )}
                  </div>

                  {/* Dims partition */}
                  <div class="flex items-center gap-2">
                    <div class={`rounded h-5 flex items-center px-2 ${
                      mode() === 'broadcast'
                        ? 'bg-emerald-500/20 w-12'
                        : 'bg-amber-500/20 w-8'
                    }`}>
                      <span class="text-[10px] font-mono text-[var(--ink-strong)] whitespace-nowrap">
                        {mode() === 'broadcast' ? '10 MB' : '2.5 MB'}
                      </span>
                    </div>
                    {mode() === 'broadcast' ? (
                      <span class="text-[10px] text-emerald-400">broadcast</span>
                    ) : (
                      <span class="text-[10px] text-amber-400">shuffled</span>
                    )}
                  </div>

                  {/* Local join indicator */}
                  <div class="text-[10px] text-[var(--ink-subtle)] pt-1 border-t border-[var(--line-thin)]">
                    {mode() === 'broadcast' ? 'Hash lookup (local)' : 'SortMergeJoin (after shuffle)'}
                  </div>
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>

        {/* Network I/O comparison */}
        <div class="flex flex-wrap gap-3 justify-center mt-2">
          {mode() === 'broadcast' ? (
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
        <div class="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--line-thin)] text-center">
          {mode() === 'broadcast' ? (
            <p class="text-sm text-emerald-700">
              Broadcast: <strong>30 MB</strong> по сети = мгновенно. Facts остаются на месте.
            </p>
          ) : (
            <p class="text-sm text-amber-700">
              Shuffle: <strong>~100 GB</strong> по сети. На 10 Gbit/s = ~80 секунд только трансфер.
            </p>
          )}
        </div>
      </div>
    </DiagramContainer>
  );
}
