/**
 * DqLabDockerDiagram
 *
 * Docker Compose lab setup: Spark Master + Worker + Jupyter with Great Expectations.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function DqLabDockerDiagram() {
  return (
    <DiagramContainer title="Docker Compose Lab" color="blue">
      <div className="rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
        <div className="text-xs text-blue-700/70 mb-3">Docker Compose</div>

        <FlowColumn gap={10} align="center">
          <FlowRow gap={8} wrap align="start">
            {/* Spark Master */}
            <FlowNode variant="cluster" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Spark Master</span>
                <span className="text-[10px] opacity-70">spark:4.0.0</span>
                <span className="text-[10px] opacity-70">Port: 8080</span>
              </FlowColumn>
            </FlowNode>

            {/* Jupyter */}
            <FlowNode variant="app" size="sm">
              <FlowColumn gap={1} align="center">
                <span>Jupyter + GE</span>
                <span className="text-[10px] opacity-70">PySpark + great-expectations</span>
                <span className="text-[10px] opacity-70">Port: 8888</span>
              </FlowColumn>
            </FlowNode>
          </FlowRow>

          <Arrow direction="down" label="SparkSession connect" />

          {/* Spark Worker */}
          <FlowNode variant="compute" size="sm">
            <FlowColumn gap={1} align="center">
              <span>Spark Worker</span>
              <span className="text-[10px] opacity-70">1 core, 1GB</span>
            </FlowColumn>
          </FlowNode>

          {/* Shared volumes */}
          <div className="text-xs text-[var(--ink-muted)] text-center space-y-0.5">
            <div>Shared volume: ./data/ → /opt/data/</div>
            <div>Shared volume: ./notebooks/ → /opt/notebooks/</div>
          </div>
        </FlowColumn>
      </div>
    </DiagramContainer>
  );
}
