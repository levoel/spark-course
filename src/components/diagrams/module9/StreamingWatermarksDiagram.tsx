/**
 * StreamingWatermarksDiagram (DIAG-13)
 *
 * Interactive visualization of streaming watermarks showing event time
 * vs processing time, with adjustable watermark delay slider (0-60s).
 * Events transition between accepted (green) and dropped (red) states
 * as the watermark delay changes.
 */

import { useState, useMemo } from 'react';
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
  const [watermarkDelay, setWatermarkDelay] = useState(10);

  const { eventStates, accepted, dropped, maxEventTime, watermarkLine } = useMemo(() => {
    // Sort events by processing time to simulate arrival order
    const sorted = [...EVENTS].sort((a, b) => a.processTime - b.processTime);

    let maxET = 0;
    const states: { event: StreamEvent; accepted: boolean; watermarkAtArrival: number }[] = [];

    for (const event of sorted) {
      // Update max event time seen so far
      maxET = Math.max(maxET, event.eventTime);
      const currentWatermark = maxET - watermarkDelay;

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
      watermarkLine: maxET - watermarkDelay,
    };
  }, [watermarkDelay]);

  const maxTime = 100; // max x-axis range in seconds

  return (
    <DiagramContainer title="Streaming Watermarks: обработка опоздавших данных" color="cyan">
      <div className="flex flex-col gap-5">
        {/* Watermark delay slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">
              Watermark delay
            </label>
            <span className="text-sm font-mono text-white font-semibold">
              {formatDelay(watermarkDelay)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={watermarkDelay}
            onChange={(e) => setWatermarkDelay(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>0s (drop all late)</span>
            <span>30s</span>
            <span>60s (accept all)</span>
          </div>
        </div>

        {/* Timeline visualization */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400">
            Event time timeline (x-axis) -- зелёные = принятые, красные = отброшенные:
          </p>

          <div className="relative bg-slate-800/50 rounded-lg border border-white/10 p-4 overflow-hidden">
            {/* X-axis time markers */}
            <div className="flex justify-between text-[9px] text-gray-500 mb-2 px-1">
              <span>10:00</span>
              <span>10:00:20</span>
              <span>10:00:40</span>
              <span>10:01:00</span>
              <span>10:01:20</span>
            </div>

            {/* Event dots */}
            <div className="relative h-16">
              {eventStates.map(({ event, accepted: isAccepted }) => {
                const leftPercent = (event.eventTime / maxTime) * 100;
                const lateness = event.processTime - event.eventTime;

                return (
                  <DiagramTooltip
                    key={event.id}
                    content={`Event #${event.id}: event_time=${event.label}, lateness=${lateness}s, ${isAccepted ? 'ACCEPTED' : 'DROPPED'}`}
                  >
                    <div
                      className={`absolute w-5 h-5 rounded-full border-2 cursor-help transition-all duration-500 flex items-center justify-center ${
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
                      <span className="text-[8px] font-mono text-white">
                        {event.id}
                      </span>
                    </div>
                  </DiagramTooltip>
                );
              })}

              {/* Watermark line */}
              {watermarkLine >= 0 && watermarkLine <= maxTime && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-cyan-400/60 transition-all duration-500"
                  style={{ left: `${(watermarkLine / maxTime) * 100}%` }}
                >
                  <div className="absolute -top-5 left-1 text-[9px] text-cyan-400 whitespace-nowrap font-mono">
                    WM
                  </div>
                </div>
              )}
            </div>

            {/* Y-axis label */}
            <div className="text-[9px] text-gray-500 mt-1">
              y-axis: lateness (processing_time - event_time)
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="flex flex-wrap gap-3 justify-center">
          <DataBox
            label="Accepted"
            value={`${accepted}/${EVENTS.length}`}
            variant={accepted === EVENTS.length ? 'highlight' : undefined}
          />
          <DataBox
            label="Dropped"
            value={`${dropped}/${EVENTS.length}`}
            variant={dropped > 0 ? 'highlight' : undefined}
          />
          <DataBox
            label="Watermark"
            value={watermarkLine >= 0 ? `${watermarkLine}s` : 'N/A'}
          />
          <DataBox
            label="Max event time"
            value={`${maxEventTime}s`}
          />
        </div>

        {/* Watermark formula */}
        <div className="bg-slate-800/30 rounded-lg p-3 border border-white/5">
          <p className="text-xs text-gray-400 text-center font-mono">
            watermark = max(event_time) - delay = {maxEventTime}s - {watermarkDelay}s ={' '}
            <span className="text-cyan-400 font-semibold">{watermarkLine}s</span>
          </p>
          <p className="text-[10px] text-gray-500 text-center mt-1">
            События с event_time {'<'} {watermarkLine}s отбрасываются как опоздавшие
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-400/70" />
            Accepted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500/40 border border-red-400/70" />
            Dropped
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1 h-3 bg-cyan-400/60" />
            Watermark line
          </span>
        </div>
      </div>
    </DiagramContainer>
  );
}
