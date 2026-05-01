/**
 * GrafanaProvisioningDiagram
 *
 * Shows the directory structure of Grafana provisioning files:
 * datasources/prometheus.yml and dashboards/*.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowColumn } from '@primitives/FlowColumn';

interface TreeNode {
  name: string;
  comment?: string;
  indent: number;
  icon: 'dir' | 'file';
}

const tree: TreeNode[] = [
  { name: 'grafana/provisioning/', indent: 0, icon: 'dir' },
  { name: 'datasources/', indent: 1, icon: 'dir' },
  { name: 'prometheus.yml', indent: 2, icon: 'file', comment: 'Подключение к Prometheus' },
  { name: 'dashboards/', indent: 1, icon: 'dir' },
  { name: 'dashboards.yml', indent: 2, icon: 'file', comment: 'Dashboard provider config' },
  { name: 'spark-metrics.json', indent: 2, icon: 'file', comment: 'Сам dashboard (JSON export)' },
];

export function GrafanaProvisioningDiagram() {
  return (
    <DiagramContainer title="Grafana: Provisioning структура" color="purple">
      <FlowColumn gap={1} align="start" className="w-full">
        {tree.map((node, i) => {
          const isLast = i === tree.length - 1 ||
            (i < tree.length - 1 && tree[i + 1].indent <= node.indent);
          const prefix = node.indent === 0
            ? ''
            : '  '.repeat(node.indent - 1) + (isLast ? '└── ' : '├── ');

          return (
            <div key={i} className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[var(--ink-subtle)] whitespace-pre">{prefix}</span>
              <span className={node.icon === 'dir' ? 'text-blue-700' : 'text-[var(--ink-default)]'}>
                {node.name}
              </span>
              {node.comment && (
                <span className="text-[var(--ink-subtle)] ml-2">
                  # {node.comment}
                </span>
              )}
            </div>
          );
        })}
      </FlowColumn>
    </DiagramContainer>
  );
}
