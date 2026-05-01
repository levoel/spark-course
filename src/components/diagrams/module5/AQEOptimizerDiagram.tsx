/**
 * AQEOptimizerDiagram (DIAG-07)
 *
 * Step-by-step walkthrough showing AQE runtime re-optimization:
 * initial plan, runtime stats collection, and plan adaptation.
 * Clickable stages with Previous/Next navigation.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';

interface AQEStep {
  id: number;
  title: string;
  description: string;
  nodes: PlanNode[];
  statsNote?: string;
}

interface PlanNode {
  label: string;
  detail: string;
  variant: 'original' | 'stats' | 'optimized';
}

const VARIANT_COLORS = {
  original: 'border-blue-500/40 bg-blue-500/10 text-blue-700',
  stats: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
  optimized: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
} as const;

const VARIANT_DOT_COLORS = {
  original: 'bg-blue-400',
  stats: 'bg-amber-400',
  optimized: 'bg-emerald-400',
} as const;

const steps: AQEStep[] = [
  {
    id: 0,
    title: 'Initial Physical Plan',
    description:
      'Catalyst создал физический план до начала выполнения. SortMergeJoin выбран на основе метаданных каталога (обе таблицы > 10 МБ). 200 shuffle-партиций по умолчанию.',
    nodes: [
      {
        label: 'SortMergeJoin [city]',
        detail: 'Join strategy выбран в compile-time',
        variant: 'original',
      },
      {
        label: 'Exchange hashpartitioning(city, 200)',
        detail: 'Shuffle orders: 200 партиций',
        variant: 'original',
      },
      {
        label: 'Exchange hashpartitioning(city, 200)',
        detail: 'Shuffle city_info: 200 партиций',
        variant: 'original',
      },
      {
        label: 'FileScan parquet [orders]',
        detail: 'Metadata: ~40 ГБ, 100M строк',
        variant: 'original',
      },
      {
        label: 'FileScan parquet [city_info]',
        detail: 'Metadata: ~200 строк',
        variant: 'original',
      },
    ],
  },
  {
    id: 1,
    title: 'Execute Stage 1',
    description:
      'Первый shuffle stage выполнен. AQE собирает runtime статистики: реальные размеры каждой из 200 партиций, количество строк, объём данных в байтах.',
    nodes: [
      {
        label: 'SortMergeJoin [city]',
        detail: 'Ожидает результаты Stage 1...',
        variant: 'original',
      },
      {
        label: 'Stage 1 COMPLETE',
        detail: 'Runtime stats собраны',
        variant: 'stats',
      },
      {
        label: 'Exchange hashpartitioning(city, 200)',
        detail: 'Shuffle city_info: выполнен',
        variant: 'stats',
      },
      {
        label: 'FileScan parquet [orders]',
        detail: 'Прочитано: 100M строк, 40 ГБ',
        variant: 'stats',
      },
      {
        label: 'FileScan parquet [city_info]',
        detail: 'Прочитано: 200 строк, 8 КБ',
        variant: 'stats',
      },
    ],
    statsNote: 'Runtime: 100M rows scanned, shuffle output materialized',
  },
  {
    id: 2,
    title: 'Statistics Analysis',
    description:
      'AQE анализирует runtime данные и обнаруживает проблемы: 1 партиция с ключом "Москва" содержит 800K строк (32 ГБ) -- skew detected. 150 из 200 партиций содержат < 1 МБ данных -- кандидаты на coalesce.',
    nodes: [
      {
        label: 'Skew Detected: partition "Москва"',
        detail: '32 ГБ > median(200 МБ) * 5 AND > 256 МБ',
        variant: 'stats',
      },
      {
        label: 'Small Partitions: 150 of 200',
        detail: '150 партиций < 1 МБ (пустые или почти пустые)',
        variant: 'stats',
      },
      {
        label: 'city_info: 8 КБ total',
        detail: '< 10 МБ broadcast threshold',
        variant: 'stats',
      },
    ],
    statsNote:
      'AQE findings: 1 skewed partition, 150 small partitions, broadcast candidate',
  },
  {
    id: 3,
    title: 'Plan Adaptation',
    description:
      'AQE адаптирует план: SortMergeJoin заменяется на SkewJoin (разбиение skewed-партиции "Москва"). 200 партиций объединяются в 12 через coalesce. city_info переключается на broadcast.',
    nodes: [
      {
        label: 'SkewJoin [city]',
        detail: 'Заменил SortMergeJoin -- skew handling',
        variant: 'optimized',
      },
      {
        label: 'AQEShuffleRead coalesced',
        detail: '200 партиций → 12 партиций',
        variant: 'optimized',
      },
      {
        label: 'BroadcastExchange',
        detail: 'city_info broadcast (8 КБ)',
        variant: 'optimized',
      },
      {
        label: 'Split: "Москва" → 500 sub-partitions',
        detail: '32 ГБ / 64 МБ = 500 balanced tasks',
        variant: 'optimized',
      },
    ],
  },
  {
    id: 4,
    title: 'Optimized Execution',
    description:
      'Финальное выполнение: join с balanced partitions, без straggler tasks. Москва обрабатывается 500 параллельными tasks вместо 1. Общее время stage: ~30 сек вместо ~40 мин.',
    nodes: [
      {
        label: 'SkewJoin [city] -- COMPLETE',
        detail: 'Все partitions balanced',
        variant: 'optimized',
      },
      {
        label: '12 coalesced partitions',
        detail: 'Средний размер: ~7 МБ (optimal)',
        variant: 'optimized',
      },
      {
        label: '500 sub-tasks for "Москва"',
        detail: '64 МБ каждый, параллельно',
        variant: 'optimized',
      },
      {
        label: 'Result: ~80x speedup',
        detail: '30 сек vs 40 мин (straggler eliminated)',
        variant: 'optimized',
      },
    ],
  },
];

export function AQEOptimizerDiagram() {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];

  return (
    <DiagramContainer title="AQE: Runtime Re-Optimization" color="blue">
      <div className="flex flex-col gap-4">
        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(s.id)}
              className={`w-3 h-3 rounded-full transition-all ${
                s.id === currentStep
                  ? 'bg-blue-400 scale-125'
                  : 'bg-[var(--bg-sunken)] hover:bg-[var(--bg-deep)]'
              }`}
              aria-label={`Step ${s.id + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Step title and description */}
        <div className="text-center">
          <h4 className="text-sm font-semibold text-[var(--ink-default)] mb-1">
            Step {currentStep + 1}/{steps.length}: {step.title}
          </h4>
          <p className="text-xs text-[var(--ink-muted)] max-w-lg mx-auto">
            {step.description}
          </p>
        </div>

        {/* Plan nodes */}
        <div className="flex flex-col gap-2">
          {step.nodes.map((node, idx) => (
            <DiagramTooltip key={idx} content={node.detail}>
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${VARIANT_COLORS[node.variant]} cursor-default transition-all hover:scale-[1.01]`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${VARIANT_DOT_COLORS[node.variant]}`}
                />
                <span className="text-sm font-mono">{node.label}</span>
              </div>
            </DiagramTooltip>
          ))}
        </div>

        {/* Stats note */}
        {step.statsNote && (
          <DataBox
            label="Runtime Statistics"
            value={step.statsNote}
            variant="highlight"
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1.5 text-xs rounded-md bg-[var(--bg-sunken)] text-[var(--ink-default)] hover:bg-[var(--bg-sunken)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-[var(--ink-subtle)]">
            {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={() =>
              setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
            }
            disabled={currentStep === steps.length - 1}
            className="px-3 py-1.5 text-xs rounded-md bg-[var(--bg-sunken)] text-[var(--ink-default)] hover:bg-[var(--bg-sunken)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--ink-subtle)] pt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Original Plan
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Statistics
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Optimized
          </span>
        </div>
      </div>
    </DiagramContainer>
  );
}
