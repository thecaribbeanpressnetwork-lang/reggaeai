'use client';

import { useState } from 'react';

export default function CheckoutButton({ productId, label = 'Buy', disabled = false }) {
  const [state, setState] = useState('');
  async function checkout() {
    setState('CREATING CHECKOUT');
    try {
      const response = await fetch('/api/payments/checkout', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({productId}) });
      const body = await response.json();
      if (!response.ok || !body.checkoutUrl) throw new Error(body.error || body.state || 'Checkout unavailable.');
      setState('REDIRECTING');
      window.location.assign(body.checkoutUrl);
    } catch (error) { setState(error.message || 'BLOCKED'); }
  }
  return <div className="checkoutAction"><button className="primary" type="button" onClick={checkout} disabled={disabled}>{label}</button>{state?<span>{state}</span>:null}</div>;
}
