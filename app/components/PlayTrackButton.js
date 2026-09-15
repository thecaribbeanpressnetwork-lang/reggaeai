'use client';

export default function PlayTrackButton({url,title,artist,artwork}){
  if(!url)return null;
  function play(){window.dispatchEvent(new CustomEvent('reggaeai:play',{detail:{url,title,artist,artwork:artwork||null}}));}
  return <button className="primary" type="button" onClick={play}>Play in ReggaeAI</button>;
}
