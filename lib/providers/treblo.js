const BASE_URL = 'https://api.treblo.com/v1';

export function trebloConfigured() {
  return Boolean(process.env.TREBLO_API_KEY);
}

function headers() {
  if (!process.env.TREBLO_API_KEY) throw new Error('TREBLO_NOT_CONFIGURED');
  return {
    Authorization: `Bearer ${process.env.TREBLO_API_KEY}`,
    'Content-Type': 'application/json'
  };
}

async function parseResponse(response) {
  const text = await response.text();
  let body = text;
  try { body = JSON.parse(text); } catch {}
  if (!response.ok) {
    const message = typeof body === 'object' ? body?.detail || body?.message || JSON.stringify(body) : body;
    throw new Error(`TREBLO_HTTP_${response.status}: ${message}`);
  }
  return body;
}

export async function startTrebloGeneration({ prompt, webhookUrl }) {
  const payload = { prompt, enable_streaming: true, stream_format: 'mp3' };
  if (webhookUrl) payload.webhook_url = webhookUrl;
  const response = await fetch(`${BASE_URL}/generations/v3`, {
    method: 'POST', headers: headers(), body: JSON.stringify(payload), cache: 'no-store'
  });
  const body = await parseResponse(response);
  if (!body?.task_id) throw new Error('TREBLO_TASK_ID_MISSING');
  return body;
}

export async function getTrebloStatus(taskId) {
  const response = await fetch(`${BASE_URL}/generations/status/${encodeURIComponent(taskId)}`, {
    headers: headers(), cache: 'no-store'
  });
  const body = await parseResponse(response);
  return typeof body === 'string' ? body : body?.status || 'UNKNOWN';
}

export async function getTrebloGeneration(taskId) {
  const response = await fetch(`${BASE_URL}/generations/${encodeURIComponent(taskId)}`, {
    headers: headers(), cache: 'no-store'
  });
  return parseResponse(response);
}

export async function getTrebloCredits() {
  const response = await fetch(`${BASE_URL}/credits/balance`, { headers: headers(), cache: 'no-store' });
  return parseResponse(response);
}

export function mapTrebloState(status) {
  if (status === 'SUCCESS') return 'succeeded';
  if (status === 'FAILURE') return 'failed';
  if (status === 'GENERATING_STREAMING_READY') return 'streaming';
  if (['RECEIVED','PROMPT','TASK_SENT'].includes(status)) return 'submitted';
  if (['GENERATE_TASK_STARTED','BEGINNING_GENERATION','GENERATING','DECOMPRESSING','SAVING'].includes(status)) return 'processing';
  return 'processing';
}
