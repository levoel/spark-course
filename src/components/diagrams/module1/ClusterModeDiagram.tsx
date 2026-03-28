/**
 * ClusterModeDiagram
 *
 * Spark Cluster Mode deploy architecture: Driver runs inside the cluster
 * alongside Executors.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';

export function ClusterModeDiagram() {
  return (
    <DiagramContainer title="Cluster Mode" color="green">
      <FlowColumn gap={4}>
        <p className="text-xs text-gray-400 font-semibold text-center">
          Кластер
        </p>
        <div className="flex flex-col gap-1.5">
          <FlowNode variant="app" size="md">
            Driver
            <br />
            <span className="text-xs opacity-75">(на кластере)</span>
          </FlowNode>
          <FlowNode variant="compute" size="sm">Executor 1</FlowNode>
          <FlowNode variant="compute" size="sm">Executor 2</FlowNode>
          <FlowNode variant="compute" size="sm">Executor 3</FlowNode>
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
}
