/**
 * Mock API layer — simulates REST calls with artificial latency.
 * Swap these functions with real fetch() calls in production.
 */

import type {
  AutomationAction,
  SerializedWorkflow,
  SimulationResult,
  SimulationStep,
  NodeKind,
} from '@/types/workflow';

const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email',       label: 'Send Email',           params: ['to', 'subject'] },
  { id: 'generate_doc',     label: 'Generate Document',    params: ['template', 'recipient'] },
  { id: 'slack_notify',     label: 'Slack Notification',   params: ['channel', 'message'] },
  { id: 'create_ticket',    label: 'Create Jira Ticket',   params: ['project', 'summary'] },
  { id: 'update_hris',      label: 'Update HRIS Record',   params: ['employeeId', 'field', 'value'] },
];

/** GET /automations */
export async function fetchAutomations(): Promise<AutomationAction[]> {
  await delay(300);
  return structuredClone(MOCK_AUTOMATIONS);
}

/** POST /simulate */
export async function simulateWorkflow(workflow: SerializedWorkflow): Promise<SimulationResult> {
  await delay(800);

  const errors: string[] = [];
  const steps: SimulationStep[] = [];

  // — validation ——————————————————————————————
  const startNodes = workflow.nodes.filter(n => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push('Workflow must have exactly one Start node.');
  } else if (startNodes.length > 1) {
    errors.push('Workflow must have only one Start node.');
  }

  const endNodes = workflow.nodes.filter(n => n.type === 'end');
  if (endNodes.length === 0) {
    errors.push('Workflow must have at least one End node.');
  }

  // Detect islands (nodes with no edges)
  if (workflow.nodes.length > 1) {
    const connectedIds = new Set<string>();
    workflow.edges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target); });
    workflow.nodes.forEach(n => {
      if (!connectedIds.has(n.id) && workflow.nodes.length > 1) {
        errors.push(`Node "${(n.data as { title?: string; endMessage?: string }).title ?? n.id}" is disconnected.`);
      }
    });
  }

  if (errors.length > 0) {
    return { success: false, steps, errors };
  }

  // — topology sort simulation ————————————————
  // Build adjacency from edges
  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();
  workflow.nodes.forEach(n => { adj.set(n.id, []); inDeg.set(n.id, 0); });
  workflow.edges.forEach(e => {
    adj.get(e.source)!.push(e.target);
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
  });

  const queue = workflow.nodes.filter(n => inDeg.get(n.id) === 0);
  const visited = new Set<string>();
  let ts = Date.now();

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node.id)) { errors.push('Cycle detected in workflow graph.'); break; }
    visited.add(node.id);

    const data = node.data as { title?: string; endMessage?: string };
    const label = data.title ?? data.endMessage ?? node.id;

    steps.push({
      nodeId: node.id,
      nodeTitle: label,
      kind: node.type as NodeKind,
      status: 'success',
      message: messageFor(node.type as NodeKind, label),
      timestamp: new Date(ts).toISOString(),
    });
    ts += 1500;

    const neighbours = adj.get(node.id) ?? [];
    for (const nid of neighbours) {
      inDeg.set(nid, (inDeg.get(nid) ?? 1) - 1);
      if (inDeg.get(nid) === 0) {
        queue.push(workflow.nodes.find(n => n.id === nid)!);
      }
    }
  }

  return { success: errors.length === 0, steps, errors };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function messageFor(kind: NodeKind, label: string): string {
  switch (kind) {
    case 'start':     return `▶ Workflow started at "${label}"`;
    case 'task':      return `📋 Task "${label}" assigned and queued`;
    case 'approval':  return `✅ Approval request sent for "${label}"`;
    case 'automated': return `⚡ Automation "${label}" executed successfully`;
    case 'end':       return `🏁 Workflow completed at "${label}"`;
    default:          return `Processed "${label}"`;
  }
}
