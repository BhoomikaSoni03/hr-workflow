'use client';

import React, { useState } from 'react';
import { useWorkflow } from '@/context/WorkflowContext';
import { simulateWorkflow } from '@/lib/mockApi';
import type { SimulationResult, SimulationStep } from '@/types/workflow';
import {
  X, Play, Download, Upload, AlertTriangle, CheckCircle, Clock,
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

const kindEmoji: Record<string, string> = {
  start: '▶',
  task: '📋',
  approval: '✅',
  automated: '⚡',
  end: '🏁',
};

const kindColor: Record<string, string> = {
  start: '#22c55e',
  task: '#3b82f6',
  approval: '#f59e0b',
  automated: '#a855f7',
  end: '#f43f5e',
};

export default function SandboxPanel({ onClose }: Props) {
  const { nodes, edges, exportWorkflow, importWorkflow } = useWorkflow();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [json, setJson] = useState('');
  const [showJson, setShowJson] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await simulateWorkflow({ nodes: nodes as any, edges: edges as any });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const str = exportWorkflow();
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      importWorkflow(json);
      setJson('');
      setShowJson(false);
    } catch {
      alert('Invalid JSON');
    }
  };

  const stepStatusIcon = (s: SimulationStep) => {
    if (s.status === 'success') return <CheckCircle size={14} color="#22c55e" />;
    if (s.status === 'error')   return <AlertTriangle size={14} color="#f43f5e" />;
    return <Clock size={14} color="#94a3b8" />;
  };

  return (
    <div className="sandbox-overlay">
      <div className="sandbox-panel">
        {/* Header */}
        <div className="sandbox-header">
          <div className="sandbox-title">
            <Play size={18} /> Workflow Sandbox
          </div>
          <button className="form-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Stats row */}
        <div className="sandbox-stats">
          <div className="sandbox-stat">
            <span className="stat-num">{nodes.length}</span>
            <span className="stat-label">Nodes</span>
          </div>
          <div className="sandbox-stat">
            <span className="stat-num">{edges.length}</span>
            <span className="stat-label">Edges</span>
          </div>
          <div className="sandbox-stat">
            <span className="stat-num">
              {nodes.filter(n => n.type === 'start').length}
            </span>
            <span className="stat-label">Starts</span>
          </div>
          <div className="sandbox-stat">
            <span className="stat-num">
              {nodes.filter(n => n.type === 'end').length}
            </span>
            <span className="stat-label">Ends</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="sandbox-actions">
          <button className="neu-btn-primary" onClick={handleSimulate} disabled={loading}>
            {loading ? <><span className="spin-dot" /> Running…</> : <><Play size={14} /> Simulate</>}
          </button>
          <button className="neu-btn-secondary" onClick={handleExport}>
            <Download size={14} /> Export JSON
          </button>
          <button className="neu-btn-secondary" onClick={() => setShowJson(v => !v)}>
            <Upload size={14} /> Import JSON
          </button>
        </div>

        {showJson && (
          <div className="import-area">
            <textarea
              className="neu-textarea"
              rows={6}
              placeholder="Paste workflow JSON here…"
              value={json}
              onChange={e => setJson(e.target.value)}
            />
            <button className="neu-btn-primary" onClick={handleImport}>
              Load Workflow
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="sandbox-results">
            {/* Validation errors */}
            {result.errors.length > 0 && (
              <div className="result-errors">
                <div className="result-section-label"><AlertTriangle size={14} /> Validation Errors</div>
                {result.errors.map((e, i) => (
                  <div key={i} className="error-item">⚠ {e}</div>
                ))}
              </div>
            )}

            {/* Execution steps */}
            {result.steps.length > 0 && (
              <div className="result-steps">
                <div className="result-section-label"><CheckCircle size={14} color="#22c55e" /> Execution Log</div>
                <div className="steps-timeline">
                  {result.steps.map((step, i) => (
                    <div key={step.nodeId} className="timeline-item">
                      <div className="timeline-connector">
                        <div
                          className="timeline-dot"
                          style={{ background: kindColor[step.kind] ?? '#888' }}
                        >
                          {kindEmoji[step.kind]}
                        </div>
                        {i < result.steps.length - 1 && <div className="timeline-line" />}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-title">
                          {stepStatusIcon(step)}
                          <span>{step.nodeTitle}</span>
                          <span className="timeline-kind-badge" style={{ background: kindColor[step.kind] }}>
                            {step.kind}
                          </span>
                        </div>
                        <div className="timeline-msg">{step.message}</div>
                        <div className="timeline-ts">{new Date(step.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall status */}
            <div className={`result-status ${result.success ? 'result-status--ok' : 'result-status--fail'}`}>
              {result.success
                ? '✅ Workflow executed successfully'
                : '❌ Workflow has errors — see above'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
