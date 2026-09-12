/**
 * Sanitizes captured log messages, stack traces, and URL strings to redact
 * sensitive information (tokens, credentials, API keys, cookies, passwords).
 *
 * @param {string} text
 * @returns {string} Redacted string
 */
export function sanitizeLog(text) {
  if (!text || typeof text !== 'string') return text;

  let sanitized = text;

  // 1. Redact Bearer tokens
  sanitized = sanitized.replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED_TOKEN]');

  // 2. Redact JWT tokens (header.payload.signature)
  sanitized = sanitized.replace(/eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+/g, '[REDACTED_JWT]');

  // 3. Redact Set-Cookie headers
  sanitized = sanitized.replace(/Set-Cookie:\s*([^=\s]+)=([^;\r\n]+)/gi, 'Set-Cookie: $1=[REDACTED_COOKIE]');

  // 4. Redact common cookie headers or query params
  sanitized = sanitized.replace(/(cookie|token|secret|password|passwd|apiKey|api_key|access_token|auth|session|session_id|sessionid|sid|phpsessid|connect\.sid)=([^&;\s"']+)/gi, '$1=[REDACTED]');

  // 5. Redact standard authorization basic headers
  sanitized = sanitized.replace(/Basic\s+[a-zA-Z0-9+/=]+/gi, 'Basic [REDACTED_CREDENTIALS]');

  // 6. Redact credit card patterns (13-16 digits with dashes or spaces)
  sanitized = sanitized.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED_NUMERIC_ID]');

  return sanitized;
}

/**
 * Sanitizes an array of console error/warning objects.
 *
 * @param {Array<{ severity: string, message: string, file?: string, line?: number, timestamp?: string }>} logs
 * @returns {Array<{ severity: string, message: string, file?: string, line?: number, timestamp?: string }>}
 */
export function sanitizeConsoleLogs(logs) {
  if (!Array.isArray(logs)) return [];

  return logs.map((log) => {
    const rawContent = log.message || log.text || '';
    const cleanContent = sanitizeLog(rawContent);
    return {
      ...log,
      message: cleanContent,
      text: cleanContent,
      file: sanitizeLog(log.file || '')
    };
  });
}
