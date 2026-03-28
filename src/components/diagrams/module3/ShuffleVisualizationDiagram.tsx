/**
 * ShuffleVisualizationDiagram (DIAG-01)
 *
 * Interactive visualization of narrow vs wide transformations.
 * Toggle between filter (narrow -- no shuffle) and groupBy("city") (wide -- shuffle).
 * Shows animated data redistribution across partitions with metrics overlay.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { InteractiveValue } from '@primitives/InteractiveValue';

type TransformMode = 'narrow' | 'wide';

interface DataRow {
  city: string;
  color: string;
}

interface Partition {
  id: number;
  rows: DataRow[];
}

const cityColors: Record<string, string> = {
  Moscow: 'bg-orange-400/80 text-orange-950',
  SPb: 'bg-blue-400/80 text-blue-950',
  Kazan: 'bg-emerald-400/80 text-emerald-950',
};

const cityBorders: Record<string, string> = {
  Moscow: 'border-orange-400/50',
  SPb: 'border-blue-400/50',
  Kazan: 'border-emerald-400/50',
};

const sourcePartitions: Partition[] = [
  { id: 0, rows: [{ city: 'Moscow', color: cityColors.Moscow }, { city: 'SPb', color: cityColors.SPb }, { city: 'Kazan', color: cityColors.Kazan }] },
  { id: 1, rows: [{ city: 'SPb', color: cityColors.SPb }, { city: 'Moscow', color: cityColors.Moscow }, { city: 'Moscow', color: cityColors.Moscow }] },
  { id: 2, rows: [{ city: 'Kazan', color: cityColors.Kazan }, { city: 'Kazan', color: cityColors.Kazan }, { city: 'SPb', color: cityColors.SPb }] },
  { id: 3, rows: [{ city: 'Moscow', color: cityColors.Moscow }, { city: 'SPb', color: cityColors.SPb }, { city: 'Kazan', color: cityColors.Kazan }] },
];

// After filter("city == 'Moscow'") -- rows stay in same partitions
const narrowResult: Partition[] = [
  { id: 0, rows: [{ city: 'Moscow', color: cityColors.Moscow }] },
  { id: 1, rows: [{ city: 'Moscow', color: cityColors.Moscow }, { city: 'Moscow', color: cityColors.Moscow }] },
  { id: 2, rows: [] },
  { id: 3, rows: [{ city: 'Moscow', color: cityColors.Moscow }] },
];

// After groupBy("city") -- rows redistributed by city
const wideResult: Partition[] = [
  { id: 0, rows: [{ city: 'Moscow', color: cityColors.Moscow }, { city: 'Moscow', color: cityColors.Moscow }, { city: 'Moscow', color: cityColors.Moscow }, { city: 'Moscow', color: cityColors.Moscow }] },
  { id: 1, rows: [{ city: 'SPb', color: cityColors.SPb }, { city: 'SPb', color: cityColors.SPb }, { city: 'SPb', color: cityColors.SPb }, { city: 'SPb', color: cityColors.SPb }] },
  { id: 2, rows: [{ city: 'Kazan', color: cityColors.Kazan }, { city: 'Kazan', color: cityColors.Kazan }, { city: 'Kazan', color: cityColors.Kazan }, { city: 'Kazan', color: cityColors.Kazan }] },
];

const partitionGlassStyle = 'rounded-lg border border-white/15 bg-white/5 backdrop-blur-sm p-2 min-h-[80px]';

function PartitionView({ partition, label }: { partition: Partition; label: string }) {
  return (
    <DiagramTooltip content={`Партиция ${partition.id}: ${partition.rows.length} строк. ${label}`}>
      <div className={partitionGlassStyle}>
        <p className="text-[10px] text-gray-400 mb-1.5 font-mono">P{partition.id}</p>
        <div className="flex flex-col gap-1">
          {partition.rows.length === 0 ? (
            <span className="text-[10px] text-gray-500 italic">пусто</span>
          ) : (
            partition.rows.map((row, i) => (
              <DiagramTooltip key={i} content={`Строка: city = "${row.city}"`}>
                <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${row.color} transition-all duration-400`}>
                  {row.city}
                </div>
              </DiagramTooltip>
            ))
          )}
        </div>
      </div>
    </DiagramTooltip>
  );
}

function ShuffleArrows({ mode }: { mode: TransformMode }) {
  if (mode === 'narrow') {
    return (
      <div className="flex justify-around py-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <svg width="20" height="28" viewBox="0 0 20 28">
              <path d="M10 2 L10 20 M4 16 L10 22 L16 16" stroke="rgb(74 222 128)" strokeWidth="2" fill="none" className="transition-all duration-300" />
            </svg>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative py-4 flex items-center justify-center">
      <svg width="100%" height="40" viewBox="0 0 320 40" preserveAspectRatio="xMidYMid meet" className="max-w-xs">
        {/* Animated crossing arrows representing data redistribution */}
        <path d="M40 4 Q80 20 100 36" stroke="rgb(251 146 60)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" className="animate-pulse" />
        <path d="M120 4 Q100 20 100 36" stroke="rgb(251 146 60)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" className="animate-pulse" />
        <path d="M120 4 Q140 20 160 36" stroke="rgb(96 165 250)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" className="animate-pulse" />
        <path d="M200 4 Q180 20 160 36" stroke="rgb(96 165 250)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" className="animate-pulse" />
        <path d="M200 4 Q220 20 240 36" stroke="rgb(52 211 153)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" className="animate-pulse" />
        <path d="M280 4 Q260 20 240 36" stroke="rgb(52 211 153)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" className="animate-pulse" />
        {/* Arrow tips */}
        <polygon points="96,32 100,40 104,32" fill="rgb(251 146 60)" />
        <polygon points="156,32 160,40 164,32" fill="rgb(96 165 250)" />
        <polygon points="236,32 240,40 244,32" fill="rgb(52 211 153)" />
      </svg>
    </div>
  );
}

export function ShuffleVisualizationDiagram() {
  const [mode, setMode] = useState<TransformMode>('narrow');

  const resultPartitions = mode === 'narrow' ? narrowResult : wideResult;
  const totalSourceRows = sourcePartitions.reduce((sum, p) => sum + p.rows.length, 0);
  const totalResultRows = resultPartitions.reduce((sum, p) => sum + p.rows.length, 0);

  return (
    <DiagramContainer title="Визуализация Shuffle" color="orange">
      <div className="flex flex-col gap-3">
        {/* Mode toggle */}
        <div className="flex gap-2 justify-center">
          <DiagramTooltip content="Narrow: filter() -- данные не покидают свои партиции. Нет сетевого трафика.">
            <button
              onClick={() => setMode('narrow')}
              onKeyDown={(e) => e.key === 'Enter' && setMode('narrow')}
              tabIndex={0}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                mode === 'narrow'
                  ? 'bg-green-500/30 text-green-300 border border-green-400/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              Narrow: filter()
            </button>
          </DiagramTooltip>

          <DiagramTooltip content="Wide: groupBy('city') -- данные перемещаются между партициями (shuffle). Высокий сетевой трафик.">
            <button
              onClick={() => setMode('wide')}
              onKeyDown={(e) => e.key === 'Enter' && setMode('wide')}
              tabIndex={0}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                mode === 'wide'
                  ? 'bg-red-500/30 text-red-300 border border-red-400/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              Wide: groupBy()
            </button>
          </DiagramTooltip>
        </div>

        {/* Operation label */}
        <div className={`text-center text-xs font-mono px-3 py-1.5 rounded-md transition-all duration-300 ${
          mode === 'narrow'
            ? 'bg-green-500/10 text-green-300 border border-green-400/20'
            : 'bg-red-500/10 text-red-300 border border-red-400/20'
        }`}>
          {mode === 'narrow'
            ? 'df.filter(col("city") == "Moscow") → Narrow: данные остаются в своих партициях'
            : 'df.groupBy("city").count() → Wide: данные перемещаются между партициями (shuffle)'}
        </div>

        {/* Source partitions */}
        <div>
          <p className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">Исходные партиции</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {sourcePartitions.map((p) => (
              <PartitionView key={p.id} partition={p} label="Исходные данные -- смешанные города" />
            ))}
          </div>
        </div>

        {/* Arrows */}
        <ShuffleArrows mode={mode} />

        {/* Result partitions */}
        <div>
          <p className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">
            {mode === 'narrow' ? 'Результат (в тех же партициях)' : 'Результат после shuffle'}
          </p>
          <div className={`grid gap-2 ${mode === 'narrow' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
            {resultPartitions.map((p) => (
              <PartitionView
                key={p.id}
                partition={p}
                label={
                  mode === 'narrow'
                    ? 'После filter -- данные не перемещались'
                    : `После groupBy -- только ${p.rows[0]?.city ?? 'N/A'}`
                }
              />
            ))}
          </div>
        </div>

        {/* Metrics overlay */}
        <div className="flex flex-wrap gap-3 justify-center mt-1">
          <DataBox
            label="Строк до"
            value={String(totalSourceRows)}
          />
          <DataBox
            label="Строк после"
            value={String(totalResultRows)}
          />
          <InteractiveValue
            label="Данные передано"
            value={mode === 'narrow' ? '0 байт' : '~2.4 MB'}
          />
          <DataBox
            label="Партиций"
            value={`${sourcePartitions.length} → ${resultPartitions.length}`}
            variant={mode === 'wide' ? 'highlight' : undefined}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center text-[10px] text-gray-400 mt-1">
          {Object.entries(cityColors).map(([city, color]) => (
            <span key={city} className="flex items-center gap-1">
              <span className={`inline-block w-2.5 h-2.5 rounded-sm ${color}`} />
              {city}
            </span>
          ))}
        </div>
      </div>
    </DiagramContainer>
  );
}
