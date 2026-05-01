/**
 * SparkConnectDiagram (DIAG-15)
 *
 * Interactive visualization of Spark Connect client-server architecture.
 * Toggle between Traditional mode (thick client = driver) and Connect mode
 * (thin client + remote driver) to see the architectural difference.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';

type Mode = 'traditional' | 'connect';

/** Arrow connector between boxes */
function Arrow({ label, dashed }: { label?: string; dashed?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center min-w-[60px] md:min-w-[80px] shrink-0">
      {label && (
        <span className="text-[9px] md:text-[10px] text-[var(--ink-muted)] text-center mb-1 leading-tight">
          {label}
        </span>
      )}
      <div className="relative w-full h-6 flex items-center">
        <div
          className={`flex-1 h-0.5 ${
            dashed ? 'border-t border-dashed border-[var(--line-medium)]' : 'bg-[var(--bg-deep)]'
          }`}
        />
        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-gray-500 shrink-0" />
      </div>
    </div>
  );
}

/** Styled gRPC channel connector */
function GrpcChannel() {
  return (
    <div className="flex flex-col items-center justify-center min-w-[80px] md:min-w-[100px] shrink-0">
      <span className="text-[9px] md:text-[10px] text-cyan-400 text-center mb-1 font-mono leading-tight">
        gRPC / Proto
      </span>
      <div className="relative w-full h-8 flex items-center">
        <div className="flex-1 h-1 bg-gradient-to-r from-cyan-500/60 via-cyan-400/80 to-cyan-500/60 rounded-full" />
        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-cyan-400/80 shrink-0" />
      </div>
      <DiagramTooltip content="Communication uses Protocol Buffers for plan serialization and Apache Arrow for data transfer.">
        <span className="text-[8px] text-cyan-700/60 cursor-help mt-0.5">
          Protocol Buffers + Arrow
        </span>
      </DiagramTooltip>
    </div>
  );
}

export default function SparkConnectDiagram() {
  const [mode, setMode] = useState<Mode>('traditional');

  const isConnect = mode === 'connect';

  return (
    <DiagramContainer title="Spark Connect: Traditional vs Connect Architecture" color="blue">
      <div className="flex flex-col gap-5">
        {/* Mode toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setMode('traditional')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !isConnect
                ? 'bg-blue-500/20 text-blue-700 border border-blue-400/50'
                : 'bg-[var(--bg-surface)] text-[var(--ink-muted)] border border-[var(--line-thin)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            Traditional Mode
          </button>
          <button
            onClick={() => setMode('connect')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isConnect
                ? 'bg-cyan-500/20 text-cyan-700 border border-cyan-400/50'
                : 'bg-[var(--bg-surface)] text-[var(--ink-muted)] border border-[var(--line-thin)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            Connect Mode
          </button>
        </div>

        {/* Architecture diagram */}
        <div className="transition-all duration-500">
          {!isConnect ? (
            /* ---- Traditional Mode ---- */
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
              <DiagramTooltip content="In traditional mode, the client application IS the Spark driver. If the client crashes, the entire Spark application fails.">
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm cursor-help w-full md:w-auto md:min-w-[180px] transition-all duration-500">
                  <h4 className="text-sm font-semibold text-blue-700 mb-2">
                    Client Application
                  </h4>
                  <div className="space-y-1">
                    <p className="text-xs text-[var(--ink-default)] font-mono">PySpark Driver (~300MB)</p>
                    <p className="text-xs text-[var(--ink-muted)]">SparkSession runs here</p>
                    <p className="text-xs text-[var(--ink-subtle)]">Direct JVM process</p>
                  </div>
                </div>
              </DiagramTooltip>

              <Arrow label="Direct connection" />

              <DiagramTooltip content="Executors receive tasks from the driver running inside the client process.">
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 backdrop-blur-sm cursor-help w-full md:w-auto md:min-w-[180px]">
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">
                    Spark Cluster
                  </h4>
                  <div className="space-y-1">
                    <p className="text-xs text-[var(--ink-default)]">Executors</p>
                    <p className="text-xs text-[var(--ink-muted)]">Tasks execute here</p>
                  </div>
                </div>
              </DiagramTooltip>
            </div>
          ) : (
            /* ---- Connect Mode ---- */
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
              <DiagramTooltip content="Lightweight client sends unresolved logical plans via gRPC. Client crash does NOT affect the running Spark session.">
                <div className="bg-blue-400/5 border border-blue-300/20 rounded-xl p-3 backdrop-blur-sm cursor-help w-full md:w-auto md:min-w-[140px] transition-all duration-500">
                  <h4 className="text-sm font-semibold text-blue-700 mb-2">
                    Thin Client
                  </h4>
                  <div className="space-y-1">
                    <p className="text-xs text-[var(--ink-default)] font-mono">pyspark-client (~5MB)</p>
                    <p className="text-xs text-[var(--ink-muted)]">Sends plans via gRPC</p>
                    <p className="text-xs text-[var(--ink-subtle)]">Language-independent</p>
                  </div>
                </div>
              </DiagramTooltip>

              <GrpcChannel />

              <DiagramTooltip content="Spark Connect server manages the SparkSession lifecycle independently of the client. Multiple clients can share a single server.">
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 backdrop-blur-sm cursor-help w-full md:w-auto md:min-w-[180px]">
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">
                    Spark Connect Server
                  </h4>
                  <div className="space-y-1">
                    <p className="text-xs text-[var(--ink-default)]">Manages SparkSession</p>
                    <p className="text-xs text-[var(--ink-muted)]">Runs on cluster gateway</p>
                    <p className="text-xs text-[var(--ink-subtle)] font-mono">Port 15002</p>
                  </div>
                </div>
              </DiagramTooltip>

              <Arrow label="Task dispatch" />

              <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 backdrop-blur-sm w-full md:w-auto md:min-w-[140px]">
                <h4 className="text-sm font-semibold text-amber-700 mb-2">
                  Spark Cluster
                </h4>
                <div className="space-y-1">
                  <p className="text-xs text-[var(--ink-default)]">Executors</p>
                  <p className="text-xs text-[var(--ink-muted)]">Tasks execute here</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key label */}
        <div className="text-center">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-all duration-500 ${
              isConnect
                ? 'bg-cyan-500/10 text-cyan-700 border border-cyan-400/30'
                : 'bg-blue-500/10 text-blue-700 border border-blue-400/30'
            }`}
          >
            {isConnect ? 'Client decoupled from Driver' : 'Client = Driver (coupled)'}
          </span>
        </div>

        {/* Comparison metrics */}
        <div className="flex flex-wrap gap-3 justify-center">
          <DataBox
            label="Client size"
            value={isConnect ? '~5 MB' : '~300 MB'}
            variant={isConnect ? 'highlight' : undefined}
          />
          <DataBox
            label="Failure isolation"
            value={isConnect ? 'Independent' : 'Coupled'}
            variant={isConnect ? 'highlight' : undefined}
          />
          <DataBox
            label="Multi-client"
            value={isConnect ? 'Supported' : 'N/A'}
            variant={isConnect ? 'highlight' : undefined}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--ink-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-blue-500/20 border border-blue-400/30" />
            Client
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-amber-500/20 border border-amber-400/30" />
            Server / Cluster
          </span>
          {isConnect && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-1 bg-cyan-400/60 rounded-full" />
              gRPC channel
            </span>
          )}
        </div>
      </div>
    </DiagramContainer>
  );
}
