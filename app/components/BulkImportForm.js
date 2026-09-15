'use client';

import { useMemo, useState } from 'react';

export default function BulkImportForm({ enabled = false }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const urls = useMemo(() => text.split(/\r?\n/).map((x) => x.trim()).filter(Boolean), [text]);

  async function submit(event) {
    event.preventDefault();
    setError(''); setResult(null);
    try {
      const response = await fetch('/api/import/bulk', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ urls }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || body.state || 'Bulk import failed.');
      setResult(body);
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="creatorTool">
      <form className="creatorForm" onSubmit={submit}>
        <label><span>Song/source URLs · one per line</span><textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder="https://suno.com/s/...\nhttps://suno.com/song/..." disabled={!enabled} /></label>
        <div className="bulkFooter"><span>{Math.min(urls.length, 50)} / 50 links</span><button className="primary" type="submit" disabled={!enabled || !urls.length}>Discover imports</button></div>
      </form>
      {error ? <div className="importResult error"><strong>BLOCKED</strong><span>{error}</span></div> : null}
      {result ? <div className="bulkResults"><div className="factRow"><span>{result.total} processed</span><span>{result.summary.readyForReview} ready for review</span><span>{result.summary.needsReview} needs review</span><span>{result.summary.failed} failed</span><span>{result.persisted} persisted</span></div>{result.items.map((item, i) => <div className="bulkRow" key={`${item.sourceUrl}-${i}`}><strong>{item.metadata?.title || item.sourceUrl}</strong><span>{item.provider || 'unknown'} · {item.state}</span></div>)}</div> : null}
    </div>
  );
}
