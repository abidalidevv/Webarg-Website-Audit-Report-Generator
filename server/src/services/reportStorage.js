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

