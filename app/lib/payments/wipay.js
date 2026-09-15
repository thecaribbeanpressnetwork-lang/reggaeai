import crypto from 'node:crypto';

const WIPAY_TT_ENDPOINT = 'https://tt.wipayfinancial.com/plugins/payments/request';

export function getWiPayConfig() {
  const environment = process.env.WIPAY_ENV === 'live' ? 'live' : 'sandbox';
  return {
    environment,
    endpoint: WIPAY_TT_ENDPOINT,
    accountNumber: environment === 'sandbox' ? '1234567890' : process.env.WIPAY_ACCOUNT_NUMBER,
    apiKey: environment === 'sandbox' ? (process.env.WIPAY_API_KEY || '123') : process.env.WIPAY_API_KEY,
    origin: process.env.WIPAY_ORIGIN || 'ReggaeAI',
    responseUrl: process.env.WIPAY_RESPONSE_URL
  };
}

export function wiPayReadyForLive(config = getWiPayConfig()) {
  return config.environment === 'live' && Boolean(config.accountNumber && config.apiKey && config.responseUrl);
}

export async function createHostedCheckout({ orderId, total, currency = 'USD', data = {} }) {
  const config = getWiPayConfig();
  if (config.environment === 'live' && !wiPayReadyForLive(config)) {
    throw new Error('WiPay live credentials are not configured.');
  }

  const responseUrl = config.responseUrl || 'https://reggaeai-live.up.railway.app/api/payments/wipay/response';
  const body = new URLSearchParams({
    account_number: config.accountNumber,
    avs: '0',
    country_code: 'TT',
    currency,
    environment: config.environment,
    fee_structure: 'merchant_absorb',
    method: 'credit_card',
    order_id: orderId,
    origin: config.origin,
    response_url: responseUrl,
    total: Number(total).toFixed(2),
    data: JSON.stringify(data)
  });

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store'
  });

  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = null; }
  if (!response.ok || !payload?.url || !payload?.transaction_id) {
    throw new Error(payload?.message || 'WiPay did not return a hosted checkout URL.');
  }
  return { ...payload, environment: config.environment };
}

export function verifyWiPayResponse({ transactionId, total, hash }) {
  const { apiKey } = getWiPayConfig();
  if (!transactionId || !total || !hash || !apiKey) return false;
  const expected = crypto.createHash('md5').update(`${transactionId}${total}${apiKey}`).digest('hex');
  const actual = String(hash).toLowerCase();
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}
