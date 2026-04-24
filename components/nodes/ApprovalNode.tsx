'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ApprovalNodeData } from '@/types/workflow';
import { useWorkflow } from '@/context/WorkflowContext';
import { ShieldCheck, Trash2 } from 'lucide-react';

function ApprovalNode({ id, data, selected }: NodeProps) {
  const d = data as ApprovalNodeData;
  const { selectNode, deleteNode } = useWorkflow();

  const roleColors: Record<string, string> = {
    Manager: '#f59e0b',
    HRBP: '#a78bfa',
    Director: '#f43f5e',
  };

  return (
    <div
      className={`neu-node neu-approval ${selected ? 'neu-selected' : ''}`}
      onClick={() => selectNode(id)}
    >
      <Handle type="target" position={Position.Top} className="neu-handle" />
      <div className="node-header">
        <span className="node-icon neu-icon-wrap" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
          <ShieldCheck size={14} color="white" />
        </span>
        <span className="node-kind-label">Approval</span>
        <button
          className="node-delete-btn"
          onClick={e => { e.stopPropagation(); deleteNode(id); }}
        >
          <Trash2 size={11} />
        </button>
      </div>
      <div className="node-title">{d.title || 'Approval'}</div>
      <div className="node-role-badge" style={{ background: roleColors[d.approverRole] || '#888' }}>
        {d.approverRole}
      </div>
      {d.autoApproveThreshold > 0 && (
        <div className="node-sub">⚡ Auto ≥ {d.autoApproveThreshold}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="neu-handle" />
    </div>
  );
}

export default memo(ApprovalNode);
