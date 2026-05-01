/**
 * RangerPolicyDiagram
 *
 * Apache Ranger policy engine: fine-grained access control
 * with per-policy database/table permissions.
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { FlowNode } from '@primitives/FlowNode';
import { FlowColumn } from '@primitives/FlowColumn';

interface PolicyRule {
  resource: string;
  access: string;
  color: string;
}

interface Policy {
  name: string;
  rules: PolicyRule[];
}

const policies: Policy[] = [
  {
    name: 'data-scientists',
    rules: [
      { resource: 'Database: analytics', access: 'SELECT', color: 'text-emerald-700' },
      { resource: 'Database: raw_data', access: 'DENIED', color: 'text-red-400' },
      { resource: 'Table: users', access: 'MASKED', color: 'text-amber-700' },
    ],
  },
  {
    name: 'data-engineers',
    rules: [
      { resource: 'Database: *', access: 'ALL', color: 'text-emerald-700' },
      { resource: 'Table: audit_log', access: 'SELECT', color: 'text-blue-700' },
    ],
  },
];

export function RangerPolicyDiagram() {
  return (
    <DiagramContainer title="Ranger Policy Engine" color="purple">
      <FlowColumn gap={8} align="stretch">
        {policies.map((policy) => (
          <div
            key={policy.name}
            className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-4"
          >
            <div className="text-sm font-medium text-purple-700 mb-3">
              Policy: "{policy.name}"
            </div>
            <FlowColumn gap={4} align="stretch">
              {policy.rules.map((rule, i) => (
                <div key={i} className="flex items-center justify-between">
                  <FlowNode variant="database" size="sm" className="flex-1">
                    {rule.resource}
                  </FlowNode>
                  <span className={`ml-3 text-xs font-mono font-semibold ${rule.color}`}>
                    [{rule.access}]
                  </span>
                </div>
              ))}
            </FlowColumn>
          </div>
        ))}
      </FlowColumn>
    </DiagramContainer>
  );
}
