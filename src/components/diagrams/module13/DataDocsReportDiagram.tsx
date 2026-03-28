/**
 * DataDocsReportDiagram
 *
 * Great Expectations Data Docs report with pass/fail expectations.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowColumn } from '@primitives/FlowColumn';

interface Expectation {
  name: string;
  passed: boolean;
  percent: string;
}

const expectations: Expectation[] = [
  { name: 'order_id not null', passed: true, percent: '100%' },
  { name: 'customer_id not null', passed: false, percent: '80%' },
  { name: 'amount between 0.01-999K', passed: false, percent: '80%' },
  { name: 'status in valid set', passed: false, percent: '80%' },
  { name: 'email matches regex', passed: false, percent: '60%' },
  { name: 'order_id unique', passed: true, percent: '100%' },
];

export function DataDocsReportDiagram() {
  return (
    <DiagramContainer title="Data Docs Report" color="rose">
      <div className="rounded-xl border border-rose-400/20 bg-rose-500/5 p-4">
        <div className="text-sm font-medium text-rose-300 mb-1">
          Expectation Suite: orders_quality
        </div>
        <div className="text-xs text-red-400 mb-3">
          Status: FAILED (4 of 6 expectations failed)
        </div>

        <FlowColumn gap={3} align="stretch">
          {expectations.map((exp, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className={exp.passed ? 'text-emerald-400' : 'text-red-400'}>
                  {exp.passed ? '✓' : '✗'}
                </span>
                <span className="text-gray-300">{exp.name}</span>
              </div>
              <span className={`font-mono ${exp.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {exp.percent} pass
              </span>
            </div>
          ))}
        </FlowColumn>
      </div>
    </DiagramContainer>
  );
}
