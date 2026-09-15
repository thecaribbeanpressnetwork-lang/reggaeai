'use client';

import { useState } from 'react';

export default function SaveButton({ type, slug, disabled = false }) {
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  async function save() {
    if (disabled || state === 'saving') return;
    setState('saving');
    setMessage('');
    try {
      const response = await fetch('/api/library/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type, slug })
      });
      const body = await response.json();
      if (response.status === 401) {
        window.location.href = '/signin';
        return;
      }
      if (!response.ok) throw new Error(body.message || body.state || 'Could not save this item.');
      setState('saved');
      setMessage('Saved to Library');
    } catch (error) {
      setState('error');
      setMessage(error.message);
    }
  }

  return (
    <div className="saveAction">
      <button className="secondary" type="button" onClick={save} disabled={disabled || state === 'saving' || state === 'saved'}>
        {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : 'Save to Library'}
      </button>
      {message ? <span>{message}</span> : null}
    </div>
  );
}
