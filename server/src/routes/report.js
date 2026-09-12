import { Router } from 'express';
import { getReport, findPreviousReportForUrl, calculateScoreDelta } from '../services/reportStorage.js';
import { generateReportPdf } from '../services/pdfGenerator.js';

export const reportRouter = Router();

// GET /report/:id - Returns stored JSON report (with optional comparison)
reportRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const { compare } = req.query;
  const report = getReport(id);

  if (!report) {
    return res.status(404).json({
      error: 'Report not found or has expired.'
    });
  }

  // Attach comparison if requested or if prior baseline scan exists
  if (compare) {
    const priorReport = getReport(compare);
    if (priorReport) {
      report.comparison = calculateScoreDelta(report, priorReport);
    }
  } else if (!report.comparison) {
    const priorReport = findPreviousReportForUrl(report.targetUrl, report.id);
    if (priorReport) {
      report.comparison = calculateScoreDelta(report, priorReport);
    }
  }

  return res.status(200).json(report);
});

// GET /report/:id/pdf - Generates and returns downloadable PDF
reportRouter.get('/:id/pdf', async (req, res) => {
  const { id } = req.params;
  const { view } = req.query;
  const report = getReport(id);

  if (!report) {
    return res.status(404).json({
      error: 'Cannot generate PDF. Report ID does not exist.'
    });
  }

  try {
    const pdfBuffer = await generateReportPdf(id, { view });
    const nodeBuffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);

    // Format clean filename using businessName if available, else hostname
    let namePart = 'target';
    if (report.businessName && report.businessName !== 'Client Website') {
      namePart = report.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    } else {
      try {
        namePart = new URL(report.targetUrl).hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
      } catch (_) {}
    }

    const dateStr = new Date(report.timestamp || Date.now()).toISOString().slice(0, 10);
    const filename = `webarg-audit-${namePart}-${dateStr}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', nodeBuffer.length);

    return res.end(nodeBuffer);
  } catch (err) {
    console.error(`PDF generation error for report ${id}:`, err);
    return res.status(500).json({
      error: 'Failed to generate PDF document.',
      details: err.message
    });
  }
});
