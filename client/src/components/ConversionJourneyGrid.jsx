import React from 'react';

export default function ConversionJourneyGrid({ journey = {}, trust = {}, customerJourneys = [] }) {
  const phone = journey.phone || { count: 0, unlinkedInBody: false };
  const whatsapp = journey.whatsapp || { count: 0 };
  const email = journey.email || { count: 0 };
  const forms = journey.forms || { count: 0 };
  const maps = journey.maps || { present: false };

  const channels = [
    {
      name: 'Click-to-Call',
      metric: phone.count > 0 ? `${phone.count} tel: link(s)` : phone.unlinkedInBody ? 'Unlinked Text' : 'None Detected',
      status: phone.count > 0 ? 'pass' : phone.unlinkedInBody ? 'critical' : 'warning',
      sub: phone.count > 0 ? 'Mobile visitors can tap to dial' : phone.unlinkedInBody ? 'Plain text phone cannot be clicked' : 'No direct dialer found'
    },
    {
      name: 'WhatsApp Chat',
      metric: whatsapp.count > 0 ? `${whatsapp.count} active link(s)` : 'Not Configured',
      status: whatsapp.count > 0 ? 'pass' : 'warning',
      sub: whatsapp.count > 0 ? 'Instant messenger lead routing' : 'No direct WhatsApp lead channel'
    },
    {
      name: 'Direct Email',
      metric: email.count > 0 ? `${email.count} mailto: link(s)` : 'None Detected',
      status: email.count > 0 ? 'pass' : 'warning',
      sub: email.count > 0 ? 'Standard mailto: client launch' : 'No direct email enquiry link'
    },
    {
      name: 'Lead Capture Forms',
      metric: forms.count > 0 ? `${forms.count} form(s) found` : 'No Forms',
      status: forms.count > 0 ? 'pass' : 'warning',
      sub: forms.count > 0 ? 'On-page conversion mechanism' : 'Lacks on-page lead form'
    },
    {
      name: 'Physical Map / Address',
      metric: maps.present ? 'Map Embed Detected' : 'Not Embedded',
      status: maps.present ? 'pass' : 'warning',
      sub: maps.present ? 'Local SEO & customer trust verified' : 'No Google Maps location link'
    },
    {
      name: 'Conversion CTAs',
      metric: trust.deadCtasCount === 0 ? 'All Anchors Valid' : `${trust.deadCtasCount} Dead CTA(s)`,
      status: trust.deadCtasCount === 0 ? 'pass' : 'critical',
      sub: trust.deadCtasCount === 0 ? 'Zero dummy # buttons detected' : 'Action buttons link to dummy #'
    }
  ];

  return (
    <section className="conversion-grid-section shell" aria-label="Conversion Channels Audit">
      <div className="section-head">
        <div>
          <span className="section-tag">PUBLIC CONVERSION PATHS</span>
          <h3 className="section-heading">CONVERSION JOURNEY VERIFICATION</h3>
        </div>
        <div className="section-note">SECTIONS 1, 3, 5, 11, 19, 71 OF WEBARG PLAYBOOK</div>
      </div>

      <div className="journey-grid">
        {channels.map((ch, idx) => (
          <div key={idx} className={`journey-card status-${ch.status}`}>
            <div className="journey-card-top">
              <span className="journey-card-name">{ch.name}</span>
              <span className={`journey-status-dot ${ch.status}`} />
            </div>
            <div className="journey-card-metric">{ch.metric}</div>
            <div className="journey-card-sub">{ch.sub}</div>
          </div>
        ))}
      </div>

      {customerJourneys && customerJourneys.length > 0 && (
        <div className="customer-journeys-wrap" style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              SECTION 71 · CUSTOMER JOURNEY PROXIES
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(237,238,231,0.5)', fontFamily: 'var(--font-mono)' }}>
              HEURISTIC SIGNALS · UNVERIFIED BY HUMAN TRIAL
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(237,238,231,0.5)', lineHeight: 1.45, margin: '0 0 12px', fontFamily: 'var(--font-mono)' }}>
            * Note: Status is inferred from public DOM signals (e.g. presence of tel: hrefs, form tags, 404 response). Actual cellular phone dialers, SMS/email inbox receipt, and authenticated user journeys cannot be tested automatically and require Abid's credentialed manual audit (see Access Level Matrix below).
          </p>

          <div className="customer-journeys-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {customerJourneys.map((cj) => {
              const isMeasured = cj.confidence === 'measured';
              const badgeClass = cj.status === 'pass' ? 'badge-live' : 'badge-playbook';
              const statusText = cj.status === 'pass' ? 'PASS' : cj.status === 'warning' ? 'FRICTION' : 'RISK';
              const badgeLabel = isMeasured ? `MEASURED: ${statusText}` : `INFERRED: ${statusText}`;

              return (
                <div key={cj.id} className={`cj-row row-${cj.status}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--paper)' }}>{cj.name}</strong>
                      <span className="mono" style={{ fontSize: '9px', color: isMeasured ? 'var(--signal-pass)' : 'var(--accent)', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '2px', textTransform: 'uppercase' }}>
                        {isMeasured ? 'Direct Signal' : 'Indirect Proxy'}
                      </span>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(237,238,231,0.6)' }}>{cj.flow}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(237,238,231,0.5)' }}>{cj.notes}</span>
                  </div>
                  <span className={`matrix-badge ${badgeClass}`} style={{ textTransform: 'uppercase', fontSize: '10px', padding: '3px 8px', whiteSpace: 'nowrap' }}>
                    {badgeLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
