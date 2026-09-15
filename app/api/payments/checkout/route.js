import { createHostedCheckout, getWiPayConfig } from '../../../lib/payments/wipay';

const SANDBOX_PRODUCTS = {
  'reggaeai-test-1': { name: 'ReggaeAI sandbox test', amount: 1.00, currency: 'USD' }
};

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const productId = typeof body?.productId === 'string' ? body.productId : '';
  const config = getWiPayConfig();

  if (config.environment === 'live') {
    return Response.json({
      ok: false,
      state: 'BLOCKED',
      error: 'Live checkout stays disabled until catalogue pricing and WiPay live credentials are connected.'
    }, { status: 503 });
  }

  const product = SANDBOX_PRODUCTS[productId];
  if (!product) {
    return Response.json({ ok: false, state: 'BLOCKED', error: 'Unknown sandbox product.' }, { status: 400 });
  }

  const orderId = `rai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    const checkout = await createHostedCheckout({
      orderId,
      total: product.amount,
      currency: product.currency,
      data: { productId, productName: product.name }
    });
    return Response.json({
      ok: true,
      state: 'CHECKOUT_CREATED',
      orderId,
      checkoutUrl: checkout.url,
      transactionId: checkout.transaction_id,
      environment: checkout.environment
    });
  } catch (error) {
    return Response.json({ ok: false, state: 'ERROR', error: error.message }, { status: 502 });
  }
}
