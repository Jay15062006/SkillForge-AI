import React from 'react';
import { Sparkles, Terminal, GitBranch, Cpu, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Navbar({ healthData, onOpenConfig }) {
  const isConfigured = healthData?.ai_inference?.configured;
  const provider = healthData?.ai_inference?.provider || 'Open-Weight Provider';
  const model = healthData?.ai_inference?.model || 'Hosted LLM';

  return (
    <header className="navbar">
      <div className="container nav-content">
        <a href="/" className="brand">
          <div className="brand-icon">
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="brand-title">SkillForge AI</span>
              <span className="brand-badge">Hacktoberfest 2026</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.02em' }}>
              Autonomous Agent Skill Generator
            </div>
          </div>
        </a>

        <div className="nav-actions">
          {/* Health / AI Provider Status Pill */}
          <div
            className="status-pill"
            style={{ cursor: 'pointer' }}
            onClick={onOpenConfig}
            title="Click to view AI Provider & Backend Environment configuration"
          >
            <div className={`status-dot ${isConfigured ? 'online' : 'warning'}`} />
            <Cpu size={14} color={isConfigured ? 'var(--accent-emerald)' : 'var(--accent-orange)'} />
            <span>
              {isConfigured ? (
                <>
                  <strong style={{ color: 'var(--text-main)' }}>{provider.toUpperCase()}</strong>: {model}
                </>
              ) : (
                <span style={{ color: 'var(--accent-orange-light)' }}>AI Key Not Set</span>
              )}
            </span>
          </div>

          <button
            type="button"
            className="nav-link-btn"
            onClick={onOpenConfig}
            title="Environment & Setup Guide"
          >
            <HelpCircle size={15} />
            <span>Setup & Config</span>
          </button>

          <a
            href="https://github.com/topics/hacktoberfest-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link-btn"
            title="Hacktoberfest 2026"
          >
            <GitBranch size={15} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
