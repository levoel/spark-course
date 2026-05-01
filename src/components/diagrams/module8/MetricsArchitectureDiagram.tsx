/**
 * MetricsArchitectureDiagram
 *
 * Sources → Sinks architecture of Spark's metrics system. Shows JvmSource,
 * ExecutorSource etc. feeding into PrometheusServlet, ConsoleSink, JmxSink etc.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';
import { Arrow } from '@primitives/Arrow';
import { FlowRow } from '@primitives/FlowRow';

const sources = [
  'JvmSource',
  'ExecutorSource',
  'DAGSchedulerSource',
  'BlockManagerSource',
  'ShuffleMetrics',
  'CodeGeneratorSource',
];

const sinks = [
  'PrometheusServlet (HTTP)',
  'ConsoleSink (stdout)',
  'JmxSink (JMX MBeans)',
  'Slf4jSink (logging)',
  'GraphiteSink',
  'StatsdSink',
];

export function MetricsArchitectureDiagram() {
  return (
    <DiagramContainer title="Spark Metrics: Sources + Sinks" color="blue">
      <FlowRow gap={16} wrap={false} justify="center" align="start">
        {/* Sources */}
        <FlowColumn gap={4} align="start">
          <div className="text-xs font-semibold text-blue-700 mb-1">
            Sources (генерируют метрики)
          </div>
          {sources.map((s, i) => (
            <FlowNode key={i} variant="compute" size="sm">
              {s}
            </FlowNode>
          ))}
        </FlowColumn>

        {/* Arrows */}
        <div className="flex items-center self-center">
          <Arrow direction="right" label="export" />
        </div>

        {/* Sinks */}
        <FlowColumn gap={4} align="start">
          <div className="text-xs font-semibold text-amber-700 mb-1">
            Sinks (экспонируют метрики)
          </div>
          {sinks.map((s, i) => (
            <FlowNode key={i} variant="service" size="sm">
              {s}
            </FlowNode>
          ))}
        </FlowColumn>
      </FlowRow>
    </DiagramContainer>
  );
}
