import React, { useState } from 'react';

export default function HeroInput({ onScan, isScanning, error }) {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('quick');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || isScanning) return;
    onScan(url.trim(), mode);
  };

  return (
    <section className="hero">
      <div className="shell">
        <h1>
          See exactly what's costing <br />
          <span className="soft">this site conversions</span>
        </h1>
        <p className="hero-copy">
          An objective, read-only technical inspection across mobile friction, conversion anchor integrity,
          frontend latency, SSL/DNS reliability, and SEO discoverability.
        </p>

        <div className="scan-form-wrap">
          <form className="scan-form" onSubmit={handleSubmit}>
            <input
              type="text"
              id="urlInput"
              className="scan-input"
              placeholder="e.g. acme-plumbing.com or https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isScanning}
              autoComplete="off"
              spellCheck="false"
              required
            />

            <div className="mode-selector">
              <label htmlFor="scanMode" className="mode-label">Mode:</label>
              <select
                id="scanMode"
                className="mode-select"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                disabled={isScanning}
              >
                <option value="quick">Quick (Public Checks)</option>
                <option value="deep">Deep (Full Lighthouse)</option>
              </select>
            </div>

            <button
              type="submit"
              className="scan-submit-btn"
              id="scanBtn"
              disabled={isScanning || !url.trim()}
            >
              <span>{isScanning ? 'Inspecting…' : 'Run Audit'}</span>
            </button>
          </form>

          <div className="scan-notes">
            <span>No account required · Read-only inspection · The report shows the evidence.</span>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <span className="error-tag">INSPECTION HALTED</span>
              <div className="error-message">
                <strong>{error.title}:</strong> {error.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
