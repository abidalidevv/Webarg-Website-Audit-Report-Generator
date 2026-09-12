import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { scanRouter } from './routes/scan.js';
import { reportRouter } from './routes/report.js';
import { adminRouter } from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & utility middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow API consumers
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'webarg-scan-engine',
    timestamp: new Date().toISOString()
  });
});

// Primary scan endpoint
app.use('/scan', scanRouter);

// Report retrieval & PDF export
app.use('/report', reportRouter);

// Admin panel API
app.use('/admin-api', adminRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[Webarg] Backend Scan Engine running on http://localhost:${PORT}`);
  console.log(`[Webarg] Ready to receive POST /scan requests.`);
});

export default app;
