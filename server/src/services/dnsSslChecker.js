import dns from 'node:dns/promises';
import tls from 'node:tls';

/**
 * Checks DNS records and email security policies (SPF, DMARC, MX).
 *
 * @param {string} hostname
 * @returns {Promise<{ records: object, spf: object, dmarc: object, issues: Array }>}
 */
export async function checkDns(hostname) {
  const issues = [];
  const records = {
    a: [],
    aaaa: [],
    mx: [],
    txt: []
  };

  try {
    records.a = await dns.resolve4(hostname).catch(() => []);
  } catch {}

  try {
    records.aaaa = await dns.resolve6(hostname).catch(() => []);
  } catch {}

  try {
    records.mx = await dns.resolveMx(hostname).catch(() => []);
  } catch {}

  try {
    const rawTxt = await dns.resolveTxt(hostname).catch(() => []);
    records.txt = rawTxt.map((parts) => parts.join(''));
  } catch {}

  // 1. SPF Check
  const spfRecord = records.txt.find((t) => t.toLowerCase().startsWith('v=spf1'));
  const spf = {
    present: Boolean(spfRecord),
    record: spfRecord || null,
    valid: Boolean(spfRecord && spfRecord.includes('~all') || spfRecord && spfRecord.includes('-all'))
  };

  if (!spf.present && records.mx.length > 0) {
    issues.push({
      category: 'DNS / Email',
      severity: 'Warning',
      title: 'Missing SPF record',
      evidence: 'No TXT record starting with v=spf1 found',
      recommendation: 'Configure an SPF record to protect domain against email spoofing.'
    });
  }

  // 2. DMARC Check (_dmarc.<hostname>)
  let dmarcRecord = null;
  try {
    const dmarcTxt = await dns.resolveTxt(`_dmarc.${hostname}`).catch(() => []);
    const merged = dmarcTxt.map((parts) => parts.join(''));
    dmarcRecord = merged.find((t) => t.toLowerCase().startsWith('v=dmarc1'));
  } catch {}

  const dmarc = {
    present: Boolean(dmarcRecord),
    record: dmarcRecord || null,
    policy: dmarcRecord ? (dmarcRecord.match(/p=([a-zA-Z]+)/i) || [])[1] || 'none' : null
  };

  if (!dmarc.present && records.mx.length > 0) {
    issues.push({
      category: 'DNS / Email',
      severity: 'Warning',
      title: 'Missing DMARC policy',
      evidence: `_dmarc.${hostname} has no v=DMARC1 TXT record`,
      recommendation: 'Add a DMARC policy record to protect brand deliverability and monitor fraudulent sender traffic.'
    });
  }

  return {
    records,
    spf,
    dmarc,
    issues
  };
}

/**
 * Checks SSL/TLS certificate validity, issuer, and expiration date using native Node tls.
 *
 * @param {string} hostname
 * @param {number} port
 * @returns {Promise<{ valid: boolean, daysRemaining: number, issuer: string, validTo: string, tlsVersion: string, issues: Array }>}
 */
export async function checkSsl(hostname, port = 443) {
  const issues = [];

  return new Promise((resolve) => {
    const options = {
      host: hostname,
      port,
      servername: hostname,
      rejectUnauthorized: false,
      timeout: 8000
    };

    let resolved = false;

    const socket = tls.connect(options, () => {
      if (resolved) return;
      resolved = true;

      try {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        const isAuthorized = socket.authorized;

        if (!cert || Object.keys(cert).length === 0) {
          socket.end();
          return resolve({
            valid: false,
            daysRemaining: 0,
            issuer: 'Unknown',
            validTo: null,
            tlsVersion: protocol || 'Unknown',
            issues: [
              {
                category: 'Security',
                severity: 'Critical',
                title: 'No SSL certificate returned',
                evidence: 'Server accepted TLS handshake but returned no peer certificate',
                recommendation: 'Install a valid SSL certificate on the web server or CDN.'
              }
            ]
          });
        }

        const validTo = new Date(cert.valid_to);
        const now = new Date();
        const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const issuer = cert.issuer ? (cert.issuer.O || cert.issuer.CN || 'Unknown') : 'Unknown';

        let isValid = isAuthorized && daysRemaining > 0;

        if (!isAuthorized) {
          issues.push({
            category: 'Security',
            severity: 'Critical',
            title: 'Untrusted SSL Certificate',
            evidence: socket.authorizationError || 'Certificate not trusted by standard root CAs',
            recommendation: 'Replace self-signed or invalid certificate with one issued by a trusted Certificate Authority.'
          });
        }

        if (daysRemaining <= 0) {
          isValid = false;
          issues.push({
            category: 'Security',
            severity: 'Critical',
            title: 'SSL Certificate Expired',
            evidence: `Certificate expired on ${validTo.toISOString()}`,
            recommendation: 'Renew the expired SSL certificate immediately.'
          });
        } else if (daysRemaining < 15) {
          issues.push({
            category: 'Security',
            severity: 'Warning',
            title: 'SSL Certificate Expiring Soon',
            evidence: `Certificate will expire in ${daysRemaining} days (${validTo.toISOString()})`,
            recommendation: 'Schedule automatic certificate renewal before expiration.'
          });
        }

        // Protocol check (flag TLS 1.0 or 1.1)
        if (protocol === 'TLSv1' || protocol === 'TLSv1.1') {
          issues.push({
            category: 'Security',
            severity: 'Critical',
            title: 'Deprecated TLS protocol',
            evidence: `Server accepted deprecated protocol ${protocol}`,
            recommendation: 'Disable TLS 1.0 and TLS 1.1 at the server/CDN; enforce TLS 1.2 or TLS 1.3.'
          });
        }

        socket.end();
        return resolve({
          valid: isValid,
          daysRemaining,
          issuer,
          validTo: validTo.toISOString(),
          tlsVersion: protocol,
          issues
        });
      } catch (err) {
        socket.destroy();
        return resolve({
          valid: false,
          daysRemaining: 0,
          issuer: 'Error',
          validTo: null,
          tlsVersion: 'Unknown',
          issues: [
            {
              category: 'Security',
              severity: 'Critical',
              title: 'SSL Inspection Error',
              evidence: err.message,
              recommendation: 'Verify HTTPS configuration on port 443.'
            }
          ]
        });
      }
    });

    socket.on('error', (err) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({
        valid: false,
        daysRemaining: 0,
        issuer: 'Unreachable',
        validTo: null,
        tlsVersion: 'None',
        issues: [
          {
            category: 'Security',
            severity: 'Critical',
            title: 'TLS connection failed',
            evidence: err.message,
            recommendation: 'Ensure HTTPS is properly configured and reachable on port 443.'
          }
        ]
      });
    });

    socket.on('timeout', () => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({
        valid: false,
        daysRemaining: 0,
        issuer: 'Timeout',
        validTo: null,
        tlsVersion: 'Timeout',
        issues: [
          {
            category: 'Security',
            severity: 'Warning',
            title: 'TLS handshake timed out',
            evidence: 'Connection to port 443 timed out after 8s',
            recommendation: 'Check server firewall and responsiveness.'
          }
        ]
      });
    });
  });
}
