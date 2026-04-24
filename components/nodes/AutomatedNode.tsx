'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { AutomatedNodeData } from '@/types/workflow';
import { useWorkflow } from '@/context/WorkflowContext';
import { Zap, Trash2 } from 'lucide-react';

function AutomatedNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as AutomatedNodeData;
  const { selectNode, deleteNode } = useWorkflow();

  return (
    <div
      className={`neu-node neu-automated ${selected ? 'neu-selected' : ''}`}
      onClick={() => selectNode(id)}
    >
      <Handle type="target" position={Position.Top} className="neu-handle" />
      <div className="node-header">
        <span className="node-icon neu-icon-wrap" style={{ background: 'linear-gradient(135deg, #c084fc, #a855f7)' }}>
          <Zap size={14} color="white" />
        </span>
        <span className="node-kind-label">Automated</span>
        <button
          className="node-delete-btn"
          onClick={e => { e.stopPropagation(); deleteNode(id); }}
        >
          <Trash2 size={11} />
        </button>
      </div>
      <div className="node-title">{d.title || 'Automation'}</div>
      {d.actionId && <div className="node-sub">⚡ {d.actionId}</div>}
      <Handle type="source" position={Position.Bottom} className="neu-handle" />
    </div>
  );
}

export default memo(AutomatedNode);
