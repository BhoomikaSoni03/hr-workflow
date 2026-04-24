'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
  type Edge,
} from '@xyflow/react';
import { v4 as uuid } from 'uuid';
import type { WorkflowNode, WorkflowNodeData, NodeKind } from '@/types/workflow';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface WorkflowCtx {
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNodeId: string | null;

  // canvas ops
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (kind: NodeKind, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;

  // selection / editing
  selectNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;

  // import/export
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
}

const WorkflowContext = createContext<WorkflowCtx | null>(null);

// ─── Default data factories ───────────────────────────────────────────────────

function defaultData(kind: NodeKind): WorkflowNodeData {
  switch (kind) {
    case 'start':     return { kind: 'start', title: 'Start', metadata: [] };
    case 'task':      return { kind: 'task', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] };
    case 'approval':  return { kind: 'approval', title: 'Approval', approverRole: 'Manager', autoApproveThreshold: 0 };
    case 'automated': return { kind: 'automated', title: 'Automation', actionId: '', actionParams: {} };
    case 'end':       return { kind: 'end', endMessage: 'Workflow Complete', summary: false };
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const idCounter = useRef(0);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setNodes(nds => applyNodeChanges(changes, nds as any) as unknown as WorkflowNode[]);
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(eds => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({ ...connection, id: uuid(), animated: true, type: 'smoothstep' }, eds));
  }, []);

  const addNode = useCallback((kind: NodeKind, position: { x: number; y: number }) => {
    idCounter.current += 1;
    const id = `${kind}-${idCounter.current}-${uuid().slice(0, 6)}`;
    const newNode: WorkflowNode = {
      id,
      type: kind,
      position,
      data: defaultData(kind),
    };
    setNodes(nds => [...nds, newNode]);
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    setSelectedNodeId(prev => prev === id ? null : prev);
  }, []);

  const deleteEdge = useCallback((id: string) => {
    setEdges(eds => eds.filter(e => e.id !== id));
  }, []);

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const updateNodeData = useCallback((id: string, data: Partial<WorkflowNodeData>) => {
    setNodes(nds =>
      nds.map(n =>
        n.id === id ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData } : n
      )
    );
  }, []);

  const exportWorkflow = useCallback((): string => {
    return JSON.stringify({ nodes, edges }, null, 2);
  }, [nodes, edges]);

  const importWorkflow = useCallback((json: string) => {
    const parsed = JSON.parse(json);
    setNodes(parsed.nodes ?? []);
    setEdges(parsed.edges ?? []);
    setSelectedNodeId(null);
  }, []);

  return (
    <WorkflowContext.Provider value={{
      nodes, edges, selectedNodeId,
      onNodesChange, onEdgesChange, onConnect,
      addNode, deleteNode, deleteEdge,
      selectNode, updateNodeData,
      exportWorkflow, importWorkflow,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkflow(): WorkflowCtx {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used inside WorkflowProvider');
  return ctx;
}
