import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import BeforeAfterComparison from './BeforeAfterComparison';

export default function ExecutiveSummary({ report }) {
  const overallRef = useRef(null);
  const perfRef = useRef(null);
  const convRef = useRef(null);
  const seoRef = useRef(null);
  const secRef = useRef(null);

  useEffect(() => {
    if (!report || !report.scores) return;

    const animateNumber = (ref, target) => {
      if (!ref.current) return;
      const valObj = { v: 0 };
      gsap.to(valObj, {
        v: target,
        duration: 0.95,
        ease: 'power2.out',
        onUpdate: () => {
          if (ref.current) ref.current.textContent = Math.round(valObj.v);
        }
      });
    };

    animateNumber(overallRef, report.scores.overall ?? 0);
    animateNumber(perfRef, report.scores.performance ?? 0);
    animateNumber(convRef, report.scores.conversion ?? 0);
    animateNumber(seoRef, report.scores.seo ?? 0);
    animateNumber(secRef, report.scores.security ?? 0);
  }, [report]);

  if (!report) return null;

  const getStatusClass = (score) => {
    if (score >= 80) return 'pass';
    if (score >= 50) return 'warning';
    return 'critical';
  };

  const getStatusWord = (score) => {
    if (score >= 80) return 'HEALTHY';
    if (score >= 50) return 'NEEDS ATTENTION';
    return 'AT RISK';
  };

  const overallScore = report.scores?.overall ?? 0;
  const overallStatusClass = getStatusClass(overallScore);

  return (
    <div className="report-summary-wrap">
      {/* Before/After Remediation Score Delta (Sales Close moment) */}
      <BeforeAfterComparison comparison={report.comparison} />

      <div className="report-head shell">
        <div>
          <div className="report-meta-tag">
            INSPECTION REPORT ID #{report.id?.slice(0, 8).toUpperCase()}
            {report.businessName && ` • ${report.businessName.toUpperCase()}`}
          </div>
          <h2 className="report-title">
            {report.businessName ? `${report.businessName} — TECHNICAL AUDIT` : 'AUDIT FINDINGS'}
          </h2>
          <div className="report-url-sub">{report.targetUrl}</div>
        </div>

        <div className="report-state-badge">
          <div className="report-status-dot">● VERIFIED LIVE SCAN</div>
          <div className="report-timestamp">
            {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="score-strip shell" aria-label="Executive Health Metrics">
        <div className="score-overall">
          <div className="score-overall-main">
            <div className="score-overall-num-wrap">
              <span className="score-overall-num" ref={overallRef}>0</span>
              <sub className="score-unit-overall">/100</sub>
            </div>
            <div className={`score-overall-word text-${overallStatusClass}`}>
              {report.overallStatus || getStatusWord(overallScore)}
            </div>
          </div>
          <div className="score-overall-label">Overall Health Assessment</div>
          <div className="score-overall-sub">
            Combined technical diagnosis of lead conversion friction, frontend latency, crawler accessibility, and connection security.
          </div>
        </div>

        <div className="score-card">
          <div className="score-card-main">
            <span className="score-card-num" ref={convRef}>0</span>
            <sub className="score-unit">/100</sub>
          </div>
          <div className="score-card-label">
            Conversion Health
            <span className="mono" style={{ fontSize: '9px', color: 'var(--accent)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
              [Derived Heuristic]
            </span>
          </div>
          <div className={`score-badge ${getStatusClass(report.scores?.conversion)}`}>
            {getStatusWord(report.scores?.conversion)}
          </div>
        </div>

        <div className="score-card">
          <div className="score-card-main">
            <span className="score-card-num" ref={perfRef}>0</span>
            <sub className="score-unit">/100</sub>
          </div>
          <div className="score-card-label">
            Performance &amp; CWV
            <span className="mono" style={{ fontSize: '9px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
              [Measured CWV]
            </span>
          </div>
          <div className={`score-badge ${getStatusClass(report.scores?.performance)}`}>
            {getStatusWord(report.scores?.performance)}
          </div>
        </div>

        <div className="score-card">
          <div className="score-card-main">
            <span className="score-card-num" ref={seoRef}>0</span>
            <sub className="score-unit">/100</sub>
          </div>
          <div className="score-card-label">
            SEO &amp; Identity
            <span className="mono" style={{ fontSize: '9px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
              [Measured Spec]
            </span>
          </div>
          <div className={`score-badge ${getStatusClass(report.scores?.seo)}`}>
            {getStatusWord(report.scores?.seo)}
          </div>
        </div>

        <div className="score-card">
          <div className="score-card-main">
            <span className="score-card-num" ref={secRef}>0</span>
            <sub className="score-unit">/100</sub>
          </div>
          <div className="score-card-label">
            Security &amp; Headers
            <span className="mono" style={{ fontSize: '9px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
              [Measured SSL/TLS]
            </span>
          </div>
          <div className={`score-badge ${getStatusClass(report.scores?.security)}`}>
            {getStatusWord(report.scores?.security)}
          </div>
        </div>
      </div>
    </div>
  );
}
