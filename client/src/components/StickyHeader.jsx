import React, { useState } from 'react';

export default function StickyHeader({
  currentUrl,
  businessName,
  hasReport,
  reportId,
  onNewScan,
  onNavigateAdmin,
  onPdfDownload,
  isDownloadingPdf,
  isPrintView
}) {
  const [shareText, setShareText] = useState('Share');

  const handleShare = async () => {
    if (!reportId) return;
    const shareUrl = `${window.location.origin}/report/${reportId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Webarg Audit — ${businessName ? `${businessName} (${currentUrl})` : currentUrl}`,
          text: `Technical and conversion inspection report for ${businessName || currentUrl}`,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard if user dismissed share dialog or error
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareText('Link Copied!');
      setTimeout(() => setShareText('Share'), 2000);
    } catch (err) {
      alert(`Report URL: ${shareUrl}`);
    }
  };

  return (
    <header className={`site-header ${isPrintView ? 'print-hide' : ''}`}>
      <div className="shell header-inner">
        <div className="logo">
          <div className="logo-mark" aria-hidden="true" />
          <span className="logo-name">WEBARG</span>
        </div>

        <div className="header-meta">
          {businessName && (
            <span className="header-business-badge" title={businessName}>
              {businessName}
            </span>
          )}
          {currentUrl && (
            <div className="header-active-url" title={currentUrl}>
              {currentUrl}
            </div>
          )}
        </div>

        <div className="header-actions">
          {hasReport && !isPrintView && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={onNewScan}
                id="newScanBtn"
              >
                New Scan
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleShare}
                id="shareBtn"
                title="Share or copy report link"
              >
                {shareText}
              </button>
            </>
          )}

          {!isPrintView && (
            <>
              <a
                href="/docs.html"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                id="docsNavBtn"
                title="Open HTML User Guide & Documentation"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Docs
              </a>
              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigateAdmin}
                id="adminNavBtn"
                title="Open Administrator Console"
              >
                Admin
              </button>
              <button
                type="button"
                className="btn-primary"
                id="pdfBtn"
                onClick={onPdfDownload}
                disabled={!hasReport || isDownloadingPdf}
              >
                {isDownloadingPdf ? 'Generating PDF…' : 'Download PDF'}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
