'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { TaskNodeData } from '@/types/workflow';
import { useWorkflow } from '@/context/WorkflowContext';
import { ClipboardList, Trash2 } from 'lucide-react';

function TaskNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as TaskNodeData;
  const { selectNode, deleteNode } = useWorkflow();

  return (
    <div
      className={`neu-node neu-task ${selected ? 'neu-selected' : ''}`}
      onClick={() => selectNode(id)}
    >
      <Handle type="target" position={Position.Top} className="neu-handle" />
      <div className="node-header">
        <span className="node-icon neu-icon-wrap" style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}>
          <ClipboardList size={14} color="white" />
        </span>
        <span className="node-kind-label">Task</span>
        <button
          className="node-delete-btn"
          onClick={e => { e.stopPropagation(); deleteNode(id); }}
        >
          <Trash2 size={11} />
        </button>
      </div>
      <div className="node-title">{d.title || 'Task'}</div>
      {d.assignee && <div className="node-sub">👤 {d.assignee}</div>}
      {d.dueDate && <div className="node-sub">📅 {d.dueDate}</div>}
      <Handle type="source" position={Position.Bottom} className="neu-handle" />
    </div>
  );
}

export default memo(TaskNode);
