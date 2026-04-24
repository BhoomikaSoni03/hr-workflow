'use client';

import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflow } from '@/context/WorkflowContext';
import type { NodeKind } from '@/types/workflow';

import StartNode from '@/components/nodes/StartNode';
import TaskNode from '@/components/nodes/TaskNode';
import ApprovalNode from '@/components/nodes/ApprovalNode';
import AutomatedNode from '@/components/nodes/AutomatedNode';
import EndNode from '@/components/nodes/EndNode';

// ─── Register custom node types ──────────────────────────────────────────────

const nodeTypes: NodeTypes = {
  start:     StartNode,
  task:      TaskNode,
  approval:  ApprovalNode,
  automated: AutomatedNode,
  end:       EndNode,
};

const edgeTypes: EdgeTypes = {};

// ─── Component ───────────────────────────────────────────────────────────────

export default function WorkflowCanvas() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNode, selectNode, deleteEdge,
  } = useWorkflow();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReturnType<typeof React.useState>[0]>(null);

  // ─── Drag-and-drop from sidebar ─────────────────────────────────────────

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData('application/workflow-node-type') as NodeKind;
      if (!kind) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rfInstance = reactFlowInstance as any;
      if (!rfInstance) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = rfInstance.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNode(kind, position);
    },
    [reactFlowInstance, addNode]
  );

  // ─── Click background to deselect ───────────────────────────────────────

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes as unknown as Parameters<typeof ReactFlow>[0]['nodes']}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onEdgeClick={(_, edge) => {
          if (confirm('Delete this connection?')) deleteEdge(edge.id);
        }}
        selectionMode={SelectionMode.Partial}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="rgba(148,163,184,0.15)"
        />
        <Controls
          className="neu-controls"
          showInteractive={false}
        />
        <MiniMap
          className="neu-minimap"
          nodeColor={nodeTypeColor}
          maskColor="rgba(15,23,42,0.6)"
        />
      </ReactFlow>
    </div>
  );
}

function nodeTypeColor(node: { type?: string }) {
  switch (node.type) {
    case 'start':     return '#22c55e';
    case 'task':      return '#3b82f6';
    case 'approval':  return '#f59e0b';
    case 'automated': return '#a855f7';
    case 'end':       return '#f43f5e';
    default:          return '#64748b';
  }
}
