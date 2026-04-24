'use client';

import React from 'react';
import type { NodeKind } from '@/types/workflow';
import { Play, ClipboardList, ShieldCheck, Zap, FlagTriangleRight, Info } from 'lucide-react';

interface NodeTypeConfig {
  kind: NodeKind;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
}

const NODE_TYPES: NodeTypeConfig[] = [
  {
    kind: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    icon: <Play size={18} fill="white" color="white" />,
    color: 'linear-gradient(135deg, #4ade80, #22c55e)',
    glow: '#22c55e',
  },
  {
    kind: 'task',
    label: 'Task',
    description: 'Human task (collect docs, fill form)',
    icon: <ClipboardList size={18} color="white" />,
    color: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    glow: '#3b82f6',
  },
  {
    kind: 'approval',
    label: 'Approval',
    description: 'Manager / HR approval step',
    icon: <ShieldCheck size={18} color="white" />,
    color: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    glow: '#f59e0b',
  },
  {
    kind: 'automated',
    label: 'Automated',
    description: 'System-triggered action (email, PDF)',
    icon: <Zap size={18} color="white" />,
    color: 'linear-gradient(135deg, #c084fc, #a855f7)',
    glow: '#a855f7',
  },
  {
    kind: 'end',
    label: 'End',
    description: 'Workflow completion',
    icon: <FlagTriangleRight size={18} color="white" />,
    color: 'linear-gradient(135deg, #fb7185, #f43f5e)',
    glow: '#f43f5e',
  },
];

export default function Sidebar() {
  const onDragStart = (e: React.DragEvent, kind: NodeKind) => {
    e.dataTransfer.setData('application/workflow-node-type', kind);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <span className="brand-logo-icon">🌿</span>
        </div>
        <div>
          <div className="brand-name">FlowForge</div>
          <div className="brand-sub">HR Workflow Designer</div>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Node Palette */}
      <div className="sidebar-section-label">
        <span>Node Types</span>
      </div>
      <div className="sidebar-hint">
        <Info size={11} style={{ flexShrink: 0 }} />
        <span>Drag nodes onto the canvas to build your workflow</span>
      </div>

      <div className="node-palette">
        {NODE_TYPES.map(nt => (
          <div
            key={nt.kind}
            className="palette-item"
            draggable
            onDragStart={e => onDragStart(e, nt.kind)}
          >
            <div className="palette-icon" style={{ background: nt.color }}>
              {nt.icon}
            </div>
            <div className="palette-text">
              <div className="palette-label">{nt.label}</div>
              <div className="palette-desc">{nt.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-divider" />

      {/* Workflow Templates */}
      <div className="sidebar-section-label">Quick Templates</div>
      <div className="template-list">
        <QuickTemplate label="🎯 Onboarding Flow" />
        <QuickTemplate label="🏖️ Leave Approval" />
        <QuickTemplate label="📄 Doc Verification" />
      </div>
    </aside>
  );
}

function QuickTemplate({ label }: { label: string }) {
  return (
    <div className="template-item">
      {label}
    </div>
  );
}
