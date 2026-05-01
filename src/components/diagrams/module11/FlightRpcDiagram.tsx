/**
 * FlightRpcDiagram
 *
 * FlightClient ↔ FlightServer RPC methods:
 * GetFlightInfo, DoGet, DoPut, ListFlights.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowRow } from '@primitives/FlowRow';
import { FlowColumn } from '@primitives/FlowColumn';

interface RpcMethod {
  name: string;
  direction: 'request' | 'response' | 'stream-in' | 'stream-out';
  detail: string;
}

const methods: RpcMethod[] = [
  { name: 'GetFlightInfo(desc)', direction: 'request', detail: '«Какие данные доступны?»' },
  { name: '← FlightInfo', direction: 'response', detail: 'schema, endpoints, total_records' },
  { name: 'DoGet(ticket)', direction: 'request', detail: '«Отдай данные»' },
  { name: '◄═ RecordBatch stream', direction: 'stream-out', detail: 'columnar data' },
  { name: 'DoPut(stream)', direction: 'stream-in', detail: '«Прими данные»' },
  { name: '═► RecordBatch stream', direction: 'stream-in', detail: 'columnar data' },
  { name: 'ListFlights(criteria)', direction: 'request', detail: '«Что есть?»' },
  { name: '← FlightInfo list', direction: 'response', detail: 'list of datasets' },
];

const directionColor: Record<string, string> = {
  request: 'text-blue-700',
  response: 'text-emerald-700',
  'stream-in': 'text-amber-700',
  'stream-out': 'text-purple-700',
};

export function FlightRpcDiagram() {
  return (
    <DiagramContainer
      title="Flight: Client ↔ Server RPC"
      description="4 ключевых RPC-метода Arrow Flight"
      color="blue"
    >
      <FlowRow gap={24} wrap={false} align="start">
        {/* Client */}
        <FlowNode variant="app" size="md">
          FlightClient
        </FlowNode>

        {/* Methods */}
        <FlowColumn gap={3} align="start">
          {methods.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`text-xs font-mono ${directionColor[m.direction]}`}>
                {m.name}
              </span>
              <span className="text-[10px] text-[var(--ink-subtle)]">{m.detail}</span>
            </div>
          ))}
        </FlowColumn>

        {/* Server */}
        <FlowNode variant="service" size="md">
          FlightServer
        </FlowNode>
      </FlowRow>
    </DiagramContainer>
  );
}
