/** @jsxImportSource solid-js */
/**
 * ClientModeDiagram
 *
 * Spark Client Mode deploy architecture: Driver runs on user's machine,
 * communicates with Executors in the cluster.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { FlowColumn } from '@primitives/FlowColumn';

export function ClientModeDiagram() {
  return (
    <DiagramContainer title="Client Mode" color="blue">
      <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Ваша машина */}
        <FlowColumn gap={4}>
          <p class="text-xs text-[var(--ink-muted)] font-semibold text-center">
            Ваша машина
          </p>
          <FlowNode variant="app" size="lg">
            Driver
            <br />
            <span class="text-xs opacity-75">(здесь)</span>
          </FlowNode>
        </FlowColumn>

        {/* Arrow: horizontal on desktop, vertical on mobile */}
        <div class="hidden sm:flex items-center">
          <Arrow direction="right" />
        </div>
        <div class="flex sm:hidden items-center">
          <Arrow direction="down" />
        </div>

        {/* Кластер */}
        <FlowColumn gap={4}>
          <p class="text-xs text-[var(--ink-muted)] font-semibold text-center">
            Кластер
          </p>
          <div class="flex flex-col gap-1.5">
            <FlowNode variant="compute" size="sm">Executor 1</FlowNode>
            <FlowNode variant="compute" size="sm">Executor 2</FlowNode>
            <FlowNode variant="compute" size="sm">Executor 3</FlowNode>
          </div>
        </FlowColumn>
      </div>
    </DiagramContainer>
  );
}
