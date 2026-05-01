/**
 * ExecutorLifecycleDiagram (DIAG-10)
 *
 * Timeline visualization of executor lifecycle: Registration -> Task Assignment ->
 * Execution -> Heartbeat -> Speculative Execution -> Decommission.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';

interface Phase {
  id: string;
  label: string;
  tooltip: string;
  detail: string;
  config?: string;
}

const phases: Phase[] = [
  {
    id: 'registration',
    label: 'Registration',
    tooltip: 'Executor регистрируется в driver и получает выделенные ресурсы.',
    detail:
      'Executor регистрируется в driver через heartbeat. Driver выделяет ресурсы (cores, memory). Executor получает уникальный ID и становится доступным для получения tasks.',
  },
  {
    id: 'task-assignment',
    label: 'Task Assignment',
    tooltip: 'TaskScheduler отправляет сериализованный Task на executor.',
    detail:
      'TaskScheduler отправляет сериализованный Task. Executor десериализует и запускает compute(). Task содержит: функцию для выполнения, информацию о партиции, зависимости (broadcast variables).',
  },
  {
    id: 'execution',
    label: 'Execution',
    tooltip: 'Executor обрабатывает одну партицию данных и возвращает результат.',
    detail:
      'Task обрабатывает одну партицию данных. Результат отправляется обратно driver. Для ShuffleMapTask -- записывает shuffle output на локальный диск. Для ResultTask -- отправляет результат в driver.',
  },
  {
    id: 'heartbeat',
    label: 'Heartbeat',
    tooltip: 'Периодический сигнал жизни от executor к driver.',
    detail:
      'Каждые spark.executor.heartbeatInterval (10s). Если пропущен -- executor считается потерянным. Heartbeat содержит: metrics (memory usage, task progress), accumulator updates. Driver использует heartbeats для мониторинга и speculation.',
    config: 'spark.executor.heartbeatInterval = 10s',
  },
  {
    id: 'speculative',
    label: 'Speculative',
    tooltip: 'Дублирование медленных tasks на других executors.',
    detail:
      'spark.speculation=true: дублирование медленных tasks на других executors. Первый завершённый побеждает. Стратегия: если task работает в 1.5x дольше медианы и завершено 75% tasks в стадии -- запускается дубликат.',
    config: 'spark.speculation = true',
  },
  {
    id: 'decommission',
    label: 'Decommission',
    tooltip: 'Graceful shutdown с миграцией tasks (Spark 3.1+).',
    detail:
      'Spark 3.1+: graceful shutdown, миграция tasks перед удалением executor. Shuffle данные мигрируются на другие executors. Кэшированные блоки реплицируются. Важно для Kubernetes auto-scaling и dynamic allocation.',
    config: 'spark.decommission.enabled = true',
  },
];

export function ExecutorLifecycleDiagram() {
  const [activePhase, setActivePhase] = useState<string | null>(null);

  const handlePhaseClick = (phaseId: string) => {
    setActivePhase(activePhase === phaseId ? null : phaseId);
  };

  const activeDetail = phases.find((p) => p.id === activePhase);

  return (
    <DiagramContainer title="Жизненный цикл Executor" color="green">
      <div className="flex flex-col gap-4">
        {/* Timeline - horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-1 min-w-max">
            {phases.map((phase, index) => (
              <div key={phase.id} className="flex items-center">
                <DiagramTooltip content={phase.tooltip}>
                  <FlowNode
                    variant="connector"
                    onClick={() => handlePhaseClick(phase.id)}
                    tabIndex={0}
                    size="sm"
                  >
                    {phase.label}
                  </FlowNode>
                </DiagramTooltip>

                {index < phases.length - 1 && (
                  <Arrow direction="right" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {activeDetail && (
          <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--line-thin)]">
            <h4 className="text-sm font-semibold text-[var(--ink-strong)] mb-2">
              {activeDetail.label}
            </h4>
            <p className="text-xs text-[var(--ink-default)] mb-2">
              {activeDetail.detail}
            </p>
            {activeDetail.config && (
              <div className="mt-2 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-400/20">
                <code className="text-xs text-emerald-700 font-mono">
                  {activeDetail.config}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <p className="text-xs text-[var(--ink-muted)]">
          Нажмите на фазу для подробной информации
        </p>
      </div>
    </DiagramContainer>
  );
}
