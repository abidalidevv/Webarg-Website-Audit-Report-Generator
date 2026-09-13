import React from 'react';

export default function StickyFooter({ onNavigateAdmin }) {
  const whatsappUrl = 'https://wa.me/?text=Hi%20Abid,%20I%20ran%20a%20Webarg%20scan%20on%20my%20site%20and%20would%20like%20to%20discuss%20a%20remediation%20sprint.';
  const emailUrl = 'mailto:abid@example.com?subject=Webarg%20Audit%20Remediation%20Sprint&body=Hi%20Abid,%0A%0AI%20inspected%20our%20website%20using%20Webarg%20and%20want%20to%20review%20the%20remediation%20priorities%20and%20the%20full%2084-point%20manual%20audit.';

  return (
    <footer className="cta-footer">
      <div className="shell cta-footer-inner">
        <div className="cta-pitch">
          <div className="cta-byline">AUDIT CONDUCTED BY ABID · REMEDIATION SPRINTS AVAILABLE</div>
          <div className="cta-subline">
            Level 1 public URL audit complete (18 automated checks). The comprehensive 84-point manual audit covering GoHighLevel funnels, CMS database internals, and physical devices is conducted directly by Abid.
          </div>
        </div>

        <div className="cta-buttons">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn-whatsapp"
            id="whatsappCtaBtn"
          >
            <span>💬</span> Message on WhatsApp
          </a>
          <a
            href={emailUrl}
            className="cta-btn-email"
            id="emailCtaBtn"
          >
            Email Remediation Request
          </a>
          {onNavigateAdmin && (
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="admin-portal-link"
              id="adminPortalFooterLink"
              title="Access Developer Admin Console"
            >
              🔒 Admin Console
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
