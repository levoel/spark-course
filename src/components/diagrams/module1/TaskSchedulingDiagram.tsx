/**
 * TaskSchedulingDiagram (DIAG-11)
 *
 * Two-panel comparison of FIFO vs FAIR schedulers with data locality levels.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { FlowNode } from '@primitives/FlowNode';
import { DataBox } from '@primitives/DataBox';
import { Grid } from '@primitives/Grid';

type SchedulerMode = 'fifo' | 'fair';

const localityLevels = [
  {
    level: 'PROCESS_LOCAL',
    color: 'bg-emerald-500/30 border-emerald-400/50 text-emerald-700',
    description: 'Данные в том же executor JVM (кэшированный RDD). Максимальная скорость -- чтение из памяти процесса.',
    speed: 'Fastest',
  },
  {
    level: 'NODE_LOCAL',
    color: 'bg-blue-500/30 border-blue-400/50 text-blue-700',
    description: 'Данные на том же узле (локальный диск, HDFS DataNode). Быстрый доступ через local I/O.',
    speed: 'Fast',
  },
  {
    level: 'NO_PREF',
    color: 'bg-[var(--bg-deep)] border-[var(--line-medium)] text-[var(--ink-default)]',
    description: 'Нет предпочтения по расположению данных. Например, чтение из удалённой БД или S3.',
    speed: 'Medium',
  },
  {
    level: 'RACK_LOCAL',
    color: 'bg-amber-500/30 border-amber-400/50 text-amber-700',
    description: 'Данные в той же стойке (rack). Сетевой трафик не покидает rack -- меньше latency, чем ANY.',
    speed: 'Slow',
  },
  {
    level: 'ANY',
    color: 'bg-rose-500/30 border-rose-400/50 text-rose-700',
    description: 'Данные на любом узле кластера. Полный network transfer. Последний fallback после spark.locality.wait.',
    speed: 'Slowest',
  },
];

export function TaskSchedulingDiagram() {
  const [mode, setMode] = useState<SchedulerMode>('fifo');

  return (
    <DiagramContainer title="Task Scheduling: FIFO vs FAIR" color="purple">
      <div className="flex flex-col gap-6">
        {/* Mode toggle */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setMode('fifo')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'fifo'
                ? 'bg-purple-500/30 border border-purple-400/50 text-purple-700'
                : 'bg-[var(--bg-surface)] border border-[var(--line-thin)] text-[var(--ink-muted)] hover:text-[var(--ink-default)]'
            }`}
          >
            FIFO
          </button>
          <button
            onClick={() => setMode('fair')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'fair'
                ? 'bg-purple-500/30 border border-purple-400/50 text-purple-700'
                : 'bg-[var(--bg-surface)] border border-[var(--line-thin)] text-[var(--ink-muted)] hover:text-[var(--ink-default)]'
            }`}
          >
            FAIR
          </button>
        </div>

        {/* Scheduler comparison */}
        <Grid columns={2}>
          {/* FIFO Panel */}
          <div className={`p-4 rounded-lg border transition-opacity ${
            mode === 'fifo' ? 'bg-[var(--bg-surface)] border-purple-400/30 opacity-100' : 'bg-[var(--bg-surface)] border-[var(--line-thin)] opacity-50'
          }`}>
            <h4 className="text-sm font-semibold text-[var(--ink-strong)] mb-3">FIFO Scheduler</h4>
            <div className="flex flex-col gap-2">
              <DiagramTooltip content="Job 1 получает ВСЕ ресурсы кластера. Jobs 2 и 3 ждут полного завершения Job 1.">
                <FlowNode variant="connector" tabIndex={0} size="sm">
                  Job 1 <span className="text-xs opacity-75">(running -- all cores)</span>
                </FlowNode>
              </DiagramTooltip>
              <DiagramTooltip content="Job 2 стоит в очереди. Даже если это маленький запрос, он ждёт завершения Job 1.">
                <FlowNode variant="queue" tabIndex={0} size="sm">
                  Job 2 <span className="text-xs opacity-75">(waiting)</span>
                </FlowNode>
              </DiagramTooltip>
              <DiagramTooltip content="Job 3 стоит в очереди за Job 2. Строго последовательное выполнение.">
                <FlowNode variant="queue" tabIndex={0} size="sm">
                  Job 3 <span className="text-xs opacity-75">(waiting)</span>
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>

          {/* FAIR Panel */}
          <div className={`p-4 rounded-lg border transition-opacity ${
            mode === 'fair' ? 'bg-[var(--bg-surface)] border-purple-400/30 opacity-100' : 'bg-[var(--bg-surface)] border-[var(--line-thin)] opacity-50'
          }`}>
            <h4 className="text-sm font-semibold text-[var(--ink-strong)] mb-3">FAIR Scheduler</h4>
            <div className="flex flex-col gap-2">
              <DiagramTooltip content="Pool 'production' (weight=2): Job 1 получает 2/3 ресурсов. Высокий приоритет для production workloads.">
                <FlowNode variant="connector" tabIndex={0} size="sm">
                  <span className="text-xs">Pool: production (w=2)</span>
                  <br />
                  Job 1 <span className="text-xs opacity-75">(67% cores)</span>
                </FlowNode>
              </DiagramTooltip>
              <DiagramTooltip content="Pool 'analytics' (weight=1): Jobs 2 и 3 делят 1/3 ресурсов. Аналитические запросы выполняются сразу, не ждут batch jobs.">
                <FlowNode variant="service" tabIndex={0} size="sm">
                  <span className="text-xs">Pool: analytics (w=1)</span>
                  <br />
                  Job 2, Job 3 <span className="text-xs opacity-75">(33% cores)</span>
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </Grid>

        {/* Data Locality section */}
        <div className="mt-2">
          <h4 className="text-sm font-semibold text-[var(--ink-strong)] mb-3">Data Locality Levels</h4>
          <div className="flex flex-col gap-2">
            {localityLevels.map((level) => (
              <DiagramTooltip key={level.level} content={level.description}>
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-default ${level.color}`}
                  tabIndex={0}
                >
                  <span className="text-xs font-mono font-semibold">{level.level}</span>
                  <span className="text-xs opacity-75">{level.speed}</span>
                </div>
              </DiagramTooltip>
            ))}
          </div>

          <div className="mt-3">
            <DataBox label="spark.locality.wait" value="3s (default)" />
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
