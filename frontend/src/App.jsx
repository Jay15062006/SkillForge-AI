import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ConfigModal from './components/ConfigModal';
import SkillPromptForm from './components/SkillPromptForm';
import SkillPreview from './components/SkillPreview';
import { Sparkles, Terminal, Shield, Zap, Heart, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);

  // Skill state
  const [skillContent, setSkillContent] = useState('');
  const [validation, setValidation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDownloadingMd, setIsDownloadingMd] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [notification, setNotification] = useState(null);

  // Show auto-dismissing notifications
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 6000);
  };

  // Fetch health check
  const fetchHealth = async () => {
    try {
      setIsRefreshingHealth(true);
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      } else {
        showNotification('error', 'Backend health check failed. Ensure FastAPI is running on port 8000.');
      }
    } catch (err) {
      console.error('Health check error:', err);
      showNotification('error', 'Could not reach backend API at /api/health.');
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // Handle skill generation via hosted inference API
  const handleGenerate = async ({ prompt, skill_name, category }) => {
    setIsGenerating(true);
    setNotification(null);

    try {
      const res = await fetch('/api/skills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, skill_name, category }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const detail = errorData.detail || errorData.message || `Server error (${res.status})`;

        // If not configured, guide user to config modal
        if (res.status === 503) {
          showNotification('warning', detail);
          setIsConfigModalOpen(true);
        } else {
          showNotification('error', detail);
        }
        return;
      }

      const data = await res.json();
      setSkillContent(data.markdown);
      setValidation(data.validation);
      showNotification('success', 'Skill forged successfully with open-weight model!');
    } catch (err) {
      console.error('Generation error:', err);
      showNotification('error', `Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Re-validate skill content
  const handleRevalidate = async (contentToValidate) => {
    if (!contentToValidate || !contentToValidate.trim()) return;
    setIsValidating(true);
    try {
      const res = await fetch('/api/skills/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToValidate }),
      });
      if (res.ok) {
        const data = await res.json();
        setValidation(data);
      }
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  // Load a complete sample skill for quick testing
  const handleLoadSample = async () => {
    const sample = `---
name: github-pr-reviewer
description: Automatically reviews GitHub pull requests for security vulnerabilities, style standards, and test coverage.
version: 1.0.0
tags:
  - git
  - code-review
  - security
---

# GitHub PR Reviewer Skill

## Overview
This skill empowers autonomous coding agents to perform comprehensive, production-grade pull request reviews across repositories.

## Workflow & Step-by-Step Instructions
1. Inspect the incoming git diff using git CLI commands (\`git diff origin/main...HEAD\`).
2. Analyze code changes for potential breaking API changes and edge cases.
3. Verify test coverage additions for newly introduced functions.
4. Flag security pitfalls such as unsanitized inputs, hardcoded credentials, and missing bounds checks.
5. Generate an objective, actionable markdown review with constructive code recommendations.

## Best Practices
- Never approve pull requests with hardcoded secrets or failing test suites.
- Provide actionable code snippets in recommendations.
`;
    setSkillContent(sample);
    await handleRevalidate(sample);
    showNotification('success', 'Loaded sample "github-pr-reviewer" skill into workspace!');
  };

  // Direct download of SKILL.md file
  const handleDownloadMd = async () => {
    if (!skillContent) return;
    setIsDownloadingMd(true);
    try {
      const skillName = validation?.frontmatter?.name || 'custom-skill';
      const res = await fetch('/api/skills/download-md', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: skillName, content: skillContent }),
      });

      if (!res.ok) {
        throw new Error('Failed to download SKILL.md');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SKILL.md';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification('success', 'Downloaded SKILL.md successfully!');
    } catch (err) {
      console.error('Download error:', err);
      showNotification('error', `Download failed: ${err.message}`);
    } finally {
      setIsDownloadingMd(false);
    }
  };

  // Export ZIP bundle containing skill folder and SKILL.md
  const handleExportZip = async () => {
    if (!skillContent) return;
    setIsExportingZip(true);
    try {
      const skillName = validation?.frontmatter?.name || 'custom-skill';
      const res = await fetch('/api/skills/export-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: skillName, content: skillContent }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate ZIP export');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${skillName}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification('success', `Exported ${skillName}.zip package!`);
    } catch (err) {
      console.error('ZIP Export error:', err);
      showNotification('error', `ZIP export failed: ${err.message}`);
    } finally {
      setIsExportingZip(false);
    }
  };

  const isAiConfigured = Boolean(healthData?.ai_inference?.configured);

  return (
    <>
      <Navbar healthData={healthData} onOpenConfig={() => setIsConfigModalOpen(true)} />

      {/* Floating Global Notification Banner */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '4.5rem',
            right: '1.5rem',
            zIndex: 90,
            maxWidth: '460px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div className={`alert-banner ${notification.type}`} style={{ boxShadow: 'var(--shadow-card)' }}>
            {notification.type === 'success' && <CheckCircle2 size={18} className="alert-icon" color="#10b981" />}
            {notification.type === 'warning' && <AlertCircle size={18} className="alert-icon" color="#ff7300" />}
            {notification.type === 'error' && <AlertCircle size={18} className="alert-icon" color="#f43f5e" />}
            <div>{notification.message}</div>
          </div>
        </div>
      )}

      <main className="container" style={{ flex: 1 }}>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-pill">
            <Sparkles size={14} color="var(--accent-orange)" />
            <span>Open Source Hacktoberfest 2026 Initiative</span>
          </div>

          <h1 className="hero-title">
            Forge Production-Grade <br />
            <span className="gradient-text">AI Agent Skills in Seconds</span>
          </h1>

          <p className="hero-subtitle">
            Create standardized, reusable <code>SKILL.md</code> definitions with validated YAML frontmatter
            for autonomous coding agents using hosted open-weight language models.
          </p>
        </section>

        {/* Feature Highlights Grid */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div
            className="glass-card"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 115, 0, 0.15)',
                padding: '0.6rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent-orange)',
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Open-Weight LLMs</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Powered by Llama 3.3, Mistral, and DeepSeek endpoints
              </div>
            </div>
          </div>

          <div
            className="glass-card"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '0.6rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent-emerald)',
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Automated Validation</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Checks YAML frontmatter, required fields, and schema
              </div>
            </div>
          </div>

          <div
            className="glass-card"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                padding: '0.6rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent-purple)',
              }}
            >
              <Terminal size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Full ZIP & MD Export</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Ready to plug into Claude Code, Antigravity, or Cursor
              </div>
            </div>
          </div>
        </section>

        {/* Main Workspace: Form on Left, Output/Preview on Right */}
        <section className="workspace-grid">
          <SkillPromptForm
            onGenerate={handleGenerate}
            onLoadSample={handleLoadSample}
            isLoading={isGenerating}
            isAiConfigured={isAiConfigured}
            onOpenConfig={() => setIsConfigModalOpen(true)}
          />

          <SkillPreview
            skillContent={skillContent}
            validation={validation}
            onContentChange={setSkillContent}
            onRevalidate={handleRevalidate}
            onDownloadMd={handleDownloadMd}
            onExportZip={handleExportZip}
            isExportingZip={isExportingZip}
            isDownloadingMd={isDownloadingMd}
            isValidating={isValidating}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <span>Built with</span>
            <Heart size={14} color="var(--accent-orange)" fill="var(--accent-orange)" />
            <span>for <strong>Hacktoberfest 2026</strong></span>
          </div>
          <div>
            SkillForge AI is open-source software under the MIT License. Ready for deployment on{' '}
            <strong style={{ color: 'var(--accent-cyan)' }}>DigitalOcean App Platform</strong>.
          </div>
        </div>
      </footer>

      {/* Config Modal */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        healthData={healthData}
        onRefreshHealth={fetchHealth}
        isRefreshing={isRefreshingHealth}
      />
    </>
  );
}
