/**
 * ArrowColumnarDiagram (DIAG-14)
 *
 * Interactive visualization comparing row-oriented vs columnar (Arrow) memory layout.
 * Features column pruning toggle and zero-copy transfer animation.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';

interface EmployeeRecord {
  id: number;
  name: string;
  age: number;
  salary: number;
}

const EMPLOYEES: EmployeeRecord[] = [
  { id: 1, name: 'Анна', age: 28, salary: 95000 },
  { id: 2, name: 'Борис', age: 34, salary: 78000 },
  { id: 3, name: 'Вера', age: 41, salary: 112000 },
  { id: 4, name: 'Григорий', age: 25, salary: 67000 },
  { id: 5, name: 'Дарья', age: 38, salary: 103000 },
  { id: 6, name: 'Евгений', age: 29, salary: 88000 },
];

interface ColumnMeta {
  key: keyof EmployeeRecord;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  bytesPerValue: number;
}

const COLUMNS: ColumnMeta[] = [
  {
    key: 'id',
    label: 'id (int)',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-400/40',
    bytesPerValue: 4,
  },
  {
    key: 'name',
    label: 'name (string)',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-400/40',
    bytesPerValue: 12,
  },
  {
    key: 'age',
    label: 'age (int)',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-400/40',
    bytesPerValue: 4,
  },
  {
    key: 'salary',
    label: 'salary (double)',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-400/40',
    bytesPerValue: 8,
  },
];

const PRUNED_KEYS = new Set<keyof EmployeeRecord>(['age', 'salary']);

function calcBytes(columns: ColumnMeta[], rows: number, pruned: boolean): number {
  const cols = pruned ? columns.filter((c) => PRUNED_KEYS.has(c.key)) : columns;
  return cols.reduce((sum, c) => sum + c.bytesPerValue * rows, 0);
}

export function ArrowColumnarDiagram() {
  const [pruningEnabled, setPruningEnabled] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const rowCount = EMPLOYEES.length;
  const rowBytes = COLUMNS.reduce((s, c) => s + c.bytesPerValue, 0) * rowCount;
  const colBytes = calcBytes(COLUMNS, rowCount, pruningEnabled);

  return (
    <DiagramContainer title="Row vs Columnar: Apache Arrow Memory Layout" color="blue">
      <div className="flex flex-col gap-4">
        {/* Toggles */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setPruningEnabled(!pruningEnabled)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pruningEnabled
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            Column Pruning {pruningEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowTransfer(!showTransfer)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              showTransfer
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            Zero-Copy Transfer {showTransfer ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Side-by-side layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Row-oriented panel */}
          <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 text-center">
              Row-Oriented Storage
            </h4>
            <div className="space-y-1.5">
              {EMPLOYEES.map((emp, ri) => (
                <DiagramTooltip
                  key={ri}
                  content={`Строка ${ri}: все 4 колонки хранятся вместе. При SELECT age, salary читается вся строка (${COLUMNS.reduce((s, c) => s + c.bytesPerValue, 0)} байт).`}
                >
                  <div className="flex gap-0.5">
                    {COLUMNS.map((col) => {
                      const isNeeded = PRUNED_KEYS.has(col.key);
                      const dimmed = pruningEnabled && !isNeeded;
                      return (
                        <div
                          key={col.key}
                          className={`flex-1 px-1 py-1 rounded text-xs font-mono text-center transition-all duration-300 border ${
                            dimmed
                              ? 'bg-slate-700/30 border-slate-600/20 text-gray-500'
                              : `${col.bgColor} ${col.borderColor} ${col.color}`
                          }`}
                        >
                          {dimmed ? (
                            <span className="text-gray-600 text-[10px]">--</span>
                          ) : (
                            String(emp[col.key])
                          )}
                        </div>
                      );
                    })}
                  </div>
                </DiagramTooltip>
              ))}
            </div>
            {pruningEnabled && (
              <p className="text-[10px] text-gray-500 text-center mt-2">
                Все данные читаются, ненужные колонки отбрасываются после чтения
              </p>
            )}
          </div>

          {/* Columnar panel */}
          <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 text-center">
              Columnar Storage (Arrow)
            </h4>
            <div className="space-y-1.5">
              {COLUMNS.map((col) => {
                const isNeeded = PRUNED_KEYS.has(col.key);
                const skipped = pruningEnabled && !isNeeded;
                return (
                  <DiagramTooltip
                    key={col.key}
                    content={
                      skipped
                        ? `Колонка ${col.label} пропущена (column pruning). 0 байт прочитано.`
                        : `Колонка ${col.label}: ${col.bytesPerValue * rowCount} байт в contiguous buffer. Все ${rowCount} значений лежат рядом в памяти.`
                    }
                  >
                    <div
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 border transition-all duration-300 ${
                        skipped
                          ? 'bg-slate-700/20 border-slate-600/20'
                          : `${col.bgColor} ${col.borderColor}`
                      }`}
                    >
                      <span
                        className={`text-xs font-medium w-24 shrink-0 ${
                          skipped ? 'text-gray-600 line-through' : col.color
                        }`}
                      >
                        {col.label}
                      </span>
                      {skipped ? (
                        <span className="text-xs text-gray-600 italic">Skipped</span>
                      ) : (
                        <div className="flex gap-0.5 flex-1 overflow-hidden">
                          {EMPLOYEES.map((emp, i) => (
                            <span
                              key={i}
                              className={`text-[10px] font-mono px-1 rounded ${col.bgColor} ${col.color}`}
                            >
                              {String(emp[col.key])}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </DiagramTooltip>
                );
              })}
            </div>
            {pruningEnabled && (
              <p className="text-[10px] text-emerald-400/70 text-center mt-2">
                Читаются только нужные буферы: age + salary
              </p>
            )}
          </div>
        </div>

        {/* Zero-copy transfer animation */}
        {showTransfer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Row-oriented transfer */}
            <div className="rounded-xl border border-red-400/20 bg-red-950/20 p-3">
              <h4 className="text-xs font-semibold text-red-300 mb-2 text-center">
                Row Transfer (Serialize-Copy-Deserialize)
              </h4>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-[10px] text-gray-400 w-16 text-right shrink-0">
                    Process A
                  </span>
                  <div className="flex-1 bg-slate-700/40 rounded px-2 py-1">
                    <span className="text-[10px] text-gray-300">Row data (RAM)</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-red-400 animate-pulse">1. Serialize (~2.5s)</span>
                  <span className="text-red-400">&#8595;</span>
                  <span className="text-[10px] text-red-400 animate-pulse">2. Copy (~0.5s)</span>
                  <span className="text-red-400">&#8595;</span>
                  <span className="text-[10px] text-red-400 animate-pulse">
                    3. Deserialize (~2.5s)
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className="text-[10px] text-gray-400 w-16 text-right shrink-0">
                    Process B
                  </span>
                  <div className="flex-1 bg-slate-700/40 rounded px-2 py-1">
                    <span className="text-[10px] text-gray-300">Row data (copy)</span>
                  </div>
                </div>
                <DataBox label="Время" value="~5.5 сек / 1 GB" variant="highlight" />
              </div>
            </div>

            {/* Columnar zero-copy transfer */}
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-950/20 p-3">
              <h4 className="text-xs font-semibold text-emerald-300 mb-2 text-center">
                Arrow Zero-Copy (Shared Memory)
              </h4>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-[10px] text-gray-400 w-16 text-right shrink-0">
                    Process A
                  </span>
                  <div className="flex-1 bg-emerald-800/20 rounded px-2 py-1 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-300">Pointer &rarr;</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-emerald-400 text-lg">&#8595;</span>
                </div>
                <div className="flex items-center gap-2 w-full justify-center">
                  <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-lg px-3 py-2">
                    <span className="text-xs text-emerald-300 font-medium">
                      Arrow Buffer (shared memory)
                    </span>
                    <br />
                    <span className="text-[10px] text-emerald-400/70">
                      One copy, both processes read
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-emerald-400 text-lg">&#8593;</span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className="text-[10px] text-gray-400 w-16 text-right shrink-0">
                    Process B
                  </span>
                  <div className="flex-1 bg-emerald-800/20 rounded px-2 py-1 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-300">&larr; Pointer</span>
                  </div>
                </div>
                <DataBox label="Время" value="~0 сек (pointer)" variant="highlight" />
              </div>
            </div>
          </div>
        )}

        {/* Stats panel */}
        <div className="flex flex-wrap gap-3 justify-center mt-1">
          <DataBox
            label="Row: байт прочитано"
            value={`${rowBytes} байт`}
            variant={pruningEnabled ? 'highlight' : undefined}
          />
          <DataBox
            label="Columnar: байт прочитано"
            value={`${colBytes} байт`}
            variant={pruningEnabled ? 'highlight' : undefined}
          />
          {pruningEnabled && (
            <DataBox
              label="Экономия"
              value={`${Math.round((1 - colBytes / rowBytes) * 100)}%`}
              variant="highlight"
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center text-[10px] text-gray-400">
          {COLUMNS.map((col) => (
            <span key={col.key} className="flex items-center gap-1">
              <span className={`inline-block w-2.5 h-2.5 rounded ${col.bgColor} border ${col.borderColor}`} />
              <span className={col.color}>{col.label}</span>
            </span>
          ))}
        </div>
      </div>
    </DiagramContainer>
  );
}
