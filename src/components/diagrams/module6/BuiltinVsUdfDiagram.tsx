/**
 * BuiltinVsUdfDiagram
 *
 * Side-by-side comparison showing how built-in upper() runs inside JVM Tungsten
 * codegen (~5ns) vs Python UDF upper() with JVM-socket-Python overhead (~5μs).
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowRow } from '@primitives/FlowRow';
import { FlowColumn } from '@primitives/FlowColumn';
import { Arrow } from '@primitives/Arrow';

export function BuiltinVsUdfDiagram() {
  return (
    <DiagramContainer title="Встроенная функция vs Python UDF" color="amber">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Built-in side */}
        <div className="flex flex-col gap-3">
          <div className="text-center text-sm font-semibold text-emerald-300 mb-1">
            Встроенная функция upper()
          </div>
          <FlowColumn gap={6}>
            <FlowNode variant="compute" size="md">
              JVM Executor
            </FlowNode>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <pre className="text-[11px] text-emerald-300 font-mono leading-relaxed">
{`Tungsten CodeGen:
for (row in partition) {
  result = row.getString(0)
             .toUpperCase()
  output.write(result)
}`}
              </pre>
            </div>
            <div className="text-center">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded">
                ~5ns per row (нативный JVM код)
              </span>
            </div>
          </FlowColumn>
        </div>

        {/* UDF side */}
        <div className="flex flex-col gap-3">
          <div className="text-center text-sm font-semibold text-rose-300 mb-1">
            Python UDF upper()
          </div>
          <FlowColumn gap={4}>
            <FlowRow gap={8} wrap={false}>
              <FlowNode variant="compute" size="sm">
                JVM Executor
              </FlowNode>
              <FlowNode variant="app" size="sm">
                Python Worker
              </FlowNode>
            </FlowRow>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 space-y-1">
              {[
                { label: 'serialize(row)', time: '~1μs', side: 'JVM' },
                { label: '→ socket transfer →', time: '', side: '' },
                { label: 'deserialize(bytes)', time: '~1μs', side: 'Py' },
                { label: 'result = s.upper()', time: '~0.1μs', side: 'Py' },
                { label: 'serialize(result)', time: '~1μs', side: 'Py' },
                { label: '← socket transfer ←', time: '', side: '' },
                { label: 'deserialize(bytes)', time: '~1μs', side: 'JVM' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] font-mono text-rose-300/80">
                  {step.side && (
                    <span className="text-[9px] opacity-50 w-6">{step.side}</span>
                  )}
                  <span className={step.side ? '' : 'text-gray-500 text-center w-full'}>{step.label}</span>
                  {step.time && <span className="ml-auto opacity-60">{step.time}</span>}
                </div>
              ))}
            </div>

            <div className="text-center">
              <span className="text-xs font-mono text-rose-400 bg-rose-500/15 px-2 py-1 rounded">
                ~5μs per row (1000x медленнее!)
              </span>
            </div>
          </FlowColumn>
        </div>
      </div>
    </DiagramContainer>
  );
}
