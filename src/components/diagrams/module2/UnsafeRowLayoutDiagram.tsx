/**
 * UnsafeRowLayoutDiagram
 *
 * Visualizes the binary layout of UnsafeRow: Null Bitmap, Fixed-Length Values,
 * Variable-Length Data sections with byte-level detail.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { FlowRow } from '@primitives/FlowRow';

interface Section {
  label: string;
  sublabel: string;
  color: string;
  tooltip: string;
  flex: number;
}

const sections: Section[] = [
  {
    label: 'Null Bitmap',
    sublabel: '(8 байт на 64 колонки)',
    color: 'bg-purple-500/25 border-purple-400/40 text-purple-700',
    tooltip:
      'Один бит на колонку. Для 3 колонок нужен 1 байт, но выравнивается до 8 байт (64-bit alignment).',
    flex: 1,
  },
  {
    label: 'Fixed-Length Values',
    sublabel: '(8 байт на колонку)',
    color: 'bg-blue-500/25 border-blue-400/40 text-blue-700',
    tooltip:
      'Примитивные типы (Int, Long, Double) хранятся inline по 8 байт. Для variable-length типов записывается пара (offset, length).',
    flex: 2,
  },
  {
    label: 'Variable-Length Data',
    sublabel: '(строки, массивы)',
    color: 'bg-emerald-500/25 border-emerald-400/40 text-emerald-700',
    tooltip:
      'Строки и массивы хранятся в конце UnsafeRow. Доступ через offset/length из fixed-length region.',
    flex: 2,
  },
];

export function UnsafeRowLayoutDiagram() {
  return (
    <DiagramContainer title="Структура UnsafeRow" color="purple">
      <FlowRow gap={0} wrap={false} className="w-full">
        {sections.map((s, i) => (
          <DiagramTooltip key={i} content={s.tooltip}>
            <div
              className={`
                border backdrop-blur-md p-3 text-center cursor-help
                ${s.color}
                ${i === 0 ? 'rounded-l-xl' : ''}
                ${i === sections.length - 1 ? 'rounded-r-xl' : ''}
              `}
              style={{ flex: s.flex, minWidth: 0 }}
            >
              <div className="text-sm font-semibold whitespace-nowrap truncate">
                {s.label}
              </div>
              <div className="text-[11px] opacity-70 whitespace-nowrap truncate">
                {s.sublabel}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </FlowRow>
    </DiagramContainer>
  );
}
