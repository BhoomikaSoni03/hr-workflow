'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StartNodeData } from '@/types/workflow';
import { useWorkflow } from '@/context/WorkflowContext';
import { Play, Trash2 } from 'lucide-react';

function StartNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as StartNodeData;
  const { selectNode, deleteNode } = useWorkflow();

  return (
    <div
      className={`neu-node neu-start ${selected ? 'neu-selected' : ''}`}
      onClick={() => selectNode(id)}
    >
      <div className="node-header">
        <span className="node-icon neu-icon-wrap" style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}>
          <Play size={14} fill="white" color="white" />
        </span>
        <span className="node-kind-label">Start</span>
        <button
          className="node-delete-btn"
          onClick={e => { e.stopPropagation(); deleteNode(id); }}
        >
          <Trash2 size={11} />
        </button>
      </div>
      <div className="node-title">{d.title || 'Start'}</div>
      {d.metadata.length > 0 && (
        <div className="node-meta-count">{d.metadata.length} metadata</div>
      )}
      <Handle type="source" position={Position.Bottom} className="neu-handle" />
    </div>
  );
}

export default memo(StartNode);
