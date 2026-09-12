import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data/reports');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Saves a report to a flat JSON file on disk.
 *
 * @param {object} report
 * @returns {string} Filepath
 */
export function saveReport(report) {
  if (!report || !report.id) {
    throw new Error('Report must have an id property to be saved.');
  }
  const filePath = path.join(DATA_DIR, `${report.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
  return filePath;
}

/**
 * Retrieves a report by ID.
 *
 * @param {string} reportId
 * @returns {object|null}
 */
export function getReport(reportId) {
  if (!reportId || !/^[A-Za-z0-9_-]+$/.test(reportId)) {
    return null;
  }
  const filePath = path.join(DATA_DIR, `${reportId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read report ${reportId}:`, err);
    return null;
  }
}

/**
 * Lists all persisted reports (for admin view and history).
 *
 * @returns {Array<object>}
 */
export function listReports() {
  if (!fs.existsSync(DATA_DIR)) return [];
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  const reports = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      const r = JSON.parse(raw);
      reports.push({
        id: r.id,
        targetUrl: r.targetUrl,
        mode: r.mode,
        timestamp: r.timestamp,
        overallScore: r.overallScore,
        overallStatus: r.overallStatus,
        findingsCount: r.findings?.length || 0
      });
    } catch {}
  }

  // Sort newest first
  return reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Deletes a report file by ID.
 *
 * @param {string} reportId
 * @returns {boolean}
 */
export function deleteReport(reportId) {
  if (!reportId || !/^[A-Za-z0-9_-]+$/.test(reportId)) {
    return false;
  }
  const filePath = path.join(DATA_DIR, `${reportId}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

/**
 * Finds the most recent previous report for the given URL/hostname,
 * excluding the current report ID if provided.
 *
 * @param {string} targetUrl
 * @param {string|null} currentReportId
 * @returns {object|null}
 */
export function findPreviousReportForUrl(targetUrl, currentReportId = null) {
  if (!targetUrl) return null;
  let targetHost = '';
  try {
    targetHost = new URL(targetUrl).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }

  const reports = listReports();
  // Filter for reports with matching hostname, excluding the current report
  const matches = reports.filter((r) => {
    if (currentReportId && r.id === currentReportId) return false;
    try {
      const h = new URL(r.targetUrl).hostname.toLowerCase().replace(/^www\./, '');
      return h === targetHost;
    } catch {
      return false;
    }
  });

  if (matches.length === 0) return null;
  // listReports is sorted newest first, so matches[0] is the most recent previous scan
  return getReport(matches[0].id);
}

/**
 * Calculates score deltas and resolved findings between a current and prior report.
 *
 * @param {object} currentReport
 * @param {object} previousReport
 * @returns {object|null}
 */
export function calculateScoreDelta(currentReport, previousReport) {
  if (!currentReport || !previousReport) return null;
  const currScores = currentReport.scores || {};
  const prevScores = previousReport.scores || {};

  const currOverall = currentReport.overallScore ?? currScores.overall ?? 70;
  const prevOverall = previousReport.overallScore ?? prevScores.overall ?? 70;

  const currFindings = currentReport.findings || [];
  const prevFindings = previousReport.findings || [];

  // Determine resolved findings (findings that were in previous report but absent in current)
  const currFindingHeadlines = new Set(currFindings.map((f) => f.headline || f.title));
  const resolvedFindings = prevFindings.filter((pf) => !currFindingHeadlines.has(pf.headline || pf.title));

  return {
    previousReportId: previousReport.id,
    previousTimestamp: previousReport.timestamp,
    previousMode: previousReport.mode || 'quick',
    overall: {
      previous: prevOverall,
      current: currOverall,
      diff: currOverall - prevOverall
    },
    performance: {
      previous: prevScores.performance ?? 0,
      current: currScores.performance ?? 0,
      diff: (currScores.performance ?? 0) - (prevScores.performance ?? 0)
    },
    seo: {
      previous: prevScores.seo ?? 0,
      current: currScores.seo ?? 0,
      diff: (currScores.seo ?? 0) - (prevScores.seo ?? 0)
    },
    accessibility: {
      previous: prevScores.accessibility ?? 0,
      current: currScores.accessibility ?? 0,
      diff: (currScores.accessibility ?? 0) - (prevScores.accessibility ?? 0)
    },
    security: {
      previous: prevScores.security ?? 0,
      current: currScores.security ?? 0,
      diff: (currScores.security ?? 0) - (prevScores.security ?? 0)
    },
    resolvedFindingsCount: resolvedFindings.length,
    resolvedFindings: resolvedFindings.map((f) => ({
      headline: f.headline || f.title,
      category: f.category
    }))
  };
}
