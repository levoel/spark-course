/**
 * DAGExecutionDiagram (DIAG-04)
 *
 * Multi-stage DAG visualization for a JOIN query showing parallel stage execution.
 * Stages 0 and 1 run in parallel, feeding into Stage 2 via shuffle.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DataBox } from '@primitives/DataBox';

interface StageDetail {
  name: string;
  description: string;
  tasks: number;
  operations: string[];
}

const stages: Record<number, StageDetail> = {
  0: {
    name: 'Stage 0: Scan + Filter orders',
    description:
      'Чтение таблицы orders и применение фильтра amount > 100. Narrow dependency -- фильтр применяется к каждой партиции независимо.',
    tasks: 4,
    operations: ['FileScan parquet [orders]', 'Filter (amount > 100)', 'Exchange hashpartitioning(customer_id)'],
  },
  1: {
    name: 'Stage 1: Scan customers',
    description:
      'Чтение таблицы customers. Выполняется параллельно со Stage 0 -- нет зависимости между ними.',
    tasks: 2,
    operations: ['FileScan parquet [customers]', 'Exchange hashpartitioning(id)'],
  },
  2: {
    name: 'Stage 2: SortMergeJoin + Result',
    description:
      'Shuffle read данных из Stage 0 и Stage 1, сортировка по join key, merge join. Это ResultStage -- результат отправляется driver.',
    tasks: 200,
    operations: ['ShuffleRead', 'SortMergeJoin [customer_id = id]', 'Result'],
  },
};

export function DAGExecutionDiagram() {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  const handleStageClick = (stageId: number) => {
    setActiveStage(activeStage === stageId ? null : stageId);
  };

  return (
    <DiagramContainer title="DAG Execution Flow" color="blue">
      <div className="flex flex-col gap-2">
        {/* SQL query reference */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/30 mb-2">
          <p className="text-xs text-blue-200 font-mono">
            SELECT * FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.amount &gt; 100
          </p>
        </div>

        {/* Parallel stages row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Stage 0 */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <DiagramTooltip content="ShuffleMapStage: чтение orders, фильтрация amount > 100. Результат записывается в shuffle files для Stage 2.">
              <FlowNode
                variant="connector"
                onClick={() => handleStageClick(0)}
                tabIndex={0}
              >
                Stage 0
                <br />
                <span className="text-xs opacity-75">Scan orders + Filter</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" label="shuffle" />
          </div>

          {/* Stage 1 */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <DiagramTooltip content="ShuffleMapStage: чтение таблицы customers. Выполняется параллельно со Stage 0 -- независимые источники данных.">
              <FlowNode
                variant="database"
                onClick={() => handleStageClick(1)}
                tabIndex={0}
              >
                Stage 1
                <br />
                <span className="text-xs opacity-75">Scan customers</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" label="shuffle" />
          </div>
        </div>

        {/* Stage 2: Join */}
        <div className="flex flex-col items-center gap-2">
          <DiagramTooltip content="ResultStage: shuffle read из обеих стадий, SortMergeJoin по ключу customer_id = id. Результат отправляется driver.">
            <FlowNode
              variant="cluster"
              onClick={() => handleStageClick(2)}
              tabIndex={0}
            >
              Stage 2
              <br />
              <span className="text-xs opacity-75">SortMergeJoin + Result</span>
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Stage detail panel */}
        {activeStage !== null && (
          <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-2">
              {stages[activeStage].name}
            </h4>
            <p className="text-xs text-gray-300 mb-3">
              {stages[activeStage].description}
            </p>

            <div className="flex flex-wrap gap-3 mb-3">
              <DataBox
                label="Tasks"
                value={String(stages[activeStage].tasks)}
              />
              <DataBox
                label="Type"
                value={activeStage === 2 ? 'ResultStage' : 'ShuffleMapStage'}
                variant="highlight"
              />
            </div>

            <div className="text-xs text-gray-400">
              <p className="font-semibold mb-1">Operations:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {stages[activeStage].operations.map((op, i) => (
                  <li key={i} className="font-mono text-gray-300">{op}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
          <span>Stages 0 и 1 выполняются <strong className="text-white">параллельно</strong></span>
          <span>Stage 2 ждёт завершения обеих</span>
          <span>Нажмите на stage для деталей</span>
        </div>
      </div>
    </DiagramContainer>
  );
}
