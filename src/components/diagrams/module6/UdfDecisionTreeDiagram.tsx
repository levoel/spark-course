/**
 * UdfDecisionTreeDiagram
 *
 * Decision tree for choosing between built-in functions, combined built-ins,
 * Pandas UDF, Scala UDF, or Python UDF.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { FlowColumn } from '@primitives/FlowColumn';

interface TreeStep {
  id: string;
  question: string;
  yesTarget: string;
  noTarget: string;
  yesLabel: string;
  noLabel?: string;
}

const steps: TreeStep[] = [
  {
    id: 'start',
    question: 'Нужна трансформация данных?',
    yesTarget: 'builtin',
    noTarget: '',
    yesLabel: '',
  },
  {
    id: 'builtin',
    question: 'Есть встроенная функция?',
    yesTarget: 'use-builtin',
    noTarget: 'combo',
    yesLabel: 'Используйте её! ✓',
  },
  {
    id: 'combo',
    question: 'Можно выразить через when/otherwise + комбинацию встроенных?',
    yesTarget: 'use-combo',
    noTarget: 'python-lib',
    yesLabel: 'Комбинируйте! ✓',
  },
  {
    id: 'python-lib',
    question: 'Нужна Python-библиотека?',
    yesTarget: 'pandas-udf',
    noTarget: 'scala-udf',
    yesLabel: 'Pandas UDF (Arrow)',
    noLabel: 'Scala UDF (если есть expertise)',
  },
];

const outcomes: Record<string, { label: string; variant: 'compute' | 'service' | 'connector' | 'app' }> = {
  'use-builtin': { label: 'Встроенная функция ✓', variant: 'compute' },
  'use-combo': { label: 'Комбинация встроенных ✓', variant: 'compute' },
  'pandas-udf': { label: 'Pandas UDF (Arrow)', variant: 'service' },
  'scala-udf': { label: 'Scala UDF', variant: 'service' },
};

export function UdfDecisionTreeDiagram() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <DiagramContainer title="Дерево решений: какой подход выбрать" color="blue">
      <FlowColumn gap={4}>
        {/* Start question */}
        <FlowNode
          variant="app"
          size="md"
          onClick={() => setActiveStep(activeStep === 'start' ? null : 'start')}
          className="cursor-pointer"
        >
          Нужна трансформация данных?
        </FlowNode>

        <Arrow direction="down" />

        {/* Step 1: Built-in check */}
        <FlowNode variant="connector" size="md">
          Есть встроенная функция?
        </FlowNode>
        <div className="flex items-start gap-8 w-full justify-center flex-wrap">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-emerald-400 font-semibold">ДА</span>
            <FlowNode variant="compute" size="sm">
              Используйте её! ✓
            </FlowNode>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-rose-400 font-semibold">НЕТ</span>
            <Arrow direction="down" />
          </div>
        </div>

        {/* Step 2: Combo check */}
        <FlowNode variant="connector" size="md">
          Можно выразить через when/otherwise + комбинацию встроенных?
        </FlowNode>
        <div className="flex items-start gap-8 w-full justify-center flex-wrap">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-emerald-400 font-semibold">ДА</span>
            <FlowNode variant="compute" size="sm">
              Комбинируйте! ✓
            </FlowNode>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-rose-400 font-semibold">НЕТ</span>
            <Arrow direction="down" />
          </div>
        </div>

        {/* Step 3: Python lib check */}
        <FlowNode variant="connector" size="md">
          Нужна Python-библиотека?
        </FlowNode>
        <div className="flex items-start gap-8 w-full justify-center flex-wrap">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-blue-400 font-semibold">ДА</span>
            <FlowNode variant="service" size="sm">
              Pandas UDF (Arrow)
            </FlowNode>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-amber-400 font-semibold">НЕТ</span>
            <FlowNode variant="service" size="sm">
              Scala UDF
            </FlowNode>
          </div>
        </div>

        <Arrow direction="down" />

        {/* Final fallback */}
        <FlowNode variant="app" size="sm">
          Python UDF — ПОСЛЕДНИЙ ВАРИАНТ
        </FlowNode>
      </FlowColumn>
    </DiagramContainer>
  );
}
