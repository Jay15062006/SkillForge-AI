import React, { useState, useEffect } from 'react';
import {
  FileText,
  Code,
  CheckCircle,
  Copy,
  Download,
  Archive,
  RefreshCw,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { marked } from 'marked';
import ValidationBadge from './ValidationBadge';

export default function SkillPreview({
  skillContent,
  validation,
  onContentChange,
  onRevalidate,
  onDownloadMd,
  onExportZip,
  isExportingZip,
  isDownloadingMd,
  isValidating,
}) {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'code' | 'frontmatter' | 'validation'
  const [copied, setCopied] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState('');

  // Configure marked safely
  useEffect(() => {
    if (skillContent) {
      try {
        const html = marked.parse(skillContent, { gfm: true, breaks: true });
        setRenderedHtml(html);
      } catch (err) {
        setRenderedHtml(`<pre>${skillContent}</pre>`);
      }
    } else {
      setRenderedHtml('');
    }
  }, [skillContent]);

  const handleCopy = async () => {
    if (!skillContent) return;
    try {
      await navigator.clipboard.writeText(skillContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const skillName = validation?.frontmatter?.name || 'custom-skill';

  if (!skillContent) {
    return (
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title-group">
            <FileText size={20} className="card-title-icon" />
            <div>
              <div className="card-title">Skill Specification Output</div>
              <div className="card-subtitle">Generated SKILL.md will appear here</div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="empty-state">
            <Sparkles className="empty-icon" />
            <div className="empty-title">Ready to Forge Your First Skill</div>
            <p className="empty-desc">
              Describe your AI agent capability on the left, or pick one of the quick templates to generate
              a standard <code>SKILL.md</code> definition with validated YAML frontmatter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      {/* Card Header & Export Action Buttons */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="card-title-group">
          <FileText size={20} className="card-title-icon" />
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{skillName}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'normal' }}>
                / SKILL.md
              </span>
            </div>
            <div className="card-subtitle">
              {validation?.valid ? (
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  ✓ YAML Validated Specification
                </span>
              ) : (
                <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                  ⚠ Validation Issues Detected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Copy Button */}
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopy}
            title="Copy SKILL.md to clipboard"
          >
            {copied ? <CheckCircle size={15} color="var(--accent-emerald)" /> : <Copy size={15} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Download MD Button */}
          <button
            id="download-md-btn"
            type="button"
            className="btn-secondary"
            onClick={onDownloadMd}
            disabled={isDownloadingMd}
            title="Download SKILL.md file"
          >
            <Download size={15} />
            <span>{isDownloadingMd ? 'Downloading...' : 'Download SKILL.md'}</span>
          </button>

          {/* Export ZIP Button */}
          <button
            id="export-zip-btn"
            type="button"
            className="btn-primary"
            style={{ width: 'auto', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
            onClick={onExportZip}
            disabled={isExportingZip}
            title="Export complete agent skill ZIP directory"
          >
            <Archive size={15} />
            <span>{isExportingZip ? 'Packaging ZIP...' : 'Export Skill ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <FileText size={15} />
          <span>Markdown Preview</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          <Code size={15} />
          <span>Raw Editor (SKILL.md)</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'frontmatter' ? 'active' : ''}`}
          onClick={() => setActiveTab('frontmatter')}
        >
          <Layers size={15} />
          <span>YAML Frontmatter</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: validation?.valid ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            }}
          />
          <span>Validation Checks ({validation?.errors?.length || 0})</span>
        </button>
      </div>

      {/* Tab Content Panes */}
      <div className="preview-container">
        {/* Tab 1: Rendered Markdown Preview */}
        {activeTab === 'preview' && (
          <div>
            {/* Frontmatter summary banner */}
            {validation?.frontmatter && (
              <div className="frontmatter-box">
                <div className="frontmatter-badge">YAML SPECIFICATION METADATA</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Name:</span>{' '}
                    <strong style={{ color: 'var(--accent-orange-light)' }}>
                      {validation.frontmatter.name}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Version:</span>{' '}
                    <span style={{ color: 'var(--text-main)' }}>
                      {validation.frontmatter.version || '1.0.0'}
                    </span>
                  </div>
                  {validation.frontmatter.tags && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Tags:</span>{' '}
                      {Array.isArray(validation.frontmatter.tags)
                        ? validation.frontmatter.tags.map((t, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-block',
                                background: 'rgba(255, 255, 255, 0.06)',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                marginRight: '0.4rem',
                                color: 'var(--accent-cyan)',
                                fontSize: '0.75rem',
                              }}
                            >
                              #{t}
                            </span>
                          ))
                        : String(validation.frontmatter.tags)}
                    </div>
                  )}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Description:</span>{' '}
                    <span style={{ color: '#cbd5e1' }}>{validation.frontmatter.description}</span>
                  </div>
                </div>
              </div>
            )}

            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        )}

        {/* Tab 2: Raw Code Editor */}
        {activeTab === 'code' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                You can edit the skill content below and validate in real-time.
              </span>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => onRevalidate(skillContent)}
                disabled={isValidating}
              >
                <RefreshCw size={13} className={isValidating ? 'spinner' : ''} />
                <span>{isValidating ? 'Validating...' : 'Validate Changes'}</span>
              </button>
            </div>
            <textarea
              className="raw-editor"
              value={skillContent}
              onChange={(e) => {
                onContentChange(e.target.value);
                onRevalidate(e.target.value);
              }}
              rows={22}
              spellCheck={false}
            />
          </div>
        )}

        {/* Tab 3: YAML Frontmatter Inspector */}
        {activeTab === 'frontmatter' && (
          <div>
            {validation?.frontmatter ? (
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                  Parsed YAML Frontmatter Object
                </h4>
                <pre
                  style={{
                    background: '#090d16',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.25rem',
                    color: '#38bdf8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    overflowX: 'auto',
                  }}
                >
                  {JSON.stringify(validation.frontmatter, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="alert-banner error">
                No valid YAML frontmatter found. Check the "Validation Checks" tab for details.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Validation Checklist */}
        {activeTab === 'validation' && (
          <ValidationBadge validation={validation} />
        )}
      </div>
    </div>
  );
}
