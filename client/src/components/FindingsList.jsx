import React from 'react';

export default function FindingsList({ findings = [], isPrintView = false }) {
  if (!findings || findings.length === 0) return null;

  // Group findings by major domains
  const categories = [
    { key: 'conversion', label: 'Conversion & Lead Paths' },
    { key: 'performance', label: 'Performance & Speed' },
    { key: 'asset', label: 'Asset Pipeline & Images' },
    { key: 'seo', label: 'SEO & Structured Identity' },
    { key: 'accessibility', label: 'Accessibility & Semantics' },
    { key: 'security', label: 'Security & Connection Reliability' },
    { key: 'legal', label: 'Legal, Trust & Compliance' }
  ];

  const getSeverityBadgeClass = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'warning':
        return 'warning';
      case 'pass':
      case 'healthy':
        return 'pass';
      default:
        return 'warning';
    }
  };

  return (
    <section className="findings-section shell" aria-label="Universal Findings Registry">
      <div className="section-head">
        <div>
          <span className="section-tag">EVIDENCE-BASED REGISTRY</span>
          <h3 className="section-heading">DETAILED AUDIT FINDINGS</h3>
        </div>
        <div className="section-note">
          {findings.length} VERIFIED CHECKS · UNIVERSAL FINDING SCHEMA (SECTION 83)
        </div>
      </div>

      {categories.map((cat) => {
        const catFindings = findings.filter((f) =>
          f.category?.toLowerCase().includes(cat.key)
        );

        if (catFindings.length === 0) return null;

        return (
          <div key={cat.key} className="finding-group">
            <div className="finding-group-title">
              <span>{cat.label}</span>
              <span className="finding-group-count">{catFindings.length} checks</span>
            </div>

            {cat.key === 'accessibility' && (
              <div className="honesty-note-callout">
                <span className="honesty-tag">ACCESSIBILITY HONESTY NOTE:</span>
                <span> Automated tools (Lighthouse + axe-core) catch a meaningful but partial slice (~30–40%) of real accessibility barriers. A clean automated pass does not guarantee full WCAG compliance. Screen-reader walkthroughs, focus-trapping, and cognitive load require Abid's manual audit service.</span>
              </div>
            )}

            {cat.key === 'conversion' && (
              <div className="honesty-note-callout">
                <span className="honesty-tag">CONTACT LINK DISCLOSURE:</span>
                <span> Automated inspection verifies syntactic DOM formatting (tel:, mailto:, wa.me), not that a human tapped the button on a physical smartphone or that ring-through/CRM webhook automations executed.</span>
              </div>
            )}

            {catFindings.map((item, idx) => (
              <details
                key={item.id || `${cat.key}-${idx}`}
                className="issue-accordion"
                open={isPrintView || item.severity === 'critical'}
              >
                <summary className="issue-summary">
                  <span className={`issue-badge ${getSeverityBadgeClass(item.severity)}`}>
                    {item.severity}
                  </span>
                  <div className="issue-title-wrap">
                    <div className="issue-name">{item.headline}</div>
                    {item.businessImpact && (
                      <div className="issue-consequence">
                        <strong>Commercial Risk:</strong> {item.businessImpact}
                      </div>
                    )}
                  </div>
                  <span className="issue-category-tag mono">{item.effort ? `Effort: ${item.effort}` : cat.label}</span>
                  <span className="issue-chevron" aria-hidden="true">›</span>
                </summary>

                <div className="issue-body-wrapper">
                  <div className="issue-body">
                    {item.userImpact && (
                      <div className="finding-detail-row">
                        <span className="finding-detail-label">User Experience Impact:</span>
                        <p className="finding-detail-text">{item.userImpact}</p>
                      </div>
                    )}

                    {item.businessImpact && (
                      <div className="finding-detail-row">
                        <span className="finding-detail-label">Commercial / Revenue Impact:</span>
                        <p className="finding-detail-text">{item.businessImpact}</p>
                      </div>
                    )}

                    {item.evidence && (
                      <div className="issue-evidence-block">
                        <div className="issue-evidence-label">Technical Evidence (Public DOM / Network):</div>
                        <pre className="issue-evidence-code">
                          {typeof item.evidence === 'object'
                            ? JSON.stringify(item.evidence, null, 2)
                            : item.evidence}
                        </pre>
                      </div>
                    )}

                    {item.recommendation && (
                      <div className="issue-recommendation-block">
                        <div className="issue-recommendation-label">Remediation Action:</div>
                        <div className="issue-recommendation-text">{item.recommendation}</div>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            ))}
          </div>
        );
      })}
    </section>
  );
}
