import React, { useState, useRef, useEffect } from 'react';
import StickyHeader from './components/StickyHeader';
import HeroInput from './components/HeroInput';
import ScanCanvas from './components/ScanCanvas';
import ExecutiveSummary from './components/ExecutiveSummary';
import RevenueImpact from './components/RevenueImpact';
import TechStackBadges from './components/TechStackBadges';
import ConversionJourneyGrid from './components/ConversionJourneyGrid';
import RemediationPlan from './components/RemediationPlan';
import FindingsList from './components/FindingsList';
import GraphView from './components/GraphView';
import AccessLevelMatrix from './components/AccessLevelMatrix';
import StickyFooter from './components/StickyFooter';
import AdminPanel from './components/AdminPanel';

const API_BASE_URL = 'http://localhost:5000';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => window.location.pathname === '/admin');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPrintView, setIsPrintView] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('view') === 'graph' ? 'graph' : 'table';
  });

  const resultsRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Check URL path or query params for direct /report/:id, /admin, or ?print=true loading
  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(window.location.pathname === '/admin');
    };
    window.addEventListener('popstate', handlePopState);

    const searchParams = new URLSearchParams(window.location.search);
    const printParam = searchParams.get('print') === 'true';
    if (printParam) {
      setIsPrintView(true);
      document.body.classList.add('print-mode');
    }

    // Extract report ID from /report/:id or ?id=:id
    let targetReportId = searchParams.get('id');
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'report' && pathParts[1]) {
      targetReportId = pathParts[1];
    }

    if (targetReportId) {
      fetchReportById(targetReportId);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchReportById = async (reportId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/report/${reportId}`);
      if (!res.ok) {
        throw new Error('Report could not be retrieved.');
      }
      const data = await res.json();
      setReport(data);
      setCurrentUrl(data.targetUrl);
    } catch (err) {
      console.warn('Failed to load persisted report:', err.message);
    }
  };

  const normalizeUrl = (rawUrl) => {
    let clean = rawUrl.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }
    return clean;
  };

  const handleScan = async (rawUrl, mode = 'quick') => {
    const target = normalizeUrl(rawUrl);
    setCurrentUrl(target);
    setError(null);
    setReport(null);
    setIsScanning(true);
    setProgress(12);

    setTimeout(() => {
      document.getElementById('scanStage')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);

    const startTime = Date.now();
    const expectedDuration = mode === 'deep' ? 35000 : 12000;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / expectedDuration) * 85), 92);
      setProgress(pct);
    }, 400);

    try {
      const controller = new AbortController();
      const timeoutMs = mode === 'deep' ? 90000 : 45000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${API_BASE_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: target, mode }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearInterval(progressIntervalRef.current);

      if (!res.ok) {
        let errData = {};
        try {
          errData = await res.json();
        } catch (_) {}

        if (res.status === 400) {
          throw new Error(errData.error || errData.message || 'Invalid URL or private/internal host target blocked.');
        } else if (res.status === 429) {
          throw new Error('Rate limit exceeded: Webarg enforces a maximum of 5 automated scans per hour.');
        } else if (res.status === 504) {
          throw new Error('Scan timed out: The target website took longer than 60 seconds to complete inspection.');
        } else {
          throw new Error(errData.error || errData.message || `Inspection failed with status code ${res.status}`);
        }
      }

      const reportData = await res.json();
      setProgress(100);

      // Update browser URL without reloading so it's shareable
      if (window.history?.pushState && reportData.id) {
        window.history.pushState({}, '', `/report/${reportData.id}`);
      }

      setTimeout(() => {
        setIsScanning(false);
        setReport(reportData);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }, 600);
    } catch (err) {
      clearInterval(progressIntervalRef.current);
      setIsScanning(false);

      if (err.name === 'AbortError') {
        setError({
          title: 'Connection Timeout',
          message: 'The audit engine exceeded the allocated timeout while waiting for the target page.',
        });
      } else {
        setError({
          title: 'Inspection Halted',
          message: err.message || 'Failed to connect to the Webarg audit engine at http://localhost:5000.',
        });
      }
    }
  };

  const handleNewScan = () => {
    if (window.history?.pushState) {
      window.history.pushState({}, '', '/');
    }
    setReport(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('urlInput')?.focus();
  };

  const handleNavigateAdmin = () => {
    if (window.history?.pushState) {
      window.history.pushState({}, '', '/admin');
    }
    setIsAdminRoute(true);
  };

  const handleNavigateHome = () => {
    if (window.history?.pushState) {
      window.history.pushState({}, '', '/');
    }
    setIsAdminRoute(false);
  };

  const handlePdfDownload = async () => {
    if (!report?.id) return;
    setIsDownloadingPdf(true);

    try {
      const viewQuery = viewMode === 'graph' ? '?view=graph' : '';
      const res = await fetch(`${API_BASE_URL}/report/${report.id}/pdf${viewQuery}`);
      if (!res.ok) {
        throw new Error('Server returned an error generating the PDF.');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;

      // Clean business or domain name for filename
      let namePart = 'target';
      if (report.businessName && report.businessName !== 'Client Website') {
        namePart = report.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      } else {
        try {
          namePart = new URL(report.targetUrl).hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
        } catch (_) {}
      }
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `webarg-audit-${namePart}-${dateStr}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert(`PDF generation failed: ${err.message}. Opening system print dialog as fallback.`);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleViewModeToggle = (mode) => {
    setViewMode(mode);
    if (window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('view', mode);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // 1. If viewing Admin Panel route
  if (isAdminRoute) {
    return <AdminPanel onNavigateHome={handleNavigateHome} />;
  }

  // 2. Normal Auditor View
  return (
    <div className={`webarg-root ${isPrintView ? 'print-mode' : ''}`}>
      <StickyHeader
        currentUrl={currentUrl}
        businessName={report?.businessName}
        hasReport={!!report}
        reportId={report?.id}
        onNewScan={handleNewScan}
        onNavigateAdmin={handleNavigateAdmin}
        onPdfDownload={handlePdfDownload}
        isDownloadingPdf={isDownloadingPdf}
        isPrintView={isPrintView}
      />

      <main>
        {!isPrintView && (
          <>
            <HeroInput
              onScan={handleScan}
              isScanning={isScanning}
              error={error}
            />

            <ScanCanvas
              isScanning={isScanning}
              scanUrl={currentUrl}
              progress={progress}
            />
          </>
        )}

        {report && (
          <div ref={resultsRef} id="results" className="results-container">
            {/* 1. Executive Summary Strip & 4 Scores */}
            <ExecutiveSummary report={report} />

            {/* 2. Revenue & Commercial Risk Impact Callout */}
            <RevenueImpact
              revenueImpact={report.revenueImpact}
              findings={report.findings}
            />

            {/* 3. Platform & CMS Detection (Section 79) */}
            <TechStackBadges techStack={report.techStack} />

            {/* 4. Conversion Journey Audit (Sections 1, 3, 5, 11, 19, 71) */}
            <ConversionJourneyGrid
              journey={report.conversionJourney}
              trust={report.trustSignals}
              customerJourneys={report.customerJourneys}
            />

            {/* 5. Prioritized Sprint Remediation Plan (Section 82) */}
            <RemediationPlan
              priorities={report.remediationPriorities}
              consultation={report.consultation}
            />

            {/* 6. View Mode Switcher: Table View vs Graph View */}
            <div className="view-mode-bar shell">
              <div className="view-mode-meta">
                <span className="section-tag">VIEW PRESENTATION</span>
                <span className="view-mode-sub">Switch between PageSpeed-style table diagnostics and visual charts</span>
              </div>
              <div className="view-mode-controls" role="tablist" aria-label="Report presentation format">
                <button
                  type="button"
                  id="tableViewBtn"
                  role="tab"
                  aria-selected={viewMode === 'table'}
                  className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => handleViewModeToggle('table')}
                >
                  <span className="view-toggle-icon">📋</span>
                  <span>Table View</span>
                </button>
                <button
                  type="button"
                  id="graphViewBtn"
                  role="tab"
                  aria-selected={viewMode === 'graph'}
                  className={`view-toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
                  onClick={() => handleViewModeToggle('graph')}
                >
                  <span className="view-toggle-icon">📊</span>
                  <span>Graph View</span>
                </button>
              </div>
            </div>

            {/* 7. Detailed Presentation: Graph View or Findings List */}
            {viewMode === 'graph' ? (
              <GraphView report={report} />
            ) : (
              <FindingsList findings={report.findings} isPrintView={isPrintView} />
            )}

            {/* 8. Access Level Matrix & Playbook Transparency (Section 80) */}
            <AccessLevelMatrix matrix={report.accessLevelMatrix} />
          </div>
        )}
      </main>

      {/* 8. Sticky CTA Lead-Gen Footer */}
      {!isPrintView && <StickyFooter onNavigateAdmin={handleNavigateAdmin} />}
    </div>
  );
}
