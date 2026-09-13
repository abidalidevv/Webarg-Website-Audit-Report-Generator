import React from 'react';

/**
 * Helper to determine signal color based on numeric score
 */
function getScoreColor(score) {
  if (score >= 80) return '#4C7A5E'; // Muted sage green
  if (score >= 50) return '#B8863D'; // Muted ochre
  return '#C1432B'; // Muted brick red
}

function getScoreLabel(score) {
  if (score >= 80) return 'HEALTHY';
  if (score >= 50) return 'NEEDS WORK';
  return 'POOR';
}

/**
 * 1. Score Breakdown Horizontal Bar Chart (SVG)
 */
export function ScoreBreakdownChart({ scores = {} }) {
  const items = [
    { label: 'Performance', val: typeof scores?.performance === 'number' ? scores.performance : null },
    { label: 'SEO & Crawl', val: typeof scores?.seo === 'number' ? scores.seo : null },
    { label: 'Accessibility', val: typeof scores?.accessibility === 'number' ? scores.accessibility : null },
    { label: 'Security & TLS', val: typeof scores?.security === 'number' ? scores.security : null },
  ];

  return (
    <div className="graph-card">
      <div className="graph-card-header">
        <h4 className="graph-card-title">Score Breakdown by Category</h4>
        <span className="graph-card-meta mono">0–100 Diagnostic Scale</span>
      </div>

      <div className="graph-bars-wrap">
        {items.map((item) => {
          const hasVal = typeof item.val === 'number';
          const color = hasVal ? getScoreColor(item.val) : 'var(--muted)';
          const pct = hasVal ? Math.max(4, Math.min(100, item.val)) : 0;
          return (
            <div key={item.label} className="graph-bar-row">
              <div className="graph-bar-label-wrap">
                <span className="graph-bar-label">{item.label}</span>
                <span className="graph-bar-val mono" style={{ color }}>
                  {hasVal ? (
                    <>
                      {item.val}<sub className="graph-bar-sub">/100</sub>
                    </>
                  ) : (
                    '— (Not Measured)'
                  )}
                </span>
              </div>
              <svg
                viewBox="0 0 100 8"
                className="graph-bar-svg"
                preserveAspectRatio="none"
                aria-label={`${item.label} score: ${hasVal ? item.val : 'Not Measured'}`}
              >
                {/* Background Track */}
                <rect x="0" y="0" width="100" height="8" rx="2" fill="#181E27" />
                {/* Value Bar */}
                {hasVal && <rect x="0" y="0" width={pct} height="8" rx="2" fill={color} />}
              </svg>
            </div>
          );
        })}
      </div>

      <div className="graph-card-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#4C7A5E' }} />
          <span>Pass (80–100)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#B8863D' }} />
          <span>Warning (50–79)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#C1432B' }} />
          <span>Critical (&lt;50)</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Findings Severity Distribution Chart (SVG Donut + Legend)
 */
export function SeverityDistributionChart({ findings = [], summary = {} }) {
  const criticalCount = summary.critical ?? findings.filter((f) => f.severity?.toLowerCase() === 'critical').length;
  const warningCount = summary.warning ?? findings.filter((f) => f.severity?.toLowerCase() === 'warning').length;
  const passCount = summary.pass ?? findings.filter((f) => f.severity?.toLowerCase() === 'pass' || f.status === 'Verified').length;
  const total = Math.max(1, criticalCount + warningCount + passCount);

  // Donut geometry (radius 60 -> circumference ~376.99)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const critRatio = criticalCount / total;
  const warnRatio = warningCount / total;
  const passRatio = passCount / total;

  const critStroke = critRatio * circumference;
  const warnStroke = warnRatio * circumference;
  const passStroke = passRatio * circumference;

  const critOffset = 0;
  const warnOffset = -critStroke;
  const passOffset = -(critStroke + warnStroke);

  return (
    <div className="graph-card">
      <div className="graph-card-header">
        <h4 className="graph-card-title">Findings Severity Distribution</h4>
        <span className="graph-card-meta mono">{total} Verified Checks</span>
      </div>

      <div className="donut-layout">
        <div className="donut-svg-wrap">
          <svg viewBox="0 0 160 160" className="donut-svg" aria-label="Severity donut chart">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#181E27" strokeWidth="22" />

            {/* Pass Segment */}
            {passCount > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#4C7A5E"
                strokeWidth="22"
                strokeDasharray={`${passStroke} ${circumference - passStroke}`}
                strokeDashoffset={passOffset}
                transform="rotate(-90 80 80)"
              />
            )}

            {/* Warning Segment */}
            {warningCount > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#B8863D"
                strokeWidth="22"
                strokeDasharray={`${warnStroke} ${circumference - warnStroke}`}
                strokeDashoffset={warnOffset}
                transform="rotate(-90 80 80)"
              />
            )}

            {/* Critical Segment */}
            {criticalCount > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#C1432B"
                strokeWidth="22"
                strokeDasharray={`${critStroke} ${circumference - critStroke}`}
                strokeDashoffset={critOffset}
                transform="rotate(-90 80 80)"
              />
            )}

            {/* Center Label */}
            <text x="80" y="76" textAnchor="middle" className="donut-center-num mono">
              {total}
            </text>
            <text x="80" y="94" textAnchor="middle" className="donut-center-sub">
              AUDITED
            </text>
          </svg>
        </div>

        <div className="donut-legend">
          <div className="donut-legend-row">
            <div className="legend-label-col">
              <span className="legend-dot" style={{ background: '#C1432B' }} />
              <span className="legend-name">Critical Severity</span>
            </div>
            <div className="legend-val-col mono">
              <strong>{criticalCount}</strong>
              <span className="legend-pct">({Math.round(critRatio * 100)}%)</span>
            </div>
          </div>

          <div className="donut-legend-row">
            <div className="legend-label-col">
              <span className="legend-dot" style={{ background: '#B8863D' }} />
              <span className="legend-name">Warning Severity</span>
            </div>
            <div className="legend-val-col mono">
              <strong>{warningCount}</strong>
              <span className="legend-pct">({Math.round(warnRatio * 100)}%)</span>
            </div>
          </div>

          <div className="donut-legend-row">
            <div className="legend-label-col">
              <span className="legend-dot" style={{ background: '#4C7A5E' }} />
              <span className="legend-name">Passed Checks</span>
            </div>
            <div className="legend-val-col mono">
              <strong>{passCount}</strong>
              <span className="legend-pct">({Math.round(passRatio * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Core Web Vitals Thresholds Spectrum Chart (SVG)
 */
export function CwvThresholdChart({ metrics = {} }) {
  if (!metrics || (metrics.lcp == null && metrics.cls == null && metrics.tbt == null)) {
    return (
      <div className="graph-card">
        <div className="graph-card-header">
          <h4 className="graph-card-title">Core Web Vitals Threshold Spectrum</h4>
          <span className="graph-card-meta mono">Google PSI Benchmarks</span>
        </div>
        <div style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--text-soft)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
          * Field Core Web Vitals data not returned by diagnostic engine for this URL. No synthetic numbers substituted.
        </div>
      </div>
    );
  }

  // Numeric extraction without inventing values
  const parseLcp = (v) => {
    if (v == null) return null;
    const num = parseFloat(String(v).replace('s', ''));
    return isNaN(num) ? null : num;
  };

  const parseCls = (v) => {
    if (v == null) return null;
    const num = parseFloat(String(v));
    return isNaN(num) ? null : num;
  };

  const parseTbt = (v) => {
    if (v == null) return null;
    const num = parseFloat(String(v).replace('ms', ''));
    return isNaN(num) ? null : num;
  };

  const lcpVal = parseLcp(metrics.lcp);
  const clsVal = parseCls(metrics.cls);
  const tbtVal = parseTbt(metrics.tbt);

  const cwvSpecs = [
    {
      metric: 'LCP (Largest Contentful Paint)',
      valStr: lcpVal !== null ? `${lcpVal}s` : 'Not Measured',
      val: lcpVal,
      goodMax: 2.5,
      warnMax: 4.0,
      scaleMax: 6.0,
      unit: 's',
      status: lcpVal !== null ? (lcpVal <= 2.5 ? 'GOOD' : lcpVal <= 4.0 ? 'NEEDS WORK' : 'POOR') : 'NOT MEASURED',
      color: lcpVal !== null ? (lcpVal <= 2.5 ? '#4C7A5E' : lcpVal <= 4.0 ? '#B8863D' : '#C1432B') : 'var(--muted)',
      posPct: lcpVal !== null ? Math.min(96, Math.max(4, (lcpVal / 6.0) * 100)) : null
    },
    {
      metric: 'CLS (Cumulative Layout Shift)',
      valStr: clsVal !== null ? `${clsVal}` : 'Not Measured',
      val: clsVal,
      goodMax: 0.1,
      warnMax: 0.25,
      scaleMax: 0.4,
      unit: '',
      status: clsVal !== null ? (clsVal <= 0.1 ? 'GOOD' : clsVal <= 0.25 ? 'NEEDS WORK' : 'POOR') : 'NOT MEASURED',
      color: clsVal !== null ? (clsVal <= 0.1 ? '#4C7A5E' : clsVal <= 0.25 ? '#B8863D' : '#C1432B') : 'var(--muted)',
      posPct: clsVal !== null ? Math.min(96, Math.max(4, (clsVal / 0.4) * 100)) : null
    },
    {
      metric: 'TBT / INP (Total Blocking Time)',
      valStr: tbtVal !== null ? `${tbtVal}ms` : 'Not Measured',
      val: tbtVal,
      goodMax: 200,
      warnMax: 500,
      scaleMax: 800,
      unit: 'ms',
      status: tbtVal !== null ? (tbtVal <= 200 ? 'GOOD' : tbtVal <= 500 ? 'NEEDS WORK' : 'POOR') : 'NOT MEASURED',
      color: tbtVal !== null ? (tbtVal <= 200 ? '#4C7A5E' : tbtVal <= 500 ? '#B8863D' : '#C1432B') : 'var(--muted)',
      posPct: tbtVal !== null ? Math.min(96, Math.max(4, (tbtVal / 800) * 100)) : null
    }
  ];

  return (
    <div className="graph-card">
      <div className="graph-card-header">
        <h4 className="graph-card-title">Core Web Vitals Threshold Spectrum</h4>
        <span className="graph-card-meta mono">Google PSI Benchmarks</span>
      </div>

      <div className="cwv-gauges-wrap">
        {cwvSpecs.map((spec) => (
          <div key={spec.metric} className="cwv-gauge-item">
            <div className="cwv-gauge-header">
              <span className="cwv-gauge-name">{spec.metric}</span>
              <div className="cwv-gauge-status-badge mono" style={{ color: spec.color }}>
                <strong>{spec.valStr}</strong>
                <span className="cwv-status-tag">({spec.status})</span>
              </div>
            </div>

            {/* Threshold Spectrum Bar */}
            <div className="cwv-track-container">
              <div className="cwv-track-segments">
                <div className="cwv-segment good" style={{ width: '45%' }}>
                  <span className="segment-label">Good</span>
                </div>
                <div className="cwv-segment warn" style={{ width: '30%' }}>
                  <span className="segment-label">Needs Imp.</span>
                </div>
                <div className="cwv-segment poor" style={{ width: '25%' }}>
                  <span className="segment-label">Poor</span>
                </div>
              </div>

              {/* Pinpoint Indicator Needle */}
              <div
                className="cwv-needle"
                style={{ left: `${spec.posPct}%`, borderColor: spec.color }}
                title={`Measured: ${spec.valStr}`}
              >
                <div className="cwv-needle-pin" style={{ background: spec.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cwv-gauge-footer mono">
        <span>● Green: Passes Core Web Vitals threshold for Google mobile rank protection</span>
      </div>
    </div>
  );
}

/**
 * Combined Graph View Container (Section 7 Spec)
 */
export default function GraphView({ report = {} }) {
  if (!report) return null;

  return (
    <section className="graph-view-section shell" aria-label="Visual Diagnostic Charts">
      <div className="graph-grid">
        <ScoreBreakdownChart scores={report.scores} />
        <SeverityDistributionChart findings={report.findings} summary={report.summary} />
        <CwvThresholdChart metrics={report.metrics || report.details?.metrics} />
      </div>
    </section>
  );
}
