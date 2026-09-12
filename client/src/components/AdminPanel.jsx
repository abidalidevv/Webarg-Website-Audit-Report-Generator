import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000';

export default function AdminPanel({ onNavigateHome }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('webarg_admin_token') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Dashboard State
  const [reports, setReports] = useState([]);
  const [config, setConfig] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [browserlessKeyInput, setBrowserlessKeyInput] = useState('');
  const [configMessage, setConfigMessage] = useState('');

  useEffect(() => {
    if (token) {
      loadAdminData();
    }
  }, [token]);

  const loadAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [reportsRes, configRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin-api/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/admin-api/config`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (reportsRes.status === 401 || configRes.status === 401) {
        handleLogout();
        return;
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin-api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      sessionStorage.setItem('webarg_admin_token', data.token);
      setToken(data.token);
      setPasswordInput('');
    } catch (err) {
      setLoginError(err.message || 'Access denied.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (token) {
      fetch(`${API_BASE_URL}/admin-api/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    sessionStorage.removeItem('webarg_admin_token');
    setToken('');
    setReports([]);
    setConfig(null);
  };

  const handleDeleteReport = async (reportId, targetUrl) => {
    if (!window.confirm(`Permanently delete audit report for "${targetUrl}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin-api/reports/${reportId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      } else {
        alert('Failed to delete report.');
      }
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/admin-api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          browserlessApiKey: browserlessKeyInput
        })
      });

      const data = await res.json();
      if (res.ok) {
        setConfigMessage('Browserless API key updated successfully.');
        setBrowserlessKeyInput('');
        loadAdminData();
        setTimeout(() => setConfigMessage(''), 3000);
      } else {
        alert(data.error || 'Failed to update config.');
      }
    } catch (err) {
      alert(`Config error: ${err.message}`);
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'pass';
    if (score >= 50) return 'warning';
    return 'critical';
  };

  // 1. Password Login Gate
  if (!token) {
    return (
      <div className="admin-gate-wrap">
        <div className="admin-gate-card">
          <div className="admin-gate-brand">
            <div className="logo-mark" aria-hidden="true" />
            <span>WEBARG / ADMIN CONSOLE</span>
          </div>

          <h2 className="admin-gate-title">ENTER ACCESS KEY</h2>
          <p className="admin-gate-sub">
            Password-gated administration console for developer Abid. Enforces server credential verification.
          </p>

          <form onSubmit={handleLogin} className="admin-gate-form">
            <input
              type="password"
              className="admin-password-input mono"
              placeholder="Enter ADMIN_PASSWORD"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              disabled={isLoggingIn}
              autoFocus
              required
            />

            <button
              type="submit"
              className="admin-gate-btn"
              disabled={isLoggingIn || !passwordInput}
            >
              {isLoggingIn ? 'Authenticating…' : 'Unlock Admin Console'}
            </button>
          </form>

          {loginError && (
            <div className="admin-gate-error" role="alert">
              <span className="error-tag">ACCESS REJECTED</span>
              <span>{loginError}</span>
            </div>
          )}

          <div className="admin-gate-footer">
            <button type="button" onClick={onNavigateHome} className="admin-back-link">
              ← Return to Public Auditor
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Admin Dashboard
  return (
    <div className="admin-dashboard">
      {/* Top Navbar */}
      <header className="admin-nav">
        <div className="shell admin-nav-inner">
          <div className="admin-nav-brand">
            <div className="logo-mark" aria-hidden="true" />
            <span className="admin-nav-title">WEBARG / ADMIN CONTROL CONSOLE</span>
          </div>

          <div className="admin-nav-actions">
            <button type="button" onClick={onNavigateHome} className="btn-secondary">
              Public Scanner
            </button>
            <button type="button" onClick={handleLogout} className="btn-secondary">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="shell admin-main">
        {/* System & API Configuration Box */}
        <section className="admin-config-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">SYSTEM STATUS &amp; API RUNTIME</h3>
            <span className="admin-section-note mono">ENV CONFIGURATION</span>
          </div>

          <div className="admin-config-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-label">AUDIT REPORTS ON DISK</div>
              <div className="admin-stat-num mono">{reports.length}</div>
              <div className="admin-stat-sub">Persisted in /server/data/reports</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-label">ENGINE UPTIME</div>
              <div className="admin-stat-num mono">
                {config ? `${Math.round(config.system.uptimeSeconds / 60)}m` : '—'}
              </div>
              <div className="admin-stat-sub">Node.js {config?.system.nodeVersion}</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-label">BROWSERLESS STATUS</div>
              <div className="admin-stat-num mono" style={{ fontSize: '20px' }}>
                {config?.browserless.isConfigured ? 'CONNECTED' : 'LOCAL FALLBACK'}
              </div>
              <div className="admin-stat-sub">
                {config?.browserless.isConfigured
                  ? `Key: ${config.browserless.maskedKey}`
                  : 'Using local Chrome binary'}
              </div>
            </div>
          </div>

          {/* Browserless Key Update Form */}
          <form onSubmit={handleSaveConfig} className="admin-api-key-form">
            <div className="admin-api-key-fields">
              <label htmlFor="browserlessInput" className="admin-field-label mono">
                UPDATE BROWSERLESS.IO API KEY (LIVE RUNTIME UPDATE):
              </label>
              <div className="admin-api-input-wrap">
                <input
                  id="browserlessInput"
                  type="password"
                  className="admin-api-input mono"
                  placeholder="Paste Browserless.io API Token here..."
                  value={browserlessKeyInput}
                  onChange={(e) => setBrowserlessKeyInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!browserlessKeyInput.trim()}
                >
                  Apply Key
                </button>
              </div>
            </div>
            {configMessage && (
              <div className="admin-config-success mono">{configMessage}</div>
            )}
          </form>
        </section>

        {/* Scan History Table */}
        <section className="admin-history-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">AUDIT SCAN HISTORY</h3>
            <span className="admin-section-note mono">
              {reports.length} STORED REPORTS
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="admin-empty-table mono">
              No audit scans recorded yet. Run an audit on the public homepage to record reports.
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>TARGET URL</th>
                    <th>MODE</th>
                    <th>TIMESTAMP</th>
                    <th>HEALTH SCORE</th>
                    <th>FINDINGS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td className="admin-cell-url">
                        <a
                          href={`/report/${r.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-url-link mono"
                          title={r.targetUrl}
                        >
                          {r.targetUrl}
                        </a>
                      </td>
                      <td className="mono" style={{ textTransform: 'uppercase' }}>
                        {r.mode}
                      </td>
                      <td className="mono admin-cell-date">
                        {new Date(r.timestamp).toLocaleDateString()} {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <span className={`score-badge ${getScoreBadgeClass(r.overallScore)} mono`}>
                          {r.overallScore} · {r.overallStatus || 'HEALTH'}
                        </span>
                      </td>
                      <td className="mono">{r.findingsCount} issues</td>
                      <td className="admin-cell-actions">
                        <a
                          href={`/report/${r.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn-action"
                        >
                          View
                        </a>
                        <a
                          href={`${API_BASE_URL}/report/${r.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn-action"
                        >
                          PDF
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteReport(r.id, r.targetUrl)}
                          className="admin-btn-delete"
                          title="Delete report from disk"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
