// ─── Workflow Node Types ────────────────────────────────────────────────────

export type NodeKind = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface KeyValuePair {
  key: string;
  value: string;
}

// ─── Per-node Data Shapes ────────────────────────────────────────────────────

export interface StartNodeData {
  kind: 'start';
  title: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData {
  kind: 'task';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData {
  kind: 'approval';
  title: string;
  approverRole: 'Manager' | 'HRBP' | 'Director';
  autoApproveThreshold: number;
}

export interface AutomatedNodeData {
  kind: 'automated';
  title: string;
  actionId: string;          // chosen from /automations
  actionParams: Record<string, string>; // keyed by param name
}

export interface EndNodeData {
  kind: 'end';
  endMessage: string;
  summary: boolean;         // boolean toggle
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

// ─── React-Flow compatible node ──────────────────────────────────────────────

export interface WorkflowNode {
  id: string;
  type: NodeKind;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

// ─── Mock API Shapes ─────────────────────────────────────────────────────────

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

// ─── Simulation ──────────────────────────────────────────────────────────────

export interface SimulationStep {
  nodeId: string;
  nodeTitle: string;
  kind: NodeKind;
  status: 'success' | 'skipped' | 'error';
  message: string;
  timestamp: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
}

// ─── Serialised Workflow ─────────────────────────────────────────────────────

export interface SerializedWorkflow {
  nodes: WorkflowNode[];
  edges: Array<{ id: string; source: string; target: string; label?: string }>;
}
