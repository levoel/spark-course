/** @jsxImportSource solid-js */
import { createMemo, createSignal } from 'solid-js';
/**
 * StreamingWatermarksDiagram (DIAG-13)
 *
 * Interactive visualization of streaming watermarks showing event time
 * vs processing time, with adjustable watermark delay slider (0-60s).
 * Events transition between accepted (green) and dropped (red) states
 * as the watermark delay changes.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';

interface StreamEvent {
  id: number;
  eventTime: number;   // seconds offset from 10:00:00
  processTime: number; // seconds offset from 10:00:00
  label: string;       // human-readable event time
}

/** Sample events: some arrive on time, some are late */
const EVENTS: StreamEvent[] = [
  { id: 1,  eventTime: 0,   processTime: 2,   label: '10:00:00' },
  { id: 2,  eventTime: 10,  processTime: 12,  label: '10:00:10' },
  { id: 3,  eventTime: 20,  processTime: 22,  label: '10:00:20' },
  { id: 4,  eventTime: 15,  processTime: 35,  label: '10:00:15' },
  { id: 5,  eventTime: 30,  processTime: 33,  label: '10:00:30' },
  { id: 6,  eventTime: 25,  processTime: 50,  label: '10:00:25' },
  { id: 7,  eventTime: 45,  processTime: 48,  label: '10:00:45' },
  { id: 8,  eventTime: 40,  processTime: 65,  label: '10:00:40' },
  { id: 9,  eventTime: 55,  processTime: 58,  label: '10:00:55' },
  { id: 10, eventTime: 50,  processTime: 80,  label: '10:00:50' },
  { id: 11, eventTime: 70,  processTime: 73,  label: '10:01:10' },
  { id: 12, eventTime: 60,  processTime: 90,  label: '10:01:00' },
  { id: 13, eventTime: 80,  processTime: 82,  label: '10:01:20' },
  { id: 14, eventTime: 35,  processTime: 95,  label: '10:00:35' },
];

function formatDelay(seconds: number): string {
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatLateness(eventTime: number, processTime: number): string {
  const diff = processTime - eventTime;
  if (diff <= 2) return 'on time';
  return `${diff}s late`;
}

export function StreamingWatermarksDiagram() {
  const [watermarkDelay, setWatermarkDelay] = createSignal(10);

  const derived = createMemo(() => {
    // Sort events by processing time to simulate arrival order
    const sorted = [...EVENTS].sort((a, b) => a.processTime - b.processTime);

    let maxET = 0;
    const states: { event: StreamEvent; accepted: boolean; watermarkAtArrival: number }[] = [];

    for (const event of sorted) {
      // Update max event time seen so far
      maxET = Math.max(maxET, event.eventTime);
      const currentWatermark = maxET - watermarkDelay();

      // Event is accepted if its event_time >= current watermark
      const isAccepted = event.eventTime >= currentWatermark;

      states.push({
        event,
        accepted: isAccepted,
        watermarkAtArrival: currentWatermark,
      });
    }

    const acceptedCount = states.filter((s) => s.accepted).length;
    const droppedCount = states.filter((s) => !s.accepted).length;

    return {
      eventStates: states.sort((a, b) => a.event.eventTime - b.event.eventTime),
      accepted: acceptedCount,
      dropped: droppedCount,
      maxEventTime: maxET,
      watermarkLine: maxET - watermarkDelay(),
    };
  });

  const maxTime = 100; // max x-axis range in seconds

  return (
    <DiagramContainer title="Streaming Watermarks: обработка опоздавших данных" color="cyan">
      <div class="flex flex-col gap-5">
        {/* Watermark delay slider */}
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="text-sm text-[var(--ink-default)]">
              Watermark delay
            </label>
            <span class="text-sm font-mono text-[var(--ink-strong)] font-semibold">
              {formatDelay(watermarkDelay())}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={watermarkDelay()}
            onChange={(e) => setWatermarkDelay(Number(e.target.value))}
            class="w-full accent-cyan-400 cursor-pointer"
          />
          <div class="flex justify-between text-[10px] text-[var(--ink-subtle)]">
            <span>0s (drop all late)</span>
            <span>30s</span>
            <span>60s (accept all)</span>
          </div>
        </div>

        {/* Timeline visualization */}
        <div class="flex flex-col gap-2">
          <p class="text-xs text-[var(--ink-muted)]">
            Event time timeline (x-axis) -- зелёные = принятые, красные = отброшенные:
          </p>

          <div class="relative bg-[var(--bg-sunken)] rounded-lg border border-[var(--line-thin)] p-4 overflow-hidden">
            {/* X-axis time markers */}
            <div class="flex justify-between text-[9px] text-[var(--ink-subtle)] mb-2 px-1">
              <span>10:00</span>
              <span>10:00:20</span>
              <span>10:00:40</span>
              <span>10:01:00</span>
              <span>10:01:20</span>
            </div>

            {/* Event dots */}
            <div class="relative h-16">
              {derived().eventStates.map(({ event, accepted: isAccepted }) => {
                const leftPercent = (event.eventTime / maxTime) * 100;
                const lateness = event.processTime - event.eventTime;

                return (
                  <DiagramTooltip

                    content={`Event #${event.id}: event_time=${event.label}, lateness=${lateness}s, ${isAccepted ? 'ACCEPTED' : 'DROPPED'}`}
                  >
                    <div
                      class={`absolute w-5 h-5 rounded-full border-2 cursor-help transition-all duration-500 flex items-center justify-center ${
                        isAccepted
                          ? 'bg-emerald-500/40 border-emerald-400/70'
                          : 'bg-red-500/40 border-red-400/70'
                      }`}
                      style={{
                        left: `${Math.min(leftPercent, 96)}%`,
                        top: `${(lateness / 100) * 80}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <span class="text-[8px] font-mono text-[var(--ink-strong)]">
                        {event.id}
                      </span>
                    </div>
                  </DiagramTooltip>
                );
              })}

              {/* Watermark line */}
              {derived().watermarkLine >= 0 && derived().watermarkLine <= maxTime && (
                <div
                  class="absolute top-0 bottom-0 w-0.5 bg-cyan-400/60 transition-all duration-500"
                  style={{ left: `${(derived().watermarkLine / maxTime) * 100}%` }}
                >
                  <div class="absolute -top-5 left-1 text-[9px] text-cyan-400 whitespace-nowrap font-mono">
                    WM
                  </div>
                </div>
              )}
            </div>

            {/* Y-axis label */}
            <div class="text-[9px] text-[var(--ink-subtle)] mt-1">
              y-axis: lateness (processing_time - event_time)
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div class="flex flex-wrap gap-3 justify-center">
          <DataBox
            label="Accepted"
            value={`${derived().accepted}/${EVENTS.length}`}
            variant={derived().accepted === EVENTS.length ? 'highlight' : undefined}
          />
          <DataBox
            label="Dropped"
            value={`${derived().dropped}/${EVENTS.length}`}
            variant={derived().dropped > 0 ? 'highlight' : undefined}
          />
          <DataBox
            label="Watermark"
            value={derived().watermarkLine >= 0 ? `${derived().watermarkLine}s` : 'N/A'}
          />
          <DataBox
            label="Max event time"
            value={`${derived().maxEventTime}s`}
          />
        </div>

        {/* Watermark formula */}
        <div class="bg-[var(--bg-sunken)] rounded-lg p-3 border border-[var(--line-thin)]">
          <p class="text-xs text-[var(--ink-muted)] text-center font-mono">
            watermark = max(event_time) - delay = {derived().maxEventTime}s - {watermarkDelay()}s ={' '}
            <span class="text-cyan-400 font-semibold">{derived().watermarkLine}s</span>
          </p>
          <p class="text-[10px] text-[var(--ink-subtle)] text-center mt-1">
            События с event_time {'<'} {derived().watermarkLine}s отбрасываются как опоздавшие
          </p>
        </div>

        {/* Legend */}
        <div class="flex items-center justify-center gap-4 text-xs text-[var(--ink-muted)]">
          <span class="flex items-center gap-1.5">
            <span class="inline-block w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-400/70" />
            Accepted
          </span>
          <span class="flex items-center gap-1.5">
            <span class="inline-block w-3 h-3 rounded-full bg-red-500/40 border border-red-400/70" />
            Dropped
          </span>
          <span class="flex items-center gap-1.5">
            <span class="inline-block w-1 h-3 bg-cyan-400/60" />
            Watermark line
          </span>
        </div>
      </div>
    </DiagramContainer>
  );
}
