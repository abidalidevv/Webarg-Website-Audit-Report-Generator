import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sanitizeConsoleLogs } from '../src/services/logSanitizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000';

async function runPhase5Suite() {
  console.log('====================================================');
  console.log('  WEBARG PHASE 5 — COMPREHENSIVE SECURITY SUITE');
  console.log('====================================================\n');

  const results = {
    ssrf: [],
    rateLimit: null,
    logSanitizer: null,
    realWorld: [],
    pdfCheck: null
  };

  // ----------------------------------------------------
  // TEST 1: SSRF ATTACK SUITE
  // ----------------------------------------------------
  console.log('► 1. Running SSRF Attack Suite (Host Isolation & Protocols)...');
  const ssrfPayloads = [
    { target: 'http://127.0.0.1', label: 'IPv4 Loopback' },
    { target: 'http://localhost:5000', label: 'Localhost Named Host' },
    { target: 'http://169.254.169.254/latest/meta-data/', label: 'AWS/GCP Cloud Metadata CIDR' },
    { target: 'http://10.0.0.1', label: 'Private Class A Subnet' },
    { target: 'http://[::1]', label: 'IPv6 Loopback' },
    { target: 'file:///etc/passwd', label: 'Non-HTTP Protocol Scheme' }
  ];

  for (let idx = 0; idx < ssrfPayloads.length; idx++) {
    const item = ssrfPayloads[idx];
    try {
      const res = await fetch(`${BASE_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': `198.51.100.${idx + 10}` // Isolated test IP per SSRF test
        },
        body: JSON.stringify({ url: item.target })
      });

      const isBlocked = res.status === 400;
      results.ssrf.push({
        target: item.target,
        label: item.label,
        status: res.status,
        passed: isBlocked
      });
      console.log(`  [${isBlocked ? 'PASS' : 'FAIL'}] ${item.label} (${item.target}) -> HTTP ${res.status}`);
    } catch (err) {
      results.ssrf.push({
        target: item.target,
        label: item.label,
        status: 'Error: ' + err.message,
        passed: false
      });
      console.log(`  [FAIL] ${item.label} -> ${err.message}`);
    }
  }

  // ----------------------------------------------------
  // TEST 2: RATE LIMIT VERIFICATION
  // ----------------------------------------------------
  console.log('\n► 2. Testing Rate Limiting (Burst Enforcement: 5 reqs/hr limit)...');
  try {
    const burstPromises = [];
    const testIp = '198.51.100.2'; // Isolated test subnet 2

    // Send 7 rapid requests from same IP
    for (let i = 1; i <= 7; i++) {
      burstPromises.push(
        fetch(`${BASE_URL}/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': testIp
          },
          body: JSON.stringify({ url: 'https://example.com' })
        }).then(r => ({ req: i, status: r.status }))
      );
    }
    const burstResults = await Promise.all(burstPromises);
    const has429 = burstResults.some(r => r.status === 429);
    results.rateLimit = {
      burstResults,
      passed: has429
    };
    console.log(`  [${has429 ? 'PASS' : 'FAIL'}] Responses: ${burstResults.map(r => `Req#${r.req}:${r.status}`).join(', ')}`);
    console.log(`  429 Too Many Requests Triggered: ${has429}`);
  } catch (err) {
    results.rateLimit = { passed: false, error: err.message };
  }

  // ----------------------------------------------------
  // TEST 3: LOG SANITIZATION VERIFICATION
  // ----------------------------------------------------
  console.log('\n► 3. Testing Sensitive Token & Cookie Redaction...');
  const mockDirtyLogs = [
    { text: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0' },
    { text: 'Set-Cookie: session_id=s%3Aabc123secret; Secure; HttpOnly' },
    { text: 'Failed request to https://api.example.com/user?password=mySuperSecret123&apiKey=ak_test_987654321' }
  ];

  const sanitized = sanitizeConsoleLogs(mockDirtyLogs);
  const rawLeakDetected = JSON.stringify(sanitized).includes('eyJhbGciOi') ||
                          JSON.stringify(sanitized).includes('s%3Aabc123secret') ||
                          JSON.stringify(sanitized).includes('mySuperSecret123');

  const logPassed = !rawLeakDetected;
  results.logSanitizer = {
    passed: logPassed,
    sampleOutput: sanitized[0].text
  };
  console.log(`  [${logPassed ? 'PASS' : 'FAIL'}] Token, Cookie, and Credential Redaction verified.`);
  console.log(`  Cleaned Sample: "${sanitized[0].text}"`);

  // ----------------------------------------------------
  // TEST 4: REAL-WORLD SCANS (Diverse profiles, graceful error handling)
  // ----------------------------------------------------
  console.log('\n► 4. Running Real-World Scans Across Diverse Site Profiles...');
  const realSites = [
    { url: 'https://example.com', type: 'Static Reference Baseline' },
    { url: 'https://news.ycombinator.com', type: 'High Density Minimalist' },
    { url: 'https://cloudflare.com', type: 'Cloudflare Bot-Protected Site' }
  ];

  let sampleReportId = null;

  for (let i = 0; i < realSites.length; i++) {
    const site = realSites[i];
    try {
      console.log(`  Scanning [${site.type}]: ${site.url}...`);
      const res = await fetch(`${BASE_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': `198.51.100.1${i + 5}` // Fresh isolated test IP per site
        },
        body: JSON.stringify({ url: site.url, mode: 'quick' })
      });

      if (res.ok) {
        const report = await res.json();
        sampleReportId = report.id;
        results.realWorld.push({
          url: site.url,
          type: site.type,
          status: res.status,
          reportId: report.id,
          overallScore: report.overallScore,
          findingsCount: report.findings?.length || 0,
          passed: true
        });
        console.log(`  [PASS] ${site.url} -> Health Score: ${report.overallScore}, Findings: ${report.findings?.length || 0}, Saved ID: ${report.id}`);
      } else {
        results.realWorld.push({
          url: site.url,
          type: site.type,
          status: res.status,
          passed: res.status < 500 // Gracefully handled without unhandled 500
        });
        console.log(`  [GRACEFUL] ${site.url} -> Handled with HTTP ${res.status}`);
      }
    } catch (err) {
      results.realWorld.push({
        url: site.url,
        type: site.type,
        status: 'Error',
        passed: false
      });
      console.log(`  [FAIL] ${site.url} -> ${err.message}`);
    }
  }

  // ----------------------------------------------------
  // TEST 5: PDF GENERATION & FILE INTEGRITY
  // ----------------------------------------------------
  console.log('\n► 5. Testing Native PDF Generation & Vector Quality...');
  const targetId = sampleReportId || 'zHpqs2S19Ma2';
  try {
    const pdfRes = await fetch(`${BASE_URL}/report/${targetId}/pdf`);
    if (pdfRes.ok) {
      const buffer = await pdfRes.arrayBuffer();
      const nodeBuf = Buffer.from(buffer);
      const isPdfHeader = nodeBuf.slice(0, 4).toString() === '%PDF';
      results.pdfCheck = {
        passed: isPdfHeader && nodeBuf.length > 50000,
        sizeBytes: nodeBuf.length,
        isPdfHeader
      };
      console.log(`  [${results.pdfCheck.passed ? 'PASS' : 'FAIL'}] PDF Generated: ${nodeBuf.length} bytes, Header Magic Bytes: ${nodeBuf.slice(0, 5).toString()}`);
    } else {
      const errText = await pdfRes.text();
      results.pdfCheck = { passed: false, status: pdfRes.status, errText };
      console.log(`  [FAIL] PDF endpoint returned HTTP ${pdfRes.status}: ${errText}`);
    }
  } catch (err) {
    results.pdfCheck = { passed: false, error: err.message };
    console.log(`  [FAIL] PDF check: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log('  ALL 5 SECURITY & VERIFICATION SUITES EXECUTED');
  console.log('====================================================');

  return results;
}

runPhase5Suite();
