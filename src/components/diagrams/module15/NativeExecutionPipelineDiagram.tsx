/** @jsxImportSource solid-js */
import { createSignal } from 'solid-js';
/**
 * NativeExecutionPipelineDiagram (DIAG-M15)
 *
 * Interactive visualization of native execution pipelines for Spark.
 * Toggle between Comet (Rust/DataFusion) and Gluten (C++/Velox/ClickHouse)
 * to see how each plugin intercepts and accelerates Spark physical plans.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';

type Mode = 'comet' | 'gluten';

/** Vertical arrow connector */
function VArrow(props: { label?: string }) {
  return (
    <div class="flex flex-col items-center py-1">
      {props.label && (
        <span class="text-[9px] md:text-[10px] text-[var(--ink-muted)] mb-1 text-center leading-tight">
          {props.label}
        </span>
      )}
      <div class="w-0.5 h-5 bg-[var(--bg-deep)]" />
      <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-gray-500" />
    </div>
  );
}

/** Merge arrow pointing down into a box */
function MergeArrow() {
  return (
    <div class="flex flex-col items-center py-1">
      <div class="w-0.5 h-4 bg-[var(--bg-deep)]" />
      <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-gray-500" />
    </div>
  );
}

export default function NativeExecutionPipelineDiagram() {
  const [mode, setMode] = createSignal<Mode>('comet');

  const isComet = () => mode() === 'comet';

  return (
    <DiagramContainer
      title="Native Execution Pipeline: Comet vs Gluten"
      color={isComet() ? 'blue' : 'amber'}
    >
      <div class="flex flex-col items-center gap-3 md:gap-4">
        {/* Mode toggle */}
        <div class="flex items-center justify-center gap-3">
          <button
            onClick={() => setMode('comet')}
            class={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isComet()
                ? 'bg-cyan-500/20 text-cyan-700 border border-cyan-400/50'
                : 'bg-[var(--bg-surface)] text-[var(--ink-muted)] border border-[var(--line-thin)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            Comet (Rust)
          </button>
          <button
            onClick={() => setMode('gluten')}
            class={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !isComet()
                ? 'bg-amber-500/20 text-amber-700 border border-amber-400/50'
                : 'bg-[var(--bg-surface)] text-[var(--ink-muted)] border border-[var(--line-thin)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            Gluten (C++)
          </button>
        </div>

        {/* Common top: SQL -> Catalyst -> Physical Plan */}
        <DiagramTooltip content="SQL or DataFrame API -- the entry point for all Spark queries.">
          <div class="bg-blue-500/10 border border-blue-400/30 rounded-xl px-5 py-2.5 backdrop-blur-sm cursor-help text-center">
            <span class="text-sm font-semibold text-blue-700">SQL / DataFrame API</span>
          </div>
        </DiagramTooltip>

        <VArrow />

        <DiagramTooltip content="Catalyst generates a logical plan, applies optimization rules, then produces a physical plan with concrete operator implementations.">
          <div class="bg-blue-500/10 border border-blue-400/30 rounded-xl px-5 py-2.5 backdrop-blur-sm cursor-help text-center">
            <span class="text-sm font-semibold text-blue-700">Catalyst Optimizer</span>
            <p class="text-[10px] text-[var(--ink-muted)] mt-0.5">Logical Plan &rarr; Physical Plan</p>
          </div>
        </DiagramTooltip>

        <VArrow label="Physical Plan" />

        {/* Plugin intercept */}
        <div class="transition-all duration-500">
          {isComet() ? (
            <DiagramTooltip content="CometScanRule replaces scan operators. CometExecRule traverses the plan bottom-up, replacing supported operators with native Comet equivalents.">
              <div class="bg-cyan-500/10 border border-cyan-400/40 rounded-xl px-5 py-2.5 backdrop-blur-sm cursor-help text-center">
                <span class="text-sm font-semibold text-cyan-700">CometPlugin Intercepts</span>
                <p class="text-[10px] text-[var(--ink-muted)] mt-0.5">CometScanRule + CometExecRule (bottom-up)</p>
              </div>
            </DiagramTooltip>
          ) : (
            <DiagramTooltip content="GlutenPlugin validates the plan at planning time via SparkPlugin API. Supported operators are converted to Substrait plan format.">
              <div class="bg-amber-500/10 border border-amber-400/40 rounded-xl px-5 py-2.5 backdrop-blur-sm cursor-help text-center">
                <span class="text-sm font-semibold text-amber-700">GlutenPlugin Intercepts</span>
                <p class="text-[10px] text-[var(--ink-muted)] mt-0.5">SparkPlugin validates plan at planning time</p>
              </div>
            </DiagramTooltip>
          )}
        </div>

        <VArrow label="Operator tree" />

        {/* Branch: Supported / Unsupported */}
        <div class="flex flex-row gap-4 md:gap-8 items-start w-full justify-center">
          {/* Left path: Supported (native) */}
          <div class="flex flex-col items-center gap-2 flex-1 max-w-[220px]">
            <span class={`text-[10px] font-medium ${isComet() ? 'text-cyan-400' : 'text-amber-400'}`}>
              Supported operators
            </span>

            {isComet() ? (
              /* Comet native path */
              <>
                <DiagramTooltip content="Consecutive Comet operators combine into CometNativeExec. The operator tree is serialized to Protocol Buffer format.">
                  <div class="bg-cyan-500/10 border border-cyan-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span class="text-xs font-semibold text-cyan-700">CometNativeExec</span>
                    <p class="text-[9px] text-[var(--ink-muted)] mt-0.5">ProtoBuf &rarr; JNI</p>
                  </div>
                </DiagramTooltip>
                <MergeArrow />
                <DiagramTooltip content="DataFusion executes the plan natively in Rust with vectorized batch processing and Arrow columnar format.">
                  <div class="bg-cyan-500/10 border border-cyan-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span class="text-xs font-semibold text-cyan-700">DataFusion (Rust)</span>
                    <p class="text-[9px] text-[var(--ink-muted)] mt-0.5">Vectorized execution</p>
                  </div>
                </DiagramTooltip>
                <MergeArrow />
                <DiagramTooltip content="Results returned to JVM via Arrow FFI (Foreign Function Interface) -- zero-copy transfer of Arrow RecordBatch.">
                  <div class="bg-cyan-500/10 border border-cyan-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span class="text-xs font-semibold text-cyan-700">Arrow RecordBatch</span>
                    <p class="text-[9px] text-[var(--ink-muted)] mt-0.5">Arrow FFI &rarr; JVM</p>
                  </div>
                </DiagramTooltip>
              </>
            ) : (
              /* Gluten native path */
              <>
                <DiagramTooltip content="Gluten converts the physical plan to Substrait format -- a cross-language specification for query plans.">
                  <div class="bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span class="text-xs font-semibold text-amber-700">Substrait Plan</span>
                    <p class="text-[9px] text-[var(--ink-muted)] mt-0.5">Cross-language plan spec</p>
                  </div>
                </DiagramTooltip>
                <MergeArrow />
                <DiagramTooltip content="Velox (Meta, C++) provides vectorized columnar execution with lazy materialization. ClickHouse backend (Kyligence) offers alternative operator coverage.">
                  <div class="bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span class="text-xs font-semibold text-amber-700">Velox (C++) / ClickHouse</span>
                    <p class="text-[9px] text-[var(--ink-muted)] mt-0.5">Native execution backend</p>
                  </div>
                </DiagramTooltip>
                <MergeArrow />
                <DiagramTooltip content="Results returned as ArrowColumnarBatch -- Arrow-compatible columnar batches returned to Spark.">
                  <div class="bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full">
                    <span class="text-xs font-semibold text-amber-700">ArrowColumnarBatch</span>
                    <p class="text-[9px] text-[var(--ink-muted)] mt-0.5">Return to Spark</p>
                  </div>
                </DiagramTooltip>
              </>
            )}
          </div>

          {/* Right path: Unsupported (fallback) */}
          <div class="flex flex-col items-center gap-2 flex-1 max-w-[220px]">
            <span class="text-[10px] font-medium text-[var(--ink-subtle)]">
              Unsupported operators
            </span>

            {isComet() ? (
              <DiagramTooltip content="Unsupported operators stay on Tungsten JVM execution. The fallback reason is stored on the Spark plan node for diagnostics (spark.comet.explainFallback.enabled=true).">
                <div class="bg-[var(--bg-surface)] border border-[var(--line-thin)] rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full opacity-60">
                  <span class="text-xs font-semibold text-[var(--ink-muted)]">JVM Fallback</span>
                  <p class="text-[9px] text-[var(--ink-subtle)] mt-0.5">Tungsten execution</p>
                  <p class="text-[9px] text-[var(--ink-subtle)]">Reason stored on node</p>
                </div>
              </DiagramTooltip>
            ) : (
              <DiagramTooltip content="Unsupported operators fall back to vanilla Spark JVM execution. ColumnarToRow (C2R) and RowToColumnar (R2C) conversions add overhead at boundaries.">
                <div class="bg-[var(--bg-surface)] border border-[var(--line-thin)] rounded-lg px-3 py-2 backdrop-blur-sm cursor-help text-center w-full opacity-60">
                  <span class="text-xs font-semibold text-[var(--ink-muted)]">JVM Fallback</span>
                  <p class="text-[9px] text-[var(--ink-subtle)] mt-0.5">+ C2R / R2C overhead</p>
                  <p class="text-[9px] text-[var(--ink-subtle)]">ColumnarToRow conversion</p>
                </div>
              </DiagramTooltip>
            )}
          </div>
        </div>

        {/* Merge: Results */}
        <MergeArrow />
        <div class="bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-5 py-2.5 backdrop-blur-sm text-center">
          <span class="text-sm font-semibold text-emerald-700">Results</span>
        </div>

        {/* Comparison metrics */}
        <div class="flex flex-wrap gap-3 justify-center mt-2">
          <DataBox
            label="Language"
            value={isComet() ? 'Rust' : 'C++'}
            variant={isComet() ? 'highlight' : undefined}
          />
          <DataBox
            label="Engine"
            value={isComet() ? 'DataFusion' : 'Velox / CH'}
            variant={isComet() ? 'highlight' : undefined}
          />
          <DataBox
            label="Plan format"
            value={isComet() ? 'ProtoBuf' : 'Substrait'}
            variant={isComet() ? 'highlight' : undefined}
          />
          <DataBox
            label="TPC-H speedup"
            value={isComet() ? '~2.4x' : '~3.3x'}
            variant={isComet() ? 'highlight' : undefined}
          />
        </div>

        {/* Legend */}
        <div class="flex items-center justify-center gap-4 text-xs text-[var(--ink-muted)] mt-1">
          <span class="flex items-center gap-1.5">
            <span class="inline-block w-3 h-3 rounded bg-blue-500/20 border border-blue-400/30" />
            Spark / Common
          </span>
          <span class="flex items-center gap-1.5">
            <span class={`inline-block w-3 h-3 rounded ${
              isComet()
                ? 'bg-cyan-500/20 border border-cyan-400/30'
                : 'bg-amber-500/20 border border-amber-400/30'
            }`} />
            {isComet() ? 'Comet (native)' : 'Gluten (native)'}
          </span>
          <span class="flex items-center gap-1.5">
            <span class="inline-block w-3 h-3 rounded bg-[var(--bg-surface)] border border-[var(--line-thin)] opacity-60" />
            Fallback (JVM)
          </span>
        </div>
      </div>
    </DiagramContainer>
  );
}
