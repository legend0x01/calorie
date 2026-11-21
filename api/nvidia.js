// Vercel serverless function: same-origin proxy for NVIDIA chat completions.
//
// Why it exists: integrate.api.nvidia.com sends no CORS headers, so a browser
// cannot call it directly. The web build of NutriPulse posts here instead; the
// native apps still call NVIDIA directly (CORS does not apply to them).
//
// The user's own API key arrives in the Authorization header and is forwarded
// as-is. It is never logged or stored. The proxy only talks to one fixed NVIDIA
// URL and only accepts the models and fields the app itself sends, so it can't
// be used as a general-purpose relay.

const UPSTREAM = 'https://integrate.api.nvidia.com/v1/chat/completions';

// Keep in sync with NVIDIA_MODELS in src/services/aiService.ts.
const ALLOWED_MODELS = new Set([
  'nvidia/nemotron-3.5-lightning-30b-a3b',
  'nvidia/nemotron-3-ultra-550b-a55b',
  'google/gemma-4-31b-it',
]);

const MAX_MESSAGES = 10;
const MAX_CHARS = 20000;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = req.headers.authorization || '';
  if (!/^Bearer\s+\S{10,}$/.test(auth)) {
    return res.status(401).json({ error: 'Missing NVIDIA API key' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { model, messages, temperature, top_p, max_tokens } = body;
  if (!ALLOWED_MODELS.has(model)) {
    return res.status(400).json({ error: 'Model not allowed' });
  }
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(m => m && typeof m.content === 'string' && ['system', 'user', 'assistant'].includes(m.role)) ||
    messages.reduce((n, m) => n + m.content.length, 0) > MAX_CHARS
  ) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  const upstreamBody = {
    model,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    temperature: typeof temperature === 'number' ? temperature : 0.2,
    max_tokens: Math.min(Number(max_tokens) || 512, 2048),
  };
  if (typeof top_p === 'number') upstreamBody.top_p = top_p;

  try {
    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify(upstreamBody),
      signal: AbortSignal.timeout(25000),
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (err) {
    const timedOut = err && (err.name === 'TimeoutError' || err.name === 'AbortError');
    return res.status(timedOut ? 504 : 502).json({ error: timedOut ? 'NVIDIA timed out' : 'Could not reach NVIDIA' });
  }
};
