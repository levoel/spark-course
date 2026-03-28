/**
 * NativeExecutionPipelineDiagram (DIAG-M15)
 *
 * Interactive visualization of native execution pipelines for Spark.
 * Toggle between Comet (Rust/DataFusion) and Gluten (C++/Velox/ClickHouse)
 * to see how each plugin intercepts and accelerates Spark physical plans.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';

type Mode = 'comet' | 'gluten';

/** Vertical arrow connector */
function VArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      {label && (
        <span className="text-[9px] md:text-[10px] text-gray-400 mb-1 text-center leading-tight">
          {label}
        </span>
      )}
      <div className="w-0.5 h-5 bg-gray-500" />
      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-gray-500" />
    </div>
  );
}

/** Merge arrow pointing down into a box */
function MergeArrow() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-0.5 h-4 bg-gray-500" />
      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-gray-500" />
    </div>
  );
}

export default function NativeExecutionPipelineDiagram() {
  const [mode, setMode] = useState<Mode>('comet');

  const isComet = mode === 'comet';

  return (
    <DiagramContainer
      title="Native Execution Pipeline: Comet vs Gluten"
      color={isComet ? 'blue' : 'amber'}
    >
      <div className="flex flex-col items-center gap-3 md:gap-4">
        {/* Mode toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setMode('comet')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isComet
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            Comet (Rust)
          </button>
          <button
            onClick={() => setMode('gluten')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !isComet
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            Gluten (C++)
          </button>
        </div>

        {/* Common top: SQL -> Catalyst -> Physical Plan */}
        <DiagramTooltip content="SQL or DataFrame API -- the entry point for all Spark queries.">
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl px-5 py-2.5 backdrop-blur-sm cursor-help text-center">
            <span className="text-sm font-semibold text-blue-300">SQL / DataFrame API</span>
          </div>
        </DiagramTooltip>

        <VArrow />

        <DiagramTooltip content="Catalyst generates a logical plan, applies optimization rules, then produces a physical plan with concrete operator implementations.">
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl px-5 py-2.5 backdrop-blur-sm cursor-help text-center">
            <span className="text-sm font-semibold text-blue-300">Catalyst Optimizer</span>
            <p className="text-[10px] text-gray-400 mt-0.5">Logical Plan &rarr; Physical Plan</p>
          </div>
        </DiagramTooltip>

        <VArrow label="Physical Plan" />

        {/* Plugin intercept */}
        <div className="transition-all duration-500">
          {isComet ? (
            <DiagramTooltip content="CometScanRule replaces scan operators. CometExecRule traverses the plan bottom-up, replacing supported operators with native Comet equivalents.">
              <div className="bg-cyan-500/10 border border-cyan-400/40 rounded-xl px-5 py-2.5 backdrop-blur-sm cursor-help text-center">
                <span className="text-sm font-semibold text-cyan-300">CometPlugin Intercepts</span>
                <p className="text-[10px] text-gray-400 mt-0.5">CometScanRule + CometExecRule (bottom-up)</p>
              </div>
            </DiagramTooltip>
          ) : (
            <DiagramTooltip content="GlutenPlugin validates the plan at planning time via SparkPlugin API. Supported operators are converted to Substrait plan format.">
              <div className="bg-amber-500/10 border border-amber-400/40 rounded-xl px-5 py-2.5 backdrop-blur-sm cursor-help text-center">
                <span className="text-sm font-semibold text-amber-300">GlutenPlugin Intercepts</span>
                <p className="text-[10px] text-gray-400 mt-0.5">SparkPlugin validates plan at planning time</p>
              </div>
            </DiagramTooltip>
          )}
        </div>

        <VArrow label="Operator tree" />

        {/* Branch: Supported / Unsupported */}
        <div className="flex flex-row gap-4 md:gap-8 items-start w-full justify-center">
          {/* Left path: Supported (native) */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[220px]">
            <span className={`text-[10px] font-medium ${isComet ? 'text-cyan-400' : 'text-amber-400'}`}>
              Supported operators
            </span>

            {isComet ? (
              /* Comet native path */
              <>
                <DiagramTooltip content="Consecutive Comet operators combine into CometNativeExec. The operator tree is serialized to Protocol Buffer format.">
                  <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span className="text-xs font-semibold text-cyan-300">CometNativeExec</span>
                    <p className="text-[9px] text-gray-400 mt-0.5">ProtoBuf &rarr; JNI</p>
                  </div>
                </DiagramTooltip>
                <MergeArrow />
                <DiagramTooltip content="DataFusion executes the plan natively in Rust with vectorized batch processing and Arrow columnar format.">
                  <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span className="text-xs font-semibold text-cyan-300">DataFusion (Rust)</span>
                    <p className="text-[9px] text-gray-400 mt-0.5">Vectorized execution</p>
                  </div>
                </DiagramTooltip>
                <MergeArrow />
                <DiagramTooltip content="Results returned to JVM via Arrow FFI (Foreign Function Interface) -- zero-copy transfer of Arrow RecordBatch.">
                  <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span className="text-xs font-semibold text-cyan-200">Arrow RecordBatch</span>
                    <p className="text-[9px] text-gray-400 mt-0.5">Arrow FFI &rarr; JVM</p>
                  </div>
                </DiagramTooltip>
              </>
            ) : (
              /* Gluten native path */
              <>
                <DiagramTooltip content="Gluten converts the physical plan to Substrait format -- a cross-language specification for query plans.">
                  <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span className="text-xs font-semibold text-amber-300">Substrait Plan</span>
                    <p className="text-[9px] text-gray-400 mt-0.5">Cross-language plan spec</p>
                  </div>
                </DiagramTooltip>
                <MergeArrow />
                <DiagramTooltip content="Velox (Meta, C++) provides vectorized columnar execution with lazy materialization. ClickHouse backend (Kyligence) offers alternative operator coverage.">
                  <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span className="text-xs font-semibold text-amber-300">Velox (C++) / ClickHouse</span>
                    <p className="text-[9px] text-gray-400 mt-0.5">Native execution backend</p>
                  </div>
                </DiagramTooltip>
                <MergeArrow />
                <DiagramTooltip content="Results returned as ArrowColumnarBatch -- Arrow-compatible columnar batches returned to Spark.">
                  <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span className="text-xs font-semibold text-amber-200">ArrowColumnarBatch</span>
                    <p className="text-[9px] text-gray-400 mt-0.5">Return to Spark</p>
                  </div>
                </DiagramTooltip>
              </>
            )}
          </div>

          {/* Right path: Unsupported (fallback) */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[220px]">
            <span className="text-[10px] font-medium text-gray-500">
              Unsupported operators
            </span>

            {isComet ? (
              <DiagramTooltip content="Unsupported operators stay on Tungsten JVM execution. The fallback reason is stored on the Spark plan node for diagnostics (spark.comet.explainFallback.enabled=true).">
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full opacity-60">
                  <span className="text-xs font-semibold text-gray-400">JVM Fallback</span>
                  <p className="text-[9px] text-gray-500 mt-0.5">Tungsten execution</p>
                  <p className="text-[9px] text-gray-500">Reason stored on node</p>
                </div>
              </DiagramTooltip>
            ) : (
              <DiagramTooltip content="Unsupported operators fall back to vanilla Spark JVM execution. ColumnarToRow (C2R) and RowToColumnar (R2C) conversions add overhead at boundaries.">
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full opacity-60">
                  <span className="text-xs font-semibold text-gray-400">JVM Fallback</span>
                  <p className="text-[9px] text-gray-500 mt-0.5">+ C2R / R2C overhead</p>
                  <p className="text-[9px] text-gray-500">ColumnarToRow conversion</p>
                </div>
              </DiagramTooltip>
            )}
          </div>
        </div>

        {/* Merge: Results */}
        <MergeArrow />
        <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-5 py-2.5 backdrop-blur-sm text-center">
          <span className="text-sm font-semibold text-emerald-300">Results</span>
        </div>

        {/* Comparison metrics */}
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <DataBox
            label="Language"
            value={isComet ? 'Rust' : 'C++'}
            variant={isComet ? 'highlight' : undefined}
          />
          <DataBox
            label="Engine"
            value={isComet ? 'DataFusion' : 'Velox / CH'}
            variant={isComet ? 'highlight' : undefined}
          />
          <DataBox
            label="Plan format"
            value={isComet ? 'ProtoBuf' : 'Substrait'}
            variant={isComet ? 'highlight' : undefined}
          />
          <DataBox
            label="TPC-H speedup"
            value={isComet ? '~2.4x' : '~3.3x'}
            variant={isComet ? 'highlight' : undefined}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-blue-500/20 border border-blue-400/30" />
            Spark / Common
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded ${
              isComet
                ? 'bg-cyan-500/20 border border-cyan-400/30'
                : 'bg-amber-500/20 border border-amber-400/30'
            }`} />
            {isComet ? 'Comet (native)' : 'Gluten (native)'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-white/5 border border-white/10 opacity-60" />
            Fallback (JVM)
          </span>
        </div>
      </div>
    </DiagramContainer>
  );
}
