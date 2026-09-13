import React from 'react';

/**
 * Renders the Before/After Remediation Score Delta strip
 * (Sales close moment: "Previous: 58 → Current: 91, +33 pts")
 */
export default function BeforeAfterComparison({ comparison }) {
  if (!comparison || !comparison.overall) return null;

  const { overall, performance, seo, accessibility, security, resolvedFindingsCount, previousTimestamp, previousReportId } = comparison;

  const renderDiff = (diff) => {
    if (diff > 0) return <span className="delta-badge delta-pos">+{diff} pts</span>;
    if (diff < 0) return <span className="delta-badge delta-neg">{diff} pts</span>;
    return <span className="delta-badge delta-zero">0 pts</span>;
  };

  const formattedDate = previousTimestamp ? new Date(previousTimestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'Prior Scan';

  return (
    <div className="before-after-strip shell" aria-label="Remediation Score Delta">
      <div className="before-after-header">
        <div className="before-after-tag-wrap">
          <span className="section-tag">MEASURED SCAN COMPARISON</span>
          <span className="before-after-sub mono">
            Verified Baseline: {formattedDate} (ID: #{previousReportId}) → Current Scan
          </span>
        </div>
        {resolvedFindingsCount > 0 && (
          <div className="resolved-pill mono">
            <span className="resolved-check">✓</span>
            <strong>{resolvedFindingsCount}</strong> issues resolved
          </div>
        )}
      </div>

      <div className="delta-grid">
        {/* Overall Score Jump Card */}
        {overall && (
          <div className="delta-card delta-card-main">
            <span className="delta-card-label">Overall Health Score</span>
            <div className="delta-main-val-wrap">
              <span className="delta-prev mono">{overall.previous ?? '—'}</span>
              <span className="delta-arrow">→</span>
              <span className="delta-curr mono">{overall.current ?? '—'}</span>
              {renderDiff(overall.diff)}
            </div>
          </div>
        )}

        {/* Category Breakdown Pills with individual null-safety */}
        {performance && (typeof performance.previous === 'number' || typeof performance.current === 'number') && (
          <div className="delta-card">
            <span className="delta-card-label">Performance</span>
            <div className="delta-sub-val-wrap mono">
              <span>{performance.previous ?? '—'} → {performance.current ?? '—'}</span>
              {renderDiff(performance.diff)}
            </div>
          </div>
        )}

        {seo && (typeof seo.previous === 'number' || typeof seo.current === 'number') && (
          <div className="delta-card">
            <span className="delta-card-label">SEO &amp; Crawl</span>
            <div className="delta-sub-val-wrap mono">
              <span>{seo.previous ?? '—'} → {seo.current ?? '—'}</span>
              {renderDiff(seo.diff)}
            </div>
          </div>
        )}

        {accessibility && (typeof accessibility.previous === 'number' || typeof accessibility.current === 'number') && (
          <div className="delta-card">
            <span className="delta-card-label">Accessibility</span>
            <div className="delta-sub-val-wrap mono">
              <span>{accessibility.previous ?? '—'} → {accessibility.current ?? '—'}</span>
              {renderDiff(accessibility.diff)}
            </div>
          </div>
        )}

        {security && (typeof security.previous === 'number' || typeof security.current === 'number') && (
          <div className="delta-card">
            <span className="delta-card-label">Security &amp; TLS</span>
            <div className="delta-sub-val-wrap mono">
              <span>{security.previous ?? '—'} → {security.current ?? '—'}</span>
              {renderDiff(security.diff)}
            </div>
          </div>
        )}
      </div>

      <div className="before-after-disclosure mono" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
        * Measured score delta between two real, independently saved scans of this domain. This is not an estimated or predicted projection.
      </div>
    </div>
  );
}
