/**
 * CatalystPipelineDiagram (DIAG-02)
 *
 * Step-by-step animated pipeline showing Catalyst optimizer stages
 * for a real SQL query. Clickable stages reveal plan text details.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DataBox } from '@primitives/DataBox';
import { FlowColumn } from '@primitives/FlowColumn';

interface PipelineStage {
  id: number;
  title: string;
  tooltip: string;
  planText: string;
  variant: 'app' | 'connector' | 'service' | 'compute' | 'pipeline';
}

const REFERENCE_SQL = `SELECT name, dept_name
FROM employees e
JOIN departments d
  ON e.dept_id = d.dept_id
WHERE e.age > 30`;

const stages: PipelineStage[] = [
  {
    id: 0,
    title: 'SQL / DataFrame API',
    tooltip:
      'Точка входа: пользователь пишет SQL-запрос или строит цепочку DataFrame-трансформаций. Оба пути проходят через одинаковый Catalyst pipeline.',
    planText: REFERENCE_SQL,
    variant: 'app',
  },
  {
    id: 1,
    title: 'Unresolved Logical Plan',
    tooltip:
      'Parser создаёт дерево с нерезолвенными ссылками. Spark ещё не знает, существуют ли таблицы и колонки — только структура запроса.',
    planText: `'Project ['name, 'dept_name]
+- 'Filter ('e.age > 30)
   +- 'Join Inner, ('e.dept_id = 'd.dept_id)
      :- 'SubqueryAlias e
      :  +- 'UnresolvedRelation [employees]
      +- 'SubqueryAlias d
         +- 'UnresolvedRelation [departments]`,
    variant: 'connector',
  },
  {
    id: 2,
    title: 'Analyzed Logical Plan',
    tooltip:
      'Analyzer обращается к Catalog и разрешает все ссылки: таблицы → схемы, колонки → типы. UnresolvedRelation становится LogicalRelation.',
    planText: `Project [name#5: string, dept_name#12: string]
+- Filter (age#6: int > 30)
   +- Join Inner, (dept_id#7 = dept_id#11)
      :- SubqueryAlias e
      :  +- Relation [id#4, name#5, age#6, dept_id#7]
      +- SubqueryAlias d
         +- Relation [dept_id#11, dept_name#12]`,
    variant: 'service',
  },
  {
    id: 3,
    title: 'Optimized Logical Plan',
    tooltip:
      'Optimizer применяет правила: PushDownPredicate сдвигает фильтр под join, ColumnPruning убирает ненужные колонки. Результат семантически идентичен, но быстрее.',
    planText: `Project [name#5, dept_name#12]
+- Join Inner, (dept_id#7 = dept_id#11)
   :- Project [name#5, dept_id#7]       ← ColumnPruning
   :  +- Filter (age#6 > 30)            ← PushDownPredicate
   :     +- Relation [name#5, age#6, dept_id#7]
   +- Filter isnotnull(dept_id#11)
      +- Relation [dept_id#11, dept_name#12]`,
    variant: 'compute',
  },
  {
    id: 4,
    title: 'Physical Plan',
    tooltip:
      'SparkPlanner выбирает конкретные стратегии: BroadcastHashJoinExec для маленьких таблиц, SortMergeJoinExec для больших. Генерирует исполняемый код через Whole-Stage CodeGen.',
    planText: `*Project [name#5, dept_name#12]
+- *BroadcastHashJoin [dept_id#7], [dept_id#11]
   :- *Filter (age#6 > 30)
   :  +- *LocalTableScan [name#5, age#6, dept_id#7]
   +- BroadcastExchange
      +- *LocalTableScan [dept_id#11, dept_name#12]

* = Whole-Stage CodeGen (операторы объединены)`,
    variant: 'pipeline',
  },
];

export function CatalystPipelineDiagram() {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  return (
    <DiagramContainer title="Catalyst Optimizer Pipeline" color="blue">
      <div className="flex flex-col gap-2">
        <FlowColumn gap={4}>
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex flex-col items-center">
              <DiagramTooltip content={stage.tooltip}>
                <FlowNode
                  variant={stage.variant}
                  onClick={() =>
                    setActiveStage(activeStage === stage.id ? null : stage.id)
                  }
                  tabIndex={0}
                  className={
                    activeStage === stage.id
                      ? 'ring-2 ring-blue-400/50 ring-offset-2 ring-offset-transparent'
                      : ''
                  }
                >
                  {stage.title}
                </FlowNode>
              </DiagramTooltip>
              {index < stages.length - 1 && <Arrow direction="down" />}
            </div>
          ))}
        </FlowColumn>

        {activeStage !== null && (
          <div className="mt-4">
            <DataBox
              label={stages[activeStage].title}
              value={stages[activeStage].planText}
              variant="highlight"
            />
          </div>
        )}
      </div>
    </DiagramContainer>
  );
}
