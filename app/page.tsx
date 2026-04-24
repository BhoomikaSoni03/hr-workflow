'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { WorkflowProvider } from '@/context/WorkflowContext';
import Sidebar from '@/components/Sidebar';
import NodeFormPanel from '@/components/NodeFormPanel';
import { Play, Layers, Settings } from 'lucide-react';

// Avoid SSR for canvas (React Flow is browser-only)
const WorkflowCanvas = dynamic(() => import('@/components/WorkflowCanvas'), { ssr: false });
const SandboxPanel  = dynamic(() => import('@/components/SandboxPanel'),  { ssr: false });

export default function Home() {
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  return (
    <WorkflowProvider>
      <div className="app-shell">
        {/* ── Topbar ─────────────────────────────────────────────────────── */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-logo">🌿 FlowForge</div>
            <div className="topbar-breadcrumb">
              <span>HR Workflows</span>
              <span className="topbar-sep">/</span>
              <span className="topbar-current">New Workflow</span>
            </div>
          </div>

          <div className="topbar-center">
            <div className="topbar-badge">
              <Layers size={14} /> Tredence Studio · AI Agentic Platform
            </div>
          </div>

          <div className="topbar-right">
            <button className="topbar-btn" title="Settings">
              <Settings size={16} />
            </button>
            <button
              className="neu-btn-primary topbar-sandbox-btn"
              onClick={() => setSandboxOpen(true)}
            >
              <Play size={15} /> Run Sandbox
            </button>
          </div>
        </header>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="body-row">
          <Sidebar />

          <main className="canvas-area">
            {/* Canvas header */}
            <div className="canvas-toolbar">
              <div className="canvas-toolbar-left">
                <span className="canvas-title">Workflow Canvas</span>
                <span className="canvas-hint">Drag nodes from the left panel • Click to select • Drag handles to connect</span>
              </div>
            </div>

            {/* React Flow canvas fills remaining space */}
            <div className="canvas-container">
              <WorkflowCanvas />
            </div>
          </main>

          {/* Node edit panel — slides in from right */}
          <NodeFormPanel />
        </div>

        {/* ── Sandbox overlay ───────────────────────────────────────────── */}
        {sandboxOpen && (
          <SandboxPanel onClose={() => setSandboxOpen(false)} />
        )}
      </div>
    </WorkflowProvider>
  );
}
