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
          <span className="section-tag">REMEDIATION PROGRESS</span>
          <span className="before-after-sub mono">
            Baseline: {formattedDate} (ID: {previousReportId})
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
        <div className="delta-card delta-card-main">
          <span className="delta-card-label">Overall Health Score</span>
          <div className="delta-main-val-wrap">
            <span className="delta-prev mono">{overall.previous}</span>
            <span className="delta-arrow">→</span>
            <span className="delta-curr mono">{overall.current}</span>
            {renderDiff(overall.diff)}
          </div>
        </div>

        {/* Category Breakdown Pills */}
        <div className="delta-card">
          <span className="delta-card-label">Performance</span>
          <div className="delta-sub-val-wrap mono">
            <span>{performance.previous} → {performance.current}</span>
            {renderDiff(performance.diff)}
          </div>
        </div>

        <div className="delta-card">
          <span className="delta-card-label">SEO & Crawl</span>
          <div className="delta-sub-val-wrap mono">
            <span>{seo.previous} → {seo.current}</span>
            {renderDiff(seo.diff)}
          </div>
        </div>

        <div className="delta-card">
          <span className="delta-card-label">Accessibility</span>
          <div className="delta-sub-val-wrap mono">
            <span>{accessibility.previous} → {accessibility.current}</span>
            {renderDiff(accessibility.diff)}
          </div>
        </div>

        <div className="delta-card">
          <span className="delta-card-label">Security & TLS</span>
          <div className="delta-sub-val-wrap mono">
            <span>{security.previous} → {security.current}</span>
            {renderDiff(security.diff)}
          </div>
        </div>
      </div>
    </div>
  );
}
