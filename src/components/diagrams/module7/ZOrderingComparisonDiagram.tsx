/**
 * ZOrderingComparisonDiagram
 *
 * Side-by-side showing data layout without Z-ordering (sorted by date only)
 * vs with Z-ordering (date + city) and how each affects data skipping.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowColumn } from '@primitives/FlowColumn';

interface FileEntry {
  label: string;
  highlighted?: boolean;
}

interface Side {
  title: string;
  files: FileEntry[];
  query: string;
  result: string;
  color: string;
}

const sides: Side[] = [
  {
    title: 'Без Z-ordering (сортировка по date)',
    files: [
      { label: 'File 1: all cities, Jan' },
      { label: 'File 2: all cities, Feb', highlighted: true },
      { label: 'File 3: all cities, Mar' },
      { label: 'File 4: all cities, Apr' },
    ],
    query: "city='Moscow' AND date='Feb'",
    result: 'Читает: File 2 (50% данных)',
    color: 'rose',
  },
  {
    title: 'С Z-ordering (date + city)',
    files: [
      { label: 'File 1: Moscow, Jan-Feb', highlighted: true },
      { label: 'File 2: SPb, Jan-Feb' },
      { label: 'File 3: Moscow, Mar-Apr' },
      { label: 'File 4: SPb, Mar-Apr' },
    ],
    query: "city='Moscow' AND date='Feb'",
    result: 'Читает: File 1 (25% данных)',
    color: 'emerald',
  },
];

export function ZOrderingComparisonDiagram() {
  return (
    <DiagramContainer title="Без Z-ordering vs С Z-ordering" color="blue">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sides.map((side, si) => (
          <div key={si} className="flex flex-col gap-3">
            <div className={`text-center text-sm font-semibold text-${side.color}-300`}>
              {side.title}
            </div>
            <FlowColumn gap={2} align="start" className="w-full">
              {side.files.map((f, fi) => (
                <div
                  key={fi}
                  className={`
                    w-full px-3 py-2 rounded-lg text-xs font-mono border
                    ${f.highlighted
                      ? `bg-${side.color}-500/20 border-${side.color}-400/40 text-${side.color}-200`
                      : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                    }
                  `}
                >
                  {f.label}
                </div>
              ))}
            </FlowColumn>
            <div className="space-y-1 text-center">
              <div className="text-[11px] font-mono text-gray-400">
                Запрос: {side.query}
              </div>
              <div className={`text-xs font-semibold text-${side.color}-300`}>
                {side.result}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DiagramContainer>
  );
}
