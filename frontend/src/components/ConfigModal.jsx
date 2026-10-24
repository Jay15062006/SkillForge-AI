import React from 'react';
import { X, Key, ShieldCheck, RefreshCw, Server, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ConfigModal({ isOpen, onClose, healthData, onRefreshHealth, isRefreshing }) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isConfigured = healthData?.ai_inference?.configured;
  const provider = healthData?.ai_inference?.provider || 'groq';
  const model = healthData?.ai_inference?.model || 'llama-3.3-70b-versatile';
  const baseUrl = healthData?.ai_inference?.base_url || 'https://api.groq.com/openai/v1';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <div className="card-title-group">
            <Key size={20} className="card-title-icon" />
            <div>
              <div className="card-title">AI Provider & Environment Setup</div>
              <div className="card-subtitle">Zero-Leakage Backend Key Architecture</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.6rem' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="card-body">
          {/* Status Alert */}
          {isConfigured ? (
            <div className="alert-banner success">
              <CheckCircle2 size={18} className="alert-icon" color="#10b981" />
              <div>
                <strong>Provider Active & Connected!</strong>
                <div style={{ marginTop: '0.2rem', color: '#cbd5e1' }}>
                  The backend has loaded your API credentials securely from <code>backend/.env</code>.
                  Model: <strong>{model}</strong> via <strong>{provider}</strong>.
                </div>
              </div>
            </div>
          ) : (
            <div className="alert-banner warning">
              <AlertCircle size={18} className="alert-icon" color="#ff7300" />
              <div>
                <strong>API Key Required in Backend</strong>
                <div style={{ marginTop: '0.2rem', color: '#fed7aa' }}>
                  To generate new skills via hosted open-weight models, set your API key in the backend environment.
                  Keys are never exposed to the frontend or git.
                </div>
              </div>
            </div>
          )}

          {/* Current Config Specs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.6rem', color: 'var(--text-main)' }}>
              Current Backend Configuration
            </h4>
            <div
              style={{
                background: '#090d16',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Provider:</span>
                <span style={{ color: 'var(--accent-orange-light)' }}>{provider}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Model:</span>
                <span style={{ color: 'var(--accent-cyan)' }}>{model}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Endpoint:</span>
                <span style={{ color: 'var(--text-muted)' }}>{baseUrl}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>API Key Status:</span>
                <span style={{ color: isConfigured ? '#34d399' : '#fb7185', fontWeight: 600 }}>
                  {isConfigured ? '✓ Configured in backend/.env' : '✗ Unset (Required)'}
                </span>
              </div>
            </div>
          </div>

          {/* How to configure */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.6rem', color: 'var(--text-main)' }}>
              How to Configure Your API Key
            </h4>
            <ol
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                paddingLeft: '1.25rem',
                lineHeight: 1.7,
              }}
            >
              <li>
                Open the file <code style={{ color: '#38bdf8' }}>backend/.env</code> in your editor.
              </li>
              <li>
                Obtain a free or low-cost API key from any OpenAI-compatible open-weight host:
                <ul style={{ marginTop: '0.3rem', marginBottom: '0.3rem' }}>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Groq:</strong>{' '}
                    <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-orange-light)' }}>
                      console.groq.com
                    </a>{' '}
                    (e.g., <code>llama-3.3-70b-versatile</code>)
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Together AI:</strong>{' '}
                    <a href="https://api.together.ai" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-orange-light)' }}>
                      api.together.ai
                    </a>
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Hugging Face:</strong>{' '}
                    <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-orange-light)' }}>
                      huggingface.co
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                Set the variable: <code>INFERENCE_API_KEY=gsk_your_key_here</code>
              </li>
              <li>Save the file and click the "Refresh Status" button below.</li>
            </ol>
          </div>

          {/* Security Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
            }}
          >
            <ShieldCheck size={18} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Zero-Leakage Security:</strong> API keys reside strictly inside the Python FastAPI process
              environment and are never transmitted to client browsers or committed into Git.
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onRefreshHealth}
              disabled={isRefreshing}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spinner' : ''} />
              <span>{isRefreshing ? 'Checking Backend...' : 'Refresh Status'}</span>
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
