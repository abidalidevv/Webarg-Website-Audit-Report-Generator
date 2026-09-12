import React from 'react';

export default function ConversionJourneyGrid({ journey = {}, trust = {} }) {
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
        <div className="section-note">SECTIONS 1, 3, 5, 11, 19 OF WEBARG PLAYBOOK</div>
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
    </section>
  );
}
