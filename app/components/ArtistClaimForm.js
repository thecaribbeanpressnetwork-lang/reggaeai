'use client';

import { useState } from 'react';

export default function ArtistClaimForm({ artists = [], enabled = false }) {
  const [artistId, setArtistId] = useState(artists[0]?.id || '');
  const [evidence, setEvidence] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError(''); setResult(null);
    try {
      const response = await fetch('/api/artist-claims', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({artist_id:artistId,evidence}) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || body.state || 'Claim could not be submitted.');
      setResult(body);
    } catch (err) { setError(err.message); }
  }

  return <form className="creatorForm" onSubmit={submit}>
    <label><span>Artist profile</span><select value={artistId} onChange={(e)=>setArtistId(e.target.value)} disabled={!enabled}>{artists.length?artists.map(a=><option value={a.id} key={a.id}>{a.display_name}</option>):<option>No claimable profiles</option>}</select></label>
    <label><span>Ownership / control evidence</span><textarea value={evidence} onChange={(e)=>setEvidence(e.target.value)} rows={5} placeholder="Explain how you created or control this artist/project and point to evidence ReggaeAI can review." disabled={!enabled}/></label>
    <button className="primary" type="submit" disabled={!enabled||!artistId||evidence.trim().length<12}>Submit claim for review</button>
    {error?<div className="importResult error"><strong>BLOCKED</strong><span>{error}</span></div>:null}
    {result?<div className="importResult ok"><strong>{result.state}</strong><span>{result.message}</span></div>:null}
  </form>;
}
