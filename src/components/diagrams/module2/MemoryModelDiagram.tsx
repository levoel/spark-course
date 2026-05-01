/**
 * MemoryModelDiagram (DIAG-03)
 *
 * Interactive executor memory layout with sliders for
 * spark.memory.fraction and spark.memory.storageFraction.
 * Shows danger zone highlighting when memory configuration
 * creates pathological conditions.
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { Grid } from '@primitives/Grid';

export function MemoryModelDiagram() {
  const [memoryFraction, setMemoryFraction] = useState(60); // 0.6 * 100
  const [storageFraction, setStorageFraction] = useState(50); // 0.5 * 100
  const executorMemoryMB = 4096; // 4GB example

  const regions = useMemo(() => {
    const reserved = 300; // Spark reserves 300MB (hardcoded)
    const managedMemory =
      (executorMemoryMB - reserved) * (memoryFraction / 100);
    const userMemory = executorMemoryMB - managedMemory - reserved;
    const storageMemory = managedMemory * (storageFraction / 100);
    const executionMemory = managedMemory - storageMemory;
    return {
      reserved,
      managedMemory,
      userMemory,
      storageMemory,
      executionMemory,
    };
  }, [memoryFraction, storageFraction]);

  const isDangerZone =
    regions.executionMemory < 200 || regions.userMemory < 100;

  return (
    <DiagramContainer
      title="Executor Memory Model (Unified Memory Manager)"
      color={isDangerZone ? 'rose' : 'blue'}
    >
      <div className="flex flex-col gap-4">
        <InteractiveValue
          value={memoryFraction}
          onChange={setMemoryFraction}
          min={10}
          max={90}
          step={5}
          label="spark.memory.fraction"
        />
        <InteractiveValue
          value={storageFraction}
          onChange={setStorageFraction}
          min={10}
          max={90}
          step={5}
          label="spark.memory.storageFraction"
        />

        {/* Total executor memory indicator */}
        <DataBox
          label="Executor Memory (spark.executor.memory)"
          value={`${executorMemoryMB} MB (${(executorMemoryMB / 1024).toFixed(0)} GB)`}
        />

        {/* Memory region visualization */}
        <Grid columns={3}>
          <DiagramTooltip content="Storage Memory: кэшированные RDD, broadcast-переменные. Может заимствовать execution memory, если та свободна.">
            <DataBox
              label="Storage"
              value={`${Math.round(regions.storageMemory)} MB`}
              variant="highlight"
            />
          </DiagramTooltip>
          <DiagramTooltip content="Execution Memory: shuffle buffers, join buffers, sort buffers. Может вытеснять storage, но не наоборот.">
            <DataBox
              label="Execution"
              value={`${Math.round(regions.executionMemory)} MB`}
              variant="highlight"
            />
          </DiagramTooltip>
          <DiagramTooltip content="User Memory: UDF-объекты, RDD internal metadata. Не управляется Spark.">
            <DataBox
              label="User Memory"
              value={`${Math.round(regions.userMemory)} MB`}
            />
          </DiagramTooltip>
        </Grid>

        {/* Reserved memory */}
        <DiagramTooltip content="Reserved Memory: зарезервировано Spark для внутренних нужд. Значение захардкожено (300 MB) и не может быть изменено.">
          <DataBox
            label="Reserved"
            value={`${regions.reserved} MB (hardcoded)`}
          />
        </DiagramTooltip>

        {/* Danger zone / spill warning */}
        {isDangerZone && (
          <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
            <strong>Danger Zone!</strong>{' '}
            {regions.executionMemory < 200 && (
              <span>
                Execution memory ({Math.round(regions.executionMemory)} MB)
                критически мала — shuffle и join операции будут активно
                spill-to-disk.{' '}
              </span>
            )}
            {regions.userMemory < 100 && (
              <span>
                User memory ({Math.round(regions.userMemory)} MB) критически
                мала — UDF и пользовательские объекты могут вызвать OOM.
              </span>
            )}
          </div>
        )}

        {regions.executionMemory < 150 && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-3 text-sm text-red-700">
            <strong>Spill-to-disk warning:</strong> При execution memory ниже
            150 MB практически все shuffle и join операции будут записываться на
            диск, замедляя выполнение в 10-100x.
          </div>
        )}
      </div>
    </DiagramContainer>
  );
}
