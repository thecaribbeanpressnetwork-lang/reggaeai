'use client';

import { useState } from 'react';

export default function PromoteImportButton({ importId, disabled = false }) {
  const [state,setState]=useState('');
  const [busy,setBusy]=useState(false);

  async function promote(){
    if(disabled||busy)return;
    setBusy(true);setState('CREATING DRAFT');
    try{
      const response=await fetch('/api/admin/imports/promote',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({importId})});
      const body=await response.json();
      if(!response.ok)throw new Error(body.message||body.state||'Promotion failed.');
      setState(body.state==='ALREADY_CATALOGUED'?'ALREADY CATALOGUED':'DRAFT CREATED');
      if(body.recording?.slug) window.location.assign(`/music/${body.recording.slug}`);
    }catch(error){setState(error.message||'BLOCKED');}
    finally{setBusy(false);}
  }

  return <div className="checkoutAction"><button className="secondary" type="button" onClick={promote} disabled={disabled||busy}>{busy?'Creating draft…':'Promote to draft catalogue'}</button>{state?<span>{state}</span>:null}</div>;
}
