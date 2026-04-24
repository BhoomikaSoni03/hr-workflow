'use client';

import React, { useEffect, useState } from 'react';
import { useWorkflow } from '@/context/WorkflowContext';
import type {
  WorkflowNodeData,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
  KeyValuePair,
  AutomationAction,
} from '@/types/workflow';
import { fetchAutomations } from '@/lib/mockApi';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';

export default function NodeFormPanel() {
  const { nodes, selectedNodeId, selectNode, updateNodeData } = useWorkflow();
  const [automations, setAutomations] = useState<AutomationAction[]>([]);

  useEffect(() => {
    fetchAutomations().then(setAutomations);
  }, []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  if (!selectedNode) return null;

  const data = selectedNode.data;

  return (
    <div className="form-panel">
      {/* Header */}
      <div className="form-panel-header">
        <div className="form-panel-title">Edit Node</div>
        <button className="form-close-btn" onClick={() => selectNode(null)}>
          <X size={16} />
        </button>
      </div>

      <div className="form-kind-badge form-kind-badge--{data.kind}">{data.kind.toUpperCase()}</div>
      <div className="form-node-id">ID: {selectedNode.id}</div>

      <div className="form-divider" />

      {/* Render per-kind form */}
      {data.kind === 'start'     && <StartForm     id={selectedNode.id} data={data} update={updateNodeData} />}
      {data.kind === 'task'      && <TaskForm      id={selectedNode.id} data={data} update={updateNodeData} />}
      {data.kind === 'approval'  && <ApprovalForm  id={selectedNode.id} data={data} update={updateNodeData} />}
      {data.kind === 'automated' && <AutomatedForm id={selectedNode.id} data={data} update={updateNodeData} automations={automations} />}
      {data.kind === 'end'       && <EndForm       id={selectedNode.id} data={data} update={updateNodeData} />}
    </div>
  );
}

// ─── Field helpers ──────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function NeuInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="neu-input" {...props} />;
}

function NeuTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="neu-textarea" rows={3} {...props} />;
}

function NeuSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return (
    <div className="neu-select-wrap">
      <select className="neu-select" {...rest}>{children}</select>
      <ChevronDown size={14} className="neu-select-arrow" />
    </div>
  );
}

// ─── KV Pairs Editor ─────────────────────────────────────────────────────────

function KVEditor({ pairs, onChange }: { pairs: KeyValuePair[]; onChange: (pairs: KeyValuePair[]) => void }) {
  const add = () => onChange([...pairs, { key: '', value: '' }]);
  const remove = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));
  const set = (i: number, field: 'key' | 'value', val: string) => {
    const next = pairs.map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    onChange(next);
  };

  return (
    <div className="kv-editor">
      {pairs.map((p, i) => (
        <div key={i} className="kv-row">
          <NeuInput
            placeholder="Key"
            value={p.key}
            onChange={e => set(i, 'key', e.target.value)}
          />
          <NeuInput
            placeholder="Value"
            value={p.value}
            onChange={e => set(i, 'value', e.target.value)}
          />
          <button className="kv-remove-btn" onClick={() => remove(i)}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button className="neu-btn-secondary" onClick={add}>
        <Plus size={13} /> Add Field
      </button>
    </div>
  );
}

// ─── Start Form ──────────────────────────────────────────────────────────────

function StartForm({ id, data, update }: { id: string; data: StartNodeData; update: (id: string, d: Partial<WorkflowNodeData>) => void }) {
  return (
    <>
      <Field label="Start Title">
        <NeuInput
          value={data.title}
          onChange={e => update(id, { title: e.target.value } as Partial<WorkflowNodeData>)}
          placeholder="e.g. Begin Onboarding"
        />
      </Field>
      <Field label="Metadata (key-value)">
        <KVEditor
          pairs={data.metadata}
          onChange={pairs => update(id, { metadata: pairs } as Partial<WorkflowNodeData>)}
        />
      </Field>
    </>
  );
}

// ─── Task Form ───────────────────────────────────────────────────────────────

function TaskForm({ id, data, update }: { id: string; data: TaskNodeData; update: (id: string, d: Partial<WorkflowNodeData>) => void }) {
  return (
    <>
      <Field label="Title *">
        <NeuInput
          value={data.title}
          onChange={e => update(id, { title: e.target.value } as Partial<WorkflowNodeData>)}
          placeholder="Task title"
        />
      </Field>
      <Field label="Description">
        <NeuTextarea
          value={data.description}
          onChange={e => update(id, { description: e.target.value } as Partial<WorkflowNodeData>)}
          placeholder="Describe what needs to be done..."
        />
      </Field>
      <Field label="Assignee">
        <NeuInput
          value={data.assignee}
          onChange={e => update(id, { assignee: e.target.value } as Partial<WorkflowNodeData>)}
          placeholder="e.g. hr@company.com"
        />
      </Field>
      <Field label="Due Date">
        <NeuInput
          type="date"
          value={data.dueDate}
          onChange={e => update(id, { dueDate: e.target.value } as Partial<WorkflowNodeData>)}
        />
      </Field>
      <Field label="Custom Fields">
        <KVEditor
          pairs={data.customFields}
          onChange={pairs => update(id, { customFields: pairs } as Partial<WorkflowNodeData>)}
        />
      </Field>
    </>
  );
}

// ─── Approval Form ───────────────────────────────────────────────────────────

function ApprovalForm({ id, data, update }: { id: string; data: ApprovalNodeData; update: (id: string, d: Partial<WorkflowNodeData>) => void }) {
  return (
    <>
      <Field label="Title">
        <NeuInput
          value={data.title}
          onChange={e => update(id, { title: e.target.value } as Partial<WorkflowNodeData>)}
          placeholder="Approval title"
        />
      </Field>
      <Field label="Approver Role">
        <NeuSelect
          value={data.approverRole}
          onChange={e => update(id, { approverRole: e.target.value as ApprovalNodeData['approverRole'] } as Partial<WorkflowNodeData>)}
        >
          <option value="Manager">Manager</option>
          <option value="HRBP">HRBP</option>
          <option value="Director">Director</option>
        </NeuSelect>
      </Field>
      <Field label="Auto-Approve Threshold (hrs)">
        <NeuInput
          type="number"
          min={0}
          value={data.autoApproveThreshold}
          onChange={e => update(id, { autoApproveThreshold: Number(e.target.value) } as Partial<WorkflowNodeData>)}
          placeholder="0 = disabled"
        />
      </Field>
    </>
  );
}

// ─── Automated Form ──────────────────────────────────────────────────────────

function AutomatedForm({ id, data, update, automations }: {
  id: string;
  data: AutomatedNodeData;
  update: (id: string, d: Partial<WorkflowNodeData>) => void;
  automations: AutomationAction[];
}) {
  const selectedAction = automations.find(a => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    const action = automations.find(a => a.id === actionId);
    const actionParams: Record<string, string> = {};
    action?.params.forEach(p => { actionParams[p] = data.actionParams[p] ?? ''; });
    update(id, { actionId, actionParams } as Partial<WorkflowNodeData>);
  };

  const handleParamChange = (param: string, value: string) => {
    update(id, {
      actionParams: { ...data.actionParams, [param]: value },
    } as Partial<WorkflowNodeData>);
  };

  return (
    <>
      <Field label="Title">
        <NeuInput
          value={data.title}
          onChange={e => update(id, { title: e.target.value } as Partial<WorkflowNodeData>)}
          placeholder="Automation name"
        />
      </Field>
      <Field label="Action">
        <NeuSelect
          value={data.actionId}
          onChange={e => handleActionChange(e.target.value)}
        >
          <option value="">— Select action —</option>
          {automations.map(a => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </NeuSelect>
      </Field>
      {selectedAction && selectedAction.params.map(param => (
        <Field key={param} label={`Param: ${param}`}>
          <NeuInput
            value={data.actionParams[param] ?? ''}
            onChange={e => handleParamChange(param, e.target.value)}
            placeholder={`Enter ${param}`}
          />
        </Field>
      ))}
    </>
  );
}

// ─── End Form ────────────────────────────────────────────────────────────────

function EndForm({ id, data, update }: { id: string; data: EndNodeData; update: (id: string, d: Partial<WorkflowNodeData>) => void }) {
  return (
    <>
      <Field label="End Message">
        <NeuInput
          value={data.endMessage}
          onChange={e => update(id, { endMessage: e.target.value } as Partial<WorkflowNodeData>)}
          placeholder="e.g. Onboarding Complete"
        />
      </Field>
      <Field label="Show Summary Report">
        <label className="toggle-wrap">
          <div
            className={`toggle ${data.summary ? 'toggle--on' : ''}`}
            onClick={() => update(id, { summary: !data.summary } as Partial<WorkflowNodeData>)}
          >
            <div className="toggle-thumb" />
          </div>
          <span className="toggle-label">{data.summary ? 'Enabled' : 'Disabled'}</span>
        </label>
      </Field>
    </>
  );
}
