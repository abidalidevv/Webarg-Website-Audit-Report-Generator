import React from 'react';

export default function AccessLevelMatrix({ matrix = [] }) {
  if (!matrix || matrix.length === 0) return null;

  return (
    <section className="access-matrix-section shell" aria-label="Access Level & Transparency Matrix">
      <div className="section-head">
        <div>
          <span className="section-tag">AUDIT BOUNDARY &amp; TRANSPARENCY</span>
          <h3 className="section-heading">ACCESS LEVEL MATRIX</h3>
        </div>
        <div className="section-note">SECTION 80 OF WEBARG PLAYBOOK · ANTI-HALLUCINATION RULE</div>
      </div>

      <div className="matrix-table-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>INSPECTION SURFACE</th>
              <th>REQUIRED ACCESS</th>
              <th>STATUS</th>
              <th>AUDIT SCOPE &amp; CAPABILITIES</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, idx) => {
              const isLive = row.status === 'Audited Live';
              return (
                <tr key={idx} className={isLive ? 'row-live' : 'row-manual'}>
                  <td className="matrix-surface">
                    <strong>{row.surface}</strong>
                  </td>
                  <td className="matrix-access mono">{row.accessRequired}</td>
                  <td className="matrix-status">
                    <span className={`matrix-badge ${isLive ? 'badge-live' : 'badge-playbook'}`}>
                      {isLive ? '● AUDITED LIVE (URL)' : '🔒 MANUAL ONLY — NOT AUTOMATED'}
                    </span>
                  </td>
                  <td className="matrix-coverage">{row.coverage}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="matrix-footer-note">
        <strong>Anti-Hallucination Boundary:</strong> Webarg strictly audits the public URL surface (Level 1: 18 verified automated checks). Deeper access-gated funnels (GHL webhook automations, WordPress/PHP database, payment sandbox transactions, physical mobile dialers, assistive screen readers) require credentials and physical hardware — these are conducted personally by Abid as part of the 84-point manual inspection service.
      </div>
    </section>
  );
}
