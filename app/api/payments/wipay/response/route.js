import { verifyWiPayResponse } from '../../../../lib/payments/wipay';

export async function GET(request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const transactionId = url.searchParams.get('transaction_id');
  const orderId = url.searchParams.get('order_id');
  const total = url.searchParams.get('total');
  const hash = url.searchParams.get('hash');
  const currency = url.searchParams.get('currency');
  const verified = status === 'success' && verifyWiPayResponse({ transactionId, total, hash });

  // No entitlement is granted here yet. This endpoint only verifies and reports.
  // The persistent purchase ledger will consume verified responses in the next data-layer slice.
  const destination = new URL('/', request.url);
  destination.searchParams.set('payment', verified ? 'verified' : status || 'unknown');
  if (orderId) destination.searchParams.set('order', orderId);
  if (currency) destination.searchParams.set('currency', currency);
  return Response.redirect(destination, 303);
}
