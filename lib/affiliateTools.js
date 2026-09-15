export const affiliateTools = [
  { key:'visuals', name:'Visuals.fm', purpose:'Music videos, lyric videos, cover art and release visuals', directUrl:'https://visuals.fm/', affiliateEnv:'AFFILIATE_VISUALS_URL', program:'25% recurring for up to 12 months', verified:'2026-09-15' },
  { key:'musicstory', name:'MusicStory', purpose:'AI music generation and creator tools', directUrl:'https://musicstory.ai/', affiliateEnv:'AFFILIATE_MUSICSTORY_URL', program:'30% recurring; program currently advertises lifetime customer payments', verified:'2026-09-15' },
  { key:'onemoreshot', name:'One More Shot AI', purpose:'AI music video generation', directUrl:'https://www.onemoreshot.ai/', affiliateEnv:'AFFILIATE_ONE_MORE_SHOT_URL', program:'15% recurring for 6 months', verified:'2026-09-15' },
  { key:'acestudio', name:'ACE Studio', purpose:'AI vocals and music production', directUrl:'https://acestudio.ai/', affiliateEnv:'AFFILIATE_ACE_STUDIO_URL', program:'30% recurring for 12 months', verified:'2026-09-15' },
  { key:'beatmotion', name:'BeatMotion', purpose:'AI music and video creation', directUrl:'https://beatmotion.io/', affiliateEnv:'AFFILIATE_BEATMOTION_URL', program:'30% recurring; program currently advertises ongoing subscription attribution', verified:'2026-09-15' }
];

export function resolvedAffiliateTools(){
  return affiliateTools.map(tool=>{
    const affiliateUrl=process.env[tool.affiliateEnv]||null;
    return {...tool,url:affiliateUrl||tool.directUrl,affiliateActive:Boolean(affiliateUrl)};
  });
}
