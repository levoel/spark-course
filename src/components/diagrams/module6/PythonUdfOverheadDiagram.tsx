/**
 * PythonUdfOverheadDiagram
 *
 * Sequence-style diagram showing the 9-step per-row overhead of a Python UDF:
 * JVM serialize → socket → Python deserialize → execute → serialize → socket → JVM deserialize.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';

interface Step {
  num: number;
  side: 'jvm' | 'python';
  label: string;
}

const steps: Step[] = [
  { num: 1, side: 'jvm', label: 'Извлечь Row из UnsafeRow (десериализация бинарного формата Tungsten)' },
  { num: 2, side: 'jvm', label: 'Serialize Row → bytes (pickle/cloudpickle)' },
  { num: 3, side: 'jvm', label: 'Отправить bytes через socket →' },
  { num: 4, side: 'python', label: 'Deserialize bytes → Python obj' },
  { num: 5, side: 'python', label: 'Execute Python function' },
  { num: 6, side: 'python', label: 'Serialize result → bytes' },
  { num: 7, side: 'python', label: '← Отправить bytes через socket' },
  { num: 8, side: 'jvm', label: 'Deserialize bytes → JVM obj' },
  { num: 9, side: 'jvm', label: 'Записать результат в UnsafeRow' },
];

export function PythonUdfOverheadDiagram() {
  return (
    <DiagramContainer title="Анатомия вызова Python UDF (per row)" color="rose">
      <div className="flex gap-4 w-full">
        {/* JVM Column */}
        <div className="flex-1 flex flex-col items-center">
          <FlowNode variant="compute" size="sm" className="mb-3 w-full text-center">
            JVM (Executor)
          </FlowNode>
          <div className="w-px bg-emerald-400/30 flex-1 relative">
            {steps.map((s) => (
              <div
                key={s.num}
                className="absolute w-full"
                style={{ top: `${((s.num - 1) / 8) * 100}%` }}
              >
                {s.side === 'jvm' && (
                  <div className="absolute right-2 -translate-y-1/2 whitespace-nowrap">
                    <span className="text-xs text-emerald-700/80 font-mono">
                      {s.num}. {s.label}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Arrow column */}
        <div className="flex flex-col items-center justify-center gap-1 px-2">
          <span className="text-[10px] text-[var(--ink-subtle)] font-mono">socket</span>
        </div>

        {/* Python Column */}
        <div className="flex-1 flex flex-col items-center">
          <FlowNode variant="app" size="sm" className="mb-3 w-full text-center">
            Python Worker
          </FlowNode>
          <div className="w-px bg-rose-400/30 flex-1" />
        </div>
      </div>

      {/* Simplified step list for clarity */}
      <div className="mt-4 grid grid-cols-1 gap-1.5">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs ${
              s.side === 'jvm'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-700'
            }`}
          >
            <span className="font-mono font-bold opacity-60 w-4">{s.num}.</span>
            <span className="font-mono text-[10px] uppercase opacity-50 w-14">
              {s.side === 'jvm' ? 'JVM' : 'Python'}
            </span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--ink-subtle)] mt-3 text-center">
        9 шагов на каждую строку. При 1 миллиарде строк — 9 миллиардов операций.
      </p>
    </DiagramContainer>
  );
}
