/**
 * SparkUISimulationDiagram (DIAG-08)
 *
 * Tab-based Spark UI simulation showing Jobs, Stages, and SQL tabs
 * with highlighted "red flags" for common performance issues.
 */

import { Fragment, useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';

type TabId = 'jobs' | 'stages' | 'sql';

interface Job {
  id: number;
  description: string;
  duration: string;
  stages: string;
  status: 'completed' | 'running' | 'failed';
  redFlag?: string;
}

interface Stage {
  id: number;
  name: string;
  duration: string;
  shuffleRead: string;
  shuffleWrite: string;
  gcTime: string;
  gcPercent: number;
  taskSkew: boolean;
  redFlag?: string;
}

interface SQLNode {
  id: number;
  operator: string;
  rows: string;
  bytes: string;
  indent: number;
  redFlag?: string;
}

const jobs: Job[] = [
  {
    id: 0,
    description: 'count at analytics.py:42',
    duration: '2.1 s',
    stages: '2/2',
    status: 'completed',
  },
  {
    id: 1,
    description: 'save at etl_pipeline.py:128',
    duration: '45.3 s',
    stages: '5/5',
    status: 'completed',
    redFlag: 'Job 1 занимает 45 секунд — в 20 раз дольше Job 0. Проверьте stages этого job: вероятно data skew или excessive shuffle.',
  },
  {
    id: 2,
    description: 'collect at debug.py:15',
    duration: '—',
    stages: '0/3',
    status: 'failed',
    redFlag: 'Job FAILED — вероятно OutOfMemoryError при collect() на большом DataFrame. Никогда не вызывайте collect() без limit() на production данных.',
  },
];

const stages: Stage[] = [
  {
    id: 0,
    name: 'Scan parquet [orders]',
    duration: '1.2 s',
    shuffleRead: '—',
    shuffleWrite: '890 MB',
    gcTime: '45 ms',
    gcPercent: 3.7,
    taskSkew: false,
  },
  {
    id: 1,
    name: 'Scan parquet [customers]',
    duration: '0.8 s',
    shuffleRead: '—',
    shuffleWrite: '120 MB',
    gcTime: '12 ms',
    gcPercent: 1.5,
    taskSkew: false,
  },
  {
    id: 2,
    name: 'SortMergeJoin + Filter',
    duration: '8.5 s',
    shuffleRead: '1010 MB',
    shuffleWrite: '2.3 GB',
    gcTime: '1.8 s',
    gcPercent: 21,
    taskSkew: true,
    redFlag: 'GC Time 21% — executor тратит 1/5 времени на сборку мусора. Увеличьте spark.executor.memory или уменьшите размер партиций через repartition().',
  },
  {
    id: 3,
    name: 'Aggregate groupBy(city)',
    duration: '32.1 s',
    shuffleRead: '2.3 GB',
    shuffleWrite: '450 MB',
    gcTime: '3.2 s',
    gcPercent: 10,
    taskSkew: true,
    redFlag: 'Task duration skew: Max=32s, Median=0.4s. Одна партиция (Moscow) содержит 80% данных. Используйте salting или AQE skew join.',
  },
  {
    id: 4,
    name: 'Write parquet output',
    duration: '2.8 s',
    shuffleRead: '450 MB',
    shuffleWrite: '—',
    gcTime: '90 ms',
    gcPercent: 3.2,
    taskSkew: false,
  },
];

const sqlNodes: SQLNode[] = [
  {
    id: 0,
    operator: 'WriteToDataSource',
    rows: '1.2M',
    bytes: '450 MB',
    indent: 0,
  },
  {
    id: 1,
    operator: 'Project [city, total_amount, order_count]',
    rows: '1.2M',
    bytes: '450 MB',
    indent: 1,
  },
  {
    id: 2,
    operator: 'HashAggregate groupBy(city)',
    rows: '1.2M',
    bytes: '450 MB',
    indent: 2,
  },
  {
    id: 3,
    operator: 'Exchange hashpartitioning(city, 200)',
    rows: '15M',
    bytes: '2.3 GB',
    indent: 3,
    redFlag: 'Shuffle 2.3 GB — exchange перемещает 2.3 GB данных по сети. Если city имеет low cardinality, рассмотрите partial aggregation перед shuffle.',
  },
  {
    id: 4,
    operator: 'SortMergeJoin [customer_id = id]',
    rows: '15M',
    bytes: '3.1 GB',
    indent: 4,
  },
  {
    id: 5,
    operator: 'Exchange hashpartitioning(customer_id, 200)',
    rows: '50M',
    bytes: '890 MB',
    indent: 5,
  },
  {
    id: 6,
    operator: 'Filter (amount > 100)',
    rows: '50M → 15M',
    bytes: '890 MB',
    indent: 6,
  },
  {
    id: 7,
    operator: 'Scan parquet [orders]',
    rows: '200M',
    bytes: '12 GB',
    indent: 7,
    redFlag: 'Полное сканирование 200M строк (12 GB). Нет partition pruning — добавьте фильтр по partition key (дата) или используйте partitionBy при записи данных.',
  },
  {
    id: 8,
    operator: 'Exchange hashpartitioning(id, 200)',
    rows: '5M',
    bytes: '120 MB',
    indent: 5,
  },
  {
    id: 9,
    operator: 'Scan parquet [customers]',
    rows: '5M',
    bytes: '120 MB',
    indent: 6,
    redFlag: 'Таблица customers (120 MB) достаточно мала для broadcast join. Установите spark.sql.autoBroadcastJoinThreshold >= 120m для устранения shuffle.',
  },
];

const tabConfig: Record<TabId, { label: string; shortLabel: string }> = {
  jobs: { label: 'Jobs', shortLabel: 'Jobs' },
  stages: { label: 'Stages', shortLabel: 'Stages' },
  sql: { label: 'SQL', shortLabel: 'SQL' },
};

function StatusBadge({ status }: { status: Job['status'] }) {
  const colors = {
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${colors[status]}`}>
      {status === 'completed' ? 'SUCCEEDED' : status === 'running' ? 'RUNNING' : 'FAILED'}
    </span>
  );
}

function RedFlagIcon() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-400 text-xs font-bold flex-shrink-0">
      !
    </span>
  );
}

function JobsTab() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-3 gap-y-2 text-xs">
        <span className="text-[var(--ink-subtle)] font-semibold">ID</span>
        <span className="text-[var(--ink-subtle)] font-semibold">Description</span>
        <span className="text-[var(--ink-subtle)] font-semibold">Duration</span>
        <span className="text-[var(--ink-subtle)] font-semibold">Stages</span>
        <span className="text-[var(--ink-subtle)] font-semibold">Status</span>

        {jobs.map((job) => (
          <Fragment key={job.id}>
            <span className="text-[var(--ink-default)] font-mono">{job.id}</span>
            <span className="text-[var(--ink-default)] font-mono truncate">
              {job.redFlag ? (
                <DiagramTooltip content={job.redFlag}>
                  <span className="flex items-center gap-1.5 cursor-help">
                    <RedFlagIcon />
                    {job.description}
                  </span>
                </DiagramTooltip>
              ) : (
                job.description
              )}
            </span>
            <span className="text-[var(--ink-default)] font-mono text-right">{job.duration}</span>
            <span className="text-[var(--ink-default)] font-mono text-center">{job.stages}</span>
            <span><StatusBadge status={job.status} /></span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function StagesTab() {
  return (
    <div className="space-y-2 overflow-x-auto">
      <div className="min-w-[500px]">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-x-3 gap-y-2 text-xs">
          <span className="text-[var(--ink-subtle)] font-semibold">ID</span>
          <span className="text-[var(--ink-subtle)] font-semibold">Stage</span>
          <span className="text-[var(--ink-subtle)] font-semibold">Duration</span>
          <span className="text-[var(--ink-subtle)] font-semibold">Shuffle R/W</span>
          <span className="text-[var(--ink-subtle)] font-semibold">GC Time</span>
          <span className="text-[var(--ink-subtle)] font-semibold">Flags</span>

          {stages.map((stage) => {
            const gcDanger = stage.gcPercent > 10;
            const gcWarning = stage.gcPercent > 5 && stage.gcPercent <= 10;

            return (
              <Fragment key={stage.id}>
                <span className="text-[var(--ink-default)] font-mono">{stage.id}</span>
                <span className="text-[var(--ink-default)] font-mono truncate">{stage.name}</span>
                <span className="text-[var(--ink-default)] font-mono text-right">{stage.duration}</span>
                <span className="text-[var(--ink-muted)] font-mono text-right text-[11px]">
                  {stage.shuffleRead} / {stage.shuffleWrite}
                </span>
                <span
                  className={`font-mono text-right ${
                    gcDanger
                      ? 'text-red-400 font-bold'
                      : gcWarning
                        ? 'text-amber-400'
                        : 'text-[var(--ink-muted)]'
                  }`}
                >
                  {stage.gcTime} ({stage.gcPercent}%)
                </span>
                <span>
                  {stage.redFlag ? (
                    <DiagramTooltip content={stage.redFlag}>
                      <span className="cursor-help"><RedFlagIcon /></span>
                    </DiagramTooltip>
                  ) : (
                    <span className="text-emerald-500 text-xs">OK</span>
                  )}
                </span>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SQLTab() {
  return (
    <div className="space-y-1 font-mono text-xs overflow-x-auto">
      <div className="min-w-[400px]">
        {sqlNodes.map((node) => (
          <div
            key={node.id}
            className="flex items-start gap-2 py-0.5"
            style={{ paddingLeft: `${node.indent * 16}px` }}
          >
            <span className="text-[var(--ink-subtle)] select-none">{node.indent > 0 ? '+- ' : ''}</span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {node.redFlag ? (
                <DiagramTooltip content={node.redFlag}>
                  <span className="flex items-center gap-1.5 cursor-help text-[var(--ink-default)]">
                    <RedFlagIcon />
                    <span className="truncate">{node.operator}</span>
                  </span>
                </DiagramTooltip>
              ) : (
                <span className="text-[var(--ink-default)] truncate">{node.operator}</span>
              )}
            </div>
            <span className="text-[var(--ink-subtle)] whitespace-nowrap ml-2">
              {node.rows} | {node.bytes}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SparkUISimulationDiagram() {
  const [activeTab, setActiveTab] = useState<TabId>('jobs');

  return (
    <DiagramContainer title="Spark UI: Что искать" color="blue">
      <div className="flex flex-col gap-4">
        {/* Tab bar */}
        <div className="flex gap-1 border-b border-[var(--line-thin)] pb-0">
          {(Object.keys(tabConfig) as TabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-[var(--bg-surface)] text-[var(--ink-strong)] border-b-2 border-blue-400'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-default)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              {tabConfig[tab].label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[200px]">
          {activeTab === 'jobs' && <JobsTab />}
          {activeTab === 'stages' && <StagesTab />}
          {activeTab === 'sql' && <SQLTab />}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[var(--line-thin)] text-xs text-[var(--ink-muted)]">
          <span className="flex items-center gap-1.5">
            <RedFlagIcon /> Красный флаг — требует внимания
          </span>
          <span>Наведите на <strong className="text-amber-400">!</strong> для объяснения</span>
        </div>
      </div>
    </DiagramContainer>
  );
}
