import React from 'react';

export default function RevenueImpact({ revenueImpact, findings }) {
  if (!revenueImpact && (!findings || findings.length === 0)) return null;

  // Derive highest-impact finding if revenueImpact isn't explicitly supplied
  const criticalIssues = findings?.filter(f => f.severity?.toLowerCase() === 'critical') || [];
  const warningIssues = findings?.filter(f => f.severity?.toLowerCase() === 'warning') || [];

  const title = revenueImpact?.title || (
    criticalIssues.length > 0
      ? 'LEAD & REVENUE LEAKAGE DETECTED'
      : warningIssues.length > 0
      ? 'CONVERSION FRICTION IDENTIFIED'
      : 'TECHNICAL FOUNDATION VERIFIED'
  );

  const description = revenueImpact?.description || (
    criticalIssues.length > 0
      ? `${criticalIssues[0].headline}: ${criticalIssues[0].businessImpact || criticalIssues[0].businessConsequence || 'Impedes lead capture and causes bounce.'}`
      : warningIssues.length > 0
      ? `${warningIssues[0].headline}: ${warningIssues[0].businessImpact || warningIssues[0].businessConsequence || 'Causes conversion friction.'}`
      : 'The public surface shows healthy signals. Review the 84-point manual inspection playbook to audit access-gated funnels, GHL forms, and actual mobile device experiences.'
  );

  return (
    <section className="revenue-callout shell" aria-label="Commercial & Conversion Risk">
      <div className="revenue-callout-header">
        <span className="revenue-tag">COMMERCIAL IMPACT</span>
        <h3 className="revenue-title">{title}</h3>
      </div>
      <p className="revenue-description">{description}</p>
      <div className="revenue-disclosure mono" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
        * Note: Commercial impact describes verified technical friction points (e.g. broken click-to-call links, dead form anchors, missing security certificates) that cause prospect bounce. Webarg never guesses unverified dollar revenue or traffic losses.
      </div>
    </section>
  );
}
