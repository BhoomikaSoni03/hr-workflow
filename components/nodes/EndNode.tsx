'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { EndNodeData } from '@/types/workflow';
import { useWorkflow } from '@/context/WorkflowContext';
import { FlagTriangleRight, Trash2 } from 'lucide-react';

function EndNode({ id, data, selected }: NodeProps) {
  const d = data as EndNodeData;
  const { selectNode, deleteNode } = useWorkflow();

  return (
    <div
      className={`neu-node neu-end ${selected ? 'neu-selected' : ''}`}
      onClick={() => selectNode(id)}
    >
      <Handle type="target" position={Position.Top} className="neu-handle" />
      <div className="node-header">
        <span className="node-icon neu-icon-wrap" style={{ background: 'linear-gradient(135deg, #fb7185, #f43f5e)' }}>
          <FlagTriangleRight size={14} color="white" />
        </span>
        <span className="node-kind-label">End</span>
        <button
          className="node-delete-btn"
          onClick={e => { e.stopPropagation(); deleteNode(id); }}
        >
          <Trash2 size={11} />
        </button>
      </div>
      <div className="node-title">{d.endMessage || 'End'}</div>
      {d.summary && <div className="node-badge-summary">📊 Summary On</div>}
    </div>
  );
}

export default memo(EndNode);
