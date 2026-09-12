/**
 * Client-Friendly Recommendation Narrative Generator
 * Uses Free LLM APIs (Google Gemini API free tier / Groq free tier)
 * with strict zero-crash deterministic fallback.
 */

/**
 * Deterministic fallback narrative generator
 * Uses Lighthouse and findings data directly when AI is disabled or unavailable.
 *
 * @param {object} report
 * @returns {object}
 */
export function generateDeterministicNarrative(report) {
  const business = report.businessName || 'Your business';
  const score = report.overallScore ?? 75;
  const criticals = (report.findings || []).filter((f) => f.severity?.toLowerCase() === 'critical');
  const warnings = (report.findings || []).filter((f) => f.severity?.toLowerCase() === 'warning');

  let executivePitch = '';
  if (criticals.length > 0) {
    executivePitch = `${business}'s website currently has ${criticals.length} high-severity technical barrier(s) directly impeding prospect inquiries and commercial conversion. Addressing these priority items will prevent bounce and secure lead flow across mobile and desktop traffic.`;
  } else if (warnings.length > 0) {
    executivePitch = `${business}'s website is functionally operational with an overall health score of ${score}/100, but presents ${warnings.length} conversion friction points. Resolving these items in a targeted sprint will strengthen Google ranking signals and optimize visitor inquiry rates.`;
  } else {
    executivePitch = `${business}'s website demonstrates strong technical integrity across performance, accessibility, and security standards. Ongoing maintenance will preserve these conversion benchmarks.`;
  }

  const priorityExplanations = (report.remediationPriorities || []).map((p) => ({
    rank: p.rank,
    title: p.title,
    clientTalkingPoint: p.action ? `Remediation action: ${p.action}` : `Resolve ${p.title} to improve user experience.`
  }));

  return {
    executivePitch,
    priorityExplanations,
    aiProvider: 'Deterministic Diagnostic Engine (Fallback)',
    isAiGenerated: false
  };
}

/**
 * Calls Google Gemini REST API (Free Tier)
 *
 * @param {string} apiKey
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callGeminiApi(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 350
      }
    }),
    signal: AbortSignal.timeout(4000)
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned empty response candidate.');
  }
  return text.trim();
}

/**
 * Calls Groq REST API (Free Tier)
 *
 * @param {string} apiKey
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callGroqApi(apiKey, prompt) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 350
    }),
    signal: AbortSignal.timeout(4000)
  });

  if (!res.ok) {
    throw new Error(`Groq API returned status ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Groq API returned empty completion.');
  }
  return text.trim();
}

/**
 * Generates client-friendly consultation pitch narrative.
 * Guarantees zero-crash resilience: always returns a clean narrative.
 *
 * @param {object} report
 * @returns {Promise<object>}
 */
export async function generateClientNarrative(report) {
  if (!report) {
    return generateDeterministicNarrative({});
  }

  const geminiKey = process.env.GEMINI_API_KEY || '';
  const groqKey = process.env.GROQ_API_KEY || '';

  // If no AI keys configured, immediately return deterministic narrative without delay
  if (!geminiKey && !groqKey) {
    return generateDeterministicNarrative(report);
  }

  const business = report.businessName || 'Client Website';
  const score = report.overallScore ?? 75;
  const criticals = (report.findings || []).filter((f) => f.severity?.toLowerCase() === 'critical').slice(0, 3);
  const warnings = (report.findings || []).filter((f) => f.severity?.toLowerCase() === 'warning').slice(0, 3);

  const topIssuesStr = [...criticals, ...warnings]
    .map((f, i) => `${i + 1}. ${f.headline} (${f.severity}): ${f.businessImpact || f.userImpact}`)
    .join('\n');

  const prompt = `You are an expert technical website consultant advising a freelance developer (Abid) on how to present website audit findings to a non-technical business owner for "${business}" (Health Score: ${score}/100).
Top technical issues found:
${topIssuesStr}

Task: Write an honest, professional 2-3 sentence executive summary explaining what is costing them leads or search traffic in plain English. Avoid developer jargon. Do not hallucinate access-gated details. Return only the 2-3 sentence summary paragraph.`;

  try {
    let aiText = '';
    let providerName = '';

    if (geminiKey) {
      aiText = await callGeminiApi(geminiKey, prompt);
      providerName = 'Google Gemini (Free Tier)';
    } else if (groqKey) {
      aiText = await callGroqApi(groqKey, prompt);
      providerName = 'Groq Llama 3.1 (Free Tier)';
    }

    if (aiText) {
      const fallback = generateDeterministicNarrative(report);
      return {
        executivePitch: aiText,
        priorityExplanations: fallback.priorityExplanations,
        aiProvider: providerName,
        isAiGenerated: true
      };
    }
  } catch (err) {
    console.warn(`[AI Explainer] Provider call failed (${err.message}) — using deterministic fallback.`);
  }

  return generateDeterministicNarrative(report);
}
