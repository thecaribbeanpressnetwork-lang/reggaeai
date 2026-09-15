'use client';

import { useState } from 'react';

export default function ImportForm() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ ok: false, error: 'Import service is unavailable.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={submit}>
        <input value={url} onChange={(event) => setUrl(event.target.value)} aria-label="Song link" placeholder="https://suno.com/s/..." />
        <button type="submit" className="primary" disabled={loading}>{loading ? 'Checking…' : 'Import song'}</button>
      </form>
      {result && (
        <div className={`importResult ${result.ok ? 'ok' : 'error'}`}>
          {result.ok ? (
            <><strong>{result.provider.toUpperCase()} link recognized</strong><span>State: {result.state}. Rights are not assumed from a public link.</span></>
          ) : (
            <><strong>Import blocked</strong><span>{result.error}</span></>
          )}
        </div>
      )}
    </div>
  );
}
