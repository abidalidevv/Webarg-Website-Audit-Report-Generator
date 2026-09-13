import dns from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

/**
 * Checks whether a given URL is safe from SSRF attacks.
 * Rejects non-HTTP/S schemes, unresolvable hosts, and private/reserved IP ranges.
 *
 * @param {string} inputUrl
 * @returns {Promise<{ isSafe: boolean, error?: string, parsedUrl?: URL, resolvedIps?: string[] }>}
 */
export async function validateSsrf(inputUrl) {
  let parsedUrl;
  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    return { isSafe: false, error: 'Invalid URL format.' };
  }

  // 1. Enforce HTTP/HTTPS only
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return {
      isSafe: false,
      error: `Disallowed protocol "${parsedUrl.protocol}". Only http: and https: are permitted.`
    };
  }

  const hostname = parsedUrl.hostname.trim();

  // Basic string check for common local hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0'
  ) {
    return {
      isSafe: false,
      error: `Access to local/private hostname "${hostname}" is prohibited (SSRF guard).`
    };
  }

  // 2. Resolve DNS host to actual IP addresses
  let lookupResults = [];
  try {
    lookupResults = await dns.lookup(hostname, { all: true });
  } catch (err) {
    return {
      isSafe: false,
      error: `Could not resolve hostname "${hostname}": ${err.message}`
    };
  }

  if (!lookupResults || lookupResults.length === 0) {
    return {
      isSafe: false,
      error: `No DNS records resolved for hostname "${hostname}".`
    };
  }

  const resolvedIps = lookupResults.map((r) => r.address);

  // 3. Inspect each resolved IP address against CIDR blocklists
  for (const ipStr of resolvedIps) {
    try {
      let addr = ipaddr.parse(ipStr);

      // Handle IPv4-mapped IPv6 addresses (e.g. ::ffff:127.0.0.1)
      if (addr.kind() === 'ipv6' && addr.isIPv4MappedAddress()) {
        addr = addr.toIPv4Address();
      }

      const range = addr.range();

      // ipaddr.js range types:
      // IPv4: 'unspecified' (0.0.0.0/8), 'broadcast', 'linkLocal' (169.254.0.0/16),
      //       'loopback' (127.0.0.0/8), 'private' (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16),
      //       'carrierGradeNat' (100.64.0.0/10)
      // IPv6: 'unspecified' (::), 'linkLocal' (fe80::/10), 'loopback' (::1), 'uniqueLocal' (fc00::/7)
      const prohibitedRanges = [
        'unspecified',
        'broadcast',
        'linkLocal',
        'loopback',
        'private',
        'carrierGradeNat',
        'uniqueLocal'
      ];

      if (prohibitedRanges.includes(range)) {
        return {
          isSafe: false,
          error: `Target resolved to restricted or private IP address ${ipStr} (${range}). Request blocked by SSRF guard.`,
          resolvedIps
        };
      }
    } catch {
      return {
        isSafe: false,
        error: `Could not parse resolved IP address: ${ipStr}`,
        resolvedIps
      };
    }
  }

  return {
    isSafe: true,
    parsedUrl,
    resolvedIps,
    pinnedIp: resolvedIps[0]
  };
}
