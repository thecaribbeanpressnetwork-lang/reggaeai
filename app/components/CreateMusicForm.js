'use client';

import { useRef, useState } from 'react';
import { caribbeanGenreOptions } from '../../lib/caribbeanGenres';

export default function CreateMusicForm({ enabled = false }) {
  const [mode, setMode] = useState('song');
  const [genre, setGenre] = useState('country-reggae');
  const [prompt, setPrompt] = useState('');
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const timer = useRef(null);

  async function poll(taskId) {
    try {
      const response = await fetch(`/api/create/music/${encodeURIComponent(taskId)}`, { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || body.state || 'Status check failed.');
      setStatus(body);
      if (!['SUCCEEDED','FAILED'].includes(body.state)) timer.current = setTimeout(() => poll(taskId), 5000);
    } catch (err) { setError(err.message); }
  }

  async function submit(event) {
    event.preventDefault();
    if (timer.current) clearTimeout(timer.current);
    setError(''); setStatus(null); setJob(null);
    try {
      const response = await fetch('/api/create/music', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode, genre, prompt })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || body.state || 'Generation could not start.');
      setJob(body.job);
      setStatus({ state: body.state, providerStatus: 'SUBMITTED' });
      poll(body.job.provider_job_id);
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="creatorTool">
      <form className="creatorForm" onSubmit={submit}>
        <div className="fieldPair">
          <label><span>Make</span><select value={mode} onChange={(e) => setMode(e.target.value)} disabled={!enabled}><option value="song">Song</option><option value="riddim">Riddim</option><option value="beat">Beat</option></select></label>
          <label><span>Caribbean direction</span><select value={genre} onChange={(e) => setGenre(e.target.value)} disabled={!enabled}>{caribbeanGenreOptions.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></label>
        </div>
        <label><span>Creative direction</span><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Tell ReggaeAI what the record should feel, say or do. The Caribbean intelligence layer enriches the provider prompt." disabled={!enabled} rows={5} /></label>
        <button className="primary" type="submit" disabled={!enabled || prompt.trim().length < 8}>{enabled ? 'Generate with Treblo' : 'Generation not connected'}</button>
      </form>

      {error ? <div className="importResult error"><strong>BLOCKED</strong><span>{error}</span></div> : null}
      {status ? <div className="generationStatus"><span className="eyebrow">REAL PROVIDER STATUS</span><strong>{status.providerStatus || status.state}</strong><span>{status.state}</span></div> : null}
      {status?.songPaths?.length ? <div className="generatedOutputs">{status.songPaths.map((url, index) => <div key={url} className="generatedOutput"><strong>Temporary preview {index + 1}</strong><audio controls preload="metadata" src={url} /><span>Provider-hosted URL. Not publication eligible until copied to controlled ReggaeAI storage.</span></div>)}</div> : null}
      {job ? <small className="jobRef">Job: {job.id}</small> : null}
    </div>
  );
}
