'use client';

import { useState } from 'react';

export default function ImportRightsControl({ importId, confirmed = false }) {
  const [checked,setChecked]=useState(false);
  const [state,setState]=useState(confirmed?'RIGHTS CONFIRMED':'');
  const [busy,setBusy]=useState(false);

  async function confirm(){
    if(!checked||confirmed||busy)return;
    setBusy(true);setState('SAVING');
    try{
      const response=await fetch('/api/import/rights',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({importId,attest:true})});
      const body=await response.json();
      if(!response.ok)throw new Error(body.message||body.state||'Rights confirmation failed.');
      setState('RIGHTS CONFIRMED');
    }catch(error){setState(error.message||'BLOCKED');}
    finally{setBusy(false);}
  }

  if(confirmed)return <span>RIGHTS CONFIRMED</span>;
  return <div className="rightsControl"><label><input type="checkbox" checked={checked} onChange={(e)=>setChecked(e.target.checked)}/><span>I confirm I own or control the rights needed to submit this recording to ReggaeAI.</span></label><button className="secondary" type="button" onClick={confirm} disabled={!checked||busy}>{busy?'Saving…':'Confirm rights'}</button>{state?<small>{state}</small>:null}</div>;
}
