import React, { useState } from 'react';
import { Sparkles, Terminal, Wand2, Layers, Tag, AlertTriangle, ArrowRight, FileCheck } from 'lucide-react';

const STARTER_PROMPTS = [
  {
    name: 'github-pr-reviewer',
    category: 'Code Review & QA',
    prompt:
      'An autonomous skill that reviews GitHub pull requests: inspects git diffs, highlights breaking changes, flags security issues, checks unit test coverage, and writes a constructive markdown summary review.',
  },
  {
    name: 'docker-optimizer',
    category: 'DevOps & Containers',
    prompt:
      'An agent skill that audits Dockerfiles and container configs: suggests multi-stage builds, non-root user setup, minimal base images (Alpine/Distroless), and cache-efficient layer ordering.',
  },
  {
    name: 'postgres-tuner',
    category: 'Database & SQL',
    prompt:
      'A skill for analyzing PostgreSQL query performance: parses EXPLAIN (ANALYZE, BUFFERS) outputs, detects sequential scans on large tables, recommends composite B-Tree/GIN indexes, and suggests connection pooling tweaks.',
  },
  {
    name: 'api-security-fuzzer',
    category: 'Security & Auditing',
    prompt:
      'A security auditing skill for REST and GraphQL APIs: generates boundary edge cases, checks authentication headers, verifies rate limiting, tests for IDOR and SQL injection vulnerabilities.',
  },
];

const CATEGORIES = [
  'General Agent Skill',
  'Code Review & QA',
  'DevOps & Containers',
  'Database & SQL',
  'Security & Auditing',
  'Frontend & UI/UX',
  'Cloud & Kubernetes',
  'Data Engineering & ETL',
];

export default function SkillPromptForm({
  onGenerate,
  onLoadSample,
  isLoading,
  isAiConfigured,
  onOpenConfig,
}) {
  const [prompt, setPrompt] = useState('');
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerate({
      prompt: prompt.trim(),
      skill_name: skillName.trim() || undefined,
      category: category || undefined,
    });
  };

  const applyStarter = (starter) => {
    setPrompt(starter.prompt);
    setSkillName(starter.name);
    setCategory(starter.category);
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-title-group">
          <Wand2 size={20} className="card-title-icon" />
          <div>
            <div className="card-title">Define Your AI Agent Skill</div>
            <div className="card-subtitle">Generate production-grade SKILL.md with open-weight models</div>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Warning if AI key is missing */}
        {!isAiConfigured && (
          <div
            className="alert-banner warning"
            style={{ cursor: 'pointer', marginBottom: '1.25rem' }}
            onClick={onOpenConfig}
            title="Click to view setup instructions"
          >
            <AlertTriangle size={18} className="alert-icon" color="#ff7300" />
            <div>
              <strong>Inference Key Not Configured:</strong> The backend requires an API key in{' '}
              <code>backend/.env</code> to generate new skills.
              <span
                style={{
                  display: 'block',
                  marginTop: '0.25rem',
                  textDecoration: 'underline',
                  fontWeight: 600,
                }}
              >
                Click here for setup instructions →
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Skill Description Textarea */}
          <div className="form-group">
            <label className="form-label" htmlFor="skill-prompt-input">
              <span>Skill Capability & Workflow Description <span style={{ color: 'var(--accent-orange)' }}>*</span></span>
              <span className="label-hint">What should the agent do?</span>
            </label>
            <textarea
              id="skill-prompt-input"
              className="input-field"
              placeholder="Describe the skill requirements in detail. For example: An agent skill that scans git diffs, detects breaking schema changes, formats Markdown changelogs, and drafts release notes for semantic versioning..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              rows={6}
            />

            {/* Quick Starters */}
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', fontWeight: 600 }}>
                QUICK TEMPLATES & INSPIRATION:
              </div>
              <div className="starter-chips">
                {STARTER_PROMPTS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className="chip-btn"
                    onClick={() => applyStarter(item)}
                    title={`Load "${item.name}" template`}
                  >
                    <Sparkles size={12} color="var(--accent-orange)" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Name & Category Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="skill-name-input">
                <span>Skill Identifier</span>
                <span className="label-hint">kebab-case</span>
              </label>
              <input
                id="skill-name-input"
                type="text"
                className="input-field"
                placeholder="e.g., git-pr-reviewer"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="skill-category-select">
                <span>Category / Domain</span>
                <span className="label-hint">Optional</span>
              </label>
              <select
                id="skill-category-select"
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Skill Button */}
          <button
            id="generate-skill-btn"
            type="submit"
            className="btn-primary"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ display: 'inline-block' }}>
                  <Sparkles size={18} />
                </div>
                <span>Forging Agent Skill with Open-Weight LLM...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Skill (SKILL.md)</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Quick Verified Sample Skill Loader */}
          {onLoadSample && (
            <div style={{ marginTop: '0.85rem' }}>
              <button
                id="load-sample-btn"
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
                onClick={onLoadSample}
                title="Load a complete, verified SKILL.md into the editor to test validation and export"
              >
                <FileCheck size={15} color="var(--accent-emerald)" />
                <span>Load Verified Sample Skill into Workspace</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
