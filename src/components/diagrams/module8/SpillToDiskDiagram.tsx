/**
 * SpillToDiskDiagram (DIAG-12)
 *
 * Interactive memory pressure visualization showing how reducing
 * executor memory triggers spill-to-disk and degrades performance.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Calculate memory breakdown and spill state based on total executor memory */
function calculateMemoryState(totalMB: number) {
  // spark.memory.fraction = 0.6 (default)
  // spark.memory.storageFraction = 0.5 (default)
  // Reserved = 300MB (Spark internal)
  // User memory = 40% of total (1 - memory.fraction)

  const reservedMB = 300;
  const usableMB = Math.max(totalMB - reservedMB, 0);
  const unifiedMB = usableMB * 0.6; // spark.memory.fraction
  const userMB = usableMB * 0.4;

  const storageMB = unifiedMB * 0.5; // spark.memory.storageFraction
  const executionMB = unifiedMB * 0.5;

  // Simulate a workload that needs ~300MB of execution memory
  const workloadNeedMB = 300;
  const executionUsedMB = Math.min(workloadNeedMB, executionMB);
  const executionUtilization = executionMB > 0 ? (workloadNeedMB / executionMB) * 100 : 100;

  const spillMB = Math.max(workloadNeedMB - executionMB, 0);
  const spillState: 'none' | 'partial' | 'heavy' =
    spillMB === 0 ? 'none' : spillMB < 150 ? 'partial' : 'heavy';

  // Performance impact: base time + spill overhead
  const baseTimeMs = 2000;
  const spillOverheadMs = spillMB * 15; // ~15ms per MB spilled (disk I/O)
  const totalTimeMs = baseTimeMs + spillOverheadMs;

  return {
    totalMB,
    reservedMB,
    userMB,
    storageMB,
    executionMB,
    executionUsedMB,
    executionUtilization: clamp(executionUtilization, 0, 200),
    spillMB,
    spillState,
    baseTimeMs,
    totalTimeMs,
    slowdownFactor: totalTimeMs / baseTimeMs,
  };
}

const spillStateColors = {
  none: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', label: 'Нет spill' },
  partial: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', label: 'Частичный spill' },
  heavy: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', label: 'Тяжёлый spill' },
};

function MemoryBar({ label, sizeMB, totalMB, color, tooltip }: {
  label: string;
  sizeMB: number;
  totalMB: number;
  color: string;
  tooltip: string;
}) {
  const widthPercent = totalMB > 0 ? (sizeMB / totalMB) * 100 : 0;

  return (
    <DiagramTooltip content={tooltip}>
      <div
        className={`h-10 ${color} flex items-center justify-center border-r border-white/10 cursor-help transition-all duration-300`}
        style={{ width: `${Math.max(widthPercent, 3)}%` }}
      >
        <span className="text-[10px] font-mono text-white/90 whitespace-nowrap px-1">
          {label} ({Math.round(sizeMB)} MB)
        </span>
      </div>
    </DiagramTooltip>
  );
}

export function SpillToDiskDiagram() {
  const [totalMemoryMB, setTotalMemoryMB] = useState(1024);
  const state = calculateMemoryState(totalMemoryMB);
  const spillStyle = spillStateColors[state.spillState];

  return (
    <DiagramContainer title="Spill to Disk: Давление на память" color="amber">
      <div className="flex flex-col gap-5">
        {/* Memory slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">
              spark.executor.memory
            </label>
            <span className="text-sm font-mono text-white font-semibold">
              {totalMemoryMB >= 1024 ? `${(totalMemoryMB / 1024).toFixed(1)} GB` : `${totalMemoryMB} MB`}
            </span>
          </div>
          <input
            type="range"
            min={200}
            max={2048}
            step={50}
            value={totalMemoryMB}
            onChange={(e) => setTotalMemoryMB(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>200 MB</span>
            <span>2 GB</span>
          </div>
        </div>

        {/* Memory bar visualization */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-gray-400">Распределение памяти executor:</p>
          <div className="flex w-full rounded-lg overflow-hidden border border-white/10">
            <MemoryBar
              label="Reserved"
              sizeMB={state.reservedMB}
              totalMB={state.totalMB}
              color="bg-gray-600"
              tooltip="Reserved memory (300 MB) — внутренние нужды Spark. Не настраивается."
            />
            <MemoryBar
              label="User"
              sizeMB={state.userMB}
              totalMB={state.totalMB}
              color="bg-purple-600/70"
              tooltip={`User memory (${Math.round(state.userMB)} MB) = (total - reserved) × (1 - spark.memory.fraction). Для ваших структур данных и UDF.`}
            />
            <MemoryBar
              label="Storage"
              sizeMB={state.storageMB}
              totalMB={state.totalMB}
              color="bg-blue-600/70"
              tooltip={`Storage memory (${Math.round(state.storageMB)} MB) = unified × spark.memory.storageFraction. Для cache/persist. Может быть вытеснена execution memory при давлении.`}
            />
            <MemoryBar
              label="Execution"
              sizeMB={state.executionMB}
              totalMB={state.totalMB}
              color={state.spillState === 'none' ? 'bg-emerald-600/70' : state.spillState === 'partial' ? 'bg-amber-600/70' : 'bg-red-600/70'}
              tooltip={`Execution memory (${Math.round(state.executionMB)} MB) = unified × (1 - storageFraction). Для shuffles, joins, sorts, aggregations. При нехватке — spill to disk.`}
            />
          </div>
        </div>

        {/* Spill status */}
        <div className={`p-3 rounded-lg ${spillStyle.bg} border ${spillStyle.border}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${spillStyle.text}`}>
              {spillStyle.label}
            </span>
            <span className={`text-xs font-mono ${spillStyle.text}`}>
              Workload: 300 MB | Execution: {Math.round(state.executionMB)} MB
            </span>
          </div>

          {state.spillState !== 'none' && (
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Spill to disk:</span>
                <span className={`font-mono font-bold ${spillStyle.text}`}>{Math.round(state.spillMB)} MB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Execution utilization:</span>
                <span className={`font-mono ${spillStyle.text}`}>{Math.round(state.executionUtilization)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Performance timeline */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400">Время обработки:</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full rounded-full flex items-center px-2 transition-all duration-500 ${
                    state.spillState === 'none'
                      ? 'bg-emerald-500/60'
                      : state.spillState === 'partial'
                        ? 'bg-amber-500/60'
                        : 'bg-red-500/60'
                  }`}
                  style={{ width: `${clamp((state.totalTimeMs / 8000) * 100, 10, 100)}%` }}
                >
                  <span className="text-[10px] font-mono text-white whitespace-nowrap">
                    {(state.totalTimeMs / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>
            {state.spillState !== 'none' && (
              <span className={`text-xs font-mono ${spillStyle.text} whitespace-nowrap`}>
                {state.slowdownFactor.toFixed(1)}x slower
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>Базовое время: {(state.baseTimeMs / 1000).toFixed(1)}s</span>
            {state.spillState !== 'none' && (
              <span>+ {((state.totalTimeMs - state.baseTimeMs) / 1000).toFixed(1)}s disk I/O overhead</span>
            )}
          </div>
        </div>

        {/* Data boxes */}
        <div className="flex flex-wrap gap-3">
          <DataBox
            label="spark.memory.fraction"
            value="0.6"
          />
          <DataBox
            label="spark.memory.storageFraction"
            value="0.5"
          />
          <DataBox
            label="Spill"
            value={state.spillMB > 0 ? `${Math.round(state.spillMB)} MB` : 'None'}
            variant={state.spillState === 'none' ? undefined : 'highlight'}
          />
        </div>

        {/* Legend */}
        <DiagramTooltip content="spark.memory.fraction (0.6) определяет долю JVM heap для unified memory (storage + execution). Остальное — user memory для ваших объектов. При нехватке execution memory данные spill на диск, что в 10-100 раз медленнее RAM.">
          <p className="text-xs text-gray-500 cursor-help border-b border-dashed border-gray-600 inline">
            Наведите: как работает spark.memory.fraction
          </p>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}
