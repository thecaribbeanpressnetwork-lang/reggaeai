'use client';

import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY='reggaeai:current-track';

export default function PersistentPlayer(){
  const audioRef=useRef(null);
  const [track,setTrack]=useState(null);
  const [playing,setPlaying]=useState(false);
  const [progress,setProgress]=useState(0);

  useEffect(()=>{
    try{const saved=localStorage.getItem(STORAGE_KEY);if(saved)setTrack(JSON.parse(saved));}catch{}
    function handle(event){const next=event.detail;if(!next?.url)return;setTrack(next);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{};setTimeout(()=>audioRef.current?.play().catch(()=>{}),0);}
    window.addEventListener('reggaeai:play',handle);
    return()=>window.removeEventListener('reggaeai:play',handle);
  },[]);

  useEffect(()=>{if(track?.url&&audioRef.current){audioRef.current.src=track.url;}},[track]);

  function toggle(){if(!audioRef.current||!track?.url)return;if(audioRef.current.paused)audioRef.current.play().catch(()=>{});else audioRef.current.pause();}

  function seek(event){
    if(!audioRef.current||!track?.url||!audioRef.current.duration)return;
    const rect=event.currentTarget.getBoundingClientRect();
    const ratio=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
    audioRef.current.currentTime=ratio*audioRef.current.duration;
  }

  return <div className={`player ${track?.url?'':'playerDormant'}`} aria-label="ReggaeAI persistent player">
    <div className="miniArt">{track?.artwork?<img src={track.artwork} alt=""/>:<img src="/reggaeai-lion.svg" alt=""/>}</div>
    <div className="track"><strong>{track?.title||'Player ready'}</strong><small>{track?.artist||'Select an authorized published track.'}</small></div>
    <button className="playerPlay" disabled={!track?.url} aria-label={playing?'Pause':'Play'} onClick={toggle}>{playing?'❚❚':'▶'}</button>
    <div className="progress" role="progressbar" aria-label="Track progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)} onClick={seek}><span style={{width:`${progress}%`}}/></div>
    <audio ref={audioRef} preload="metadata" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={(e)=>{const a=e.currentTarget;setProgress(a.duration?Math.min(100,(a.currentTime/a.duration)*100):0);}} onEnded={()=>{setPlaying(false);setProgress(0);}}/>
  </div>;
}
