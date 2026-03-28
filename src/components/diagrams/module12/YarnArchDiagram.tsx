/**
 * YarnArchDiagram
 *
 * YARN architecture: ResourceManager with Scheduler + AppManager,
 * NodeManagers running Containers (executors).
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { FlowRow } from '@primitives/FlowRow';
import { Arrow } from '@primitives/Arrow';

export function YarnArchDiagram() {
  return (
    <DiagramContainer title="YARN Architecture" color="amber">
      <FlowColumn gap={12} align="center">
        <div className="w-full max-w-sm rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
          <FlowNode variant="cluster" size="md" className="w-full">
            <FlowColumn gap={1} align="center">
              <span>ResourceManager</span>
              <span className="text-xs opacity-70">глобальный планировщик</span>
            </FlowColumn>
          </FlowNode>
          <div className="mt-2 flex gap-2">
            <span className="text-[10px] text-amber-300 bg-amber-500/10 rounded px-2 py-0.5">
              Scheduler (Fair/Capacity)
            </span>
            <span className="text-[10px] text-amber-300 bg-amber-500/10 rounded px-2 py-0.5">
              AppManager
            </span>
          </div>
        </div>

        <Arrow direction="down" />

        <FlowRow gap={6} wrap align="center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-blue-400/20 bg-blue-500/5 p-3"
            >
              <FlowNode variant="compute" size="sm" className="w-full">
                <span>NodeMgr {i}</span>
              </FlowNode>
              <div className="mt-2 flex flex-col gap-1">
                {[1, 2].map((c) => (
                  <span
                    key={c}
                    className="text-[10px] text-emerald-300 bg-emerald-500/10 rounded px-2 py-0.5 text-center"
                  >
                    Container (executor)
                  </span>
                ))}
              </div>
            </div>
          ))}
        </FlowRow>
      </FlowColumn>
    </DiagramContainer>
  );
}
