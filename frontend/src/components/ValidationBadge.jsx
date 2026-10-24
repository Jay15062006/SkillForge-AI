import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, FileCheck, Info } from 'lucide-react';

export default function ValidationBadge({ validation }) {
  if (!validation) return null;

  const { valid, errors = [], warnings = [], checks = [], stats = {} } = validation;

  return (
    <div className="validation-card">
      <div className="validation-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FileCheck size={18} color={valid ? 'var(--accent-emerald)' : 'var(--accent-rose)'} />
          <strong style={{ fontSize: '0.95rem' }}>YAML Frontmatter & Skill Specification</strong>
        </div>

        <div>
          {valid ? (
            <span className="badge-valid">
              <CheckCircle2 size={14} />
              <span>Specification Valid</span>
            </span>
          ) : (
            <span className="badge-invalid">
              <XCircle size={14} />
              <span>{errors.length} Validation {errors.length === 1 ? 'Error' : 'Errors'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Errors list */}
      {errors.length > 0 && (
        <div className="alert-banner error" style={{ marginBottom: '0.85rem' }}>
          <XCircle size={18} className="alert-icon" color="#fb7185" />
          <div>
            <strong>Missing or Invalid Specifications:</strong>
            <ul style={{ marginTop: '0.3rem', paddingLeft: '1.2rem' }}>
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Warnings list */}
      {warnings.length > 0 && (
        <div className="alert-banner warning" style={{ marginBottom: '0.85rem' }}>
          <AlertCircle size={18} className="alert-icon" color="#ff7300" />
          <div>
            <strong>Recommendations & Guidelines:</strong>
            <ul style={{ marginTop: '0.3rem', paddingLeft: '1.2rem' }}>
              {warnings.map((warn, idx) => (
                <li key={idx}>{warn}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Checklist items */}
      <div className="check-list">
        {checks.map((check, idx) => (
          <div
            key={idx}
            className={`check-item ${check.passed ? 'passed' : 'failed'}`}
          >
            {check.passed ? (
              <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <XCircle size={16} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <div className="check-name">{check.name}</div>
              <div className="check-msg">{check.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick stats footer */}
      {stats && (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
          }}
        >
          <span>Lines: <strong>{stats.total_lines || 0}</strong></span>
          <span>Words: <strong>{stats.word_count || 0}</strong></span>
          <span>Characters: <strong>{stats.total_characters || 0}</strong></span>
          <span>Frontmatter: <strong>{stats.has_frontmatter ? 'Present' : 'None'}</strong></span>
        </div>
      )}
    </div>
  );
}
