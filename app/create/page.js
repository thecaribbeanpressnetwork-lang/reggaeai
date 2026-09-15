import './create.css';
import CreateMusicForm from '../components/CreateMusicForm';
import { auth } from '../../auth';
import { databaseConfigured } from '../../lib/db';
import { resolvedAffiliateTools } from '../../lib/affiliateTools';
import { trebloConfigured } from '../../lib/providers/treblo';

export const metadata = { title:'Create Caribbean AI Music | ReggaeAI', description:'Create Caribbean AI songs and riddims using ReggaeAI cultural prompt intelligence and verified generation providers.' };

export default async function CreatePage() {
  const session=await auth();
  const capabilities={account:Boolean(session?.user),database:databaseConfigured(),music:trebloConfigured(),storage:false,artwork:false,video:false};
  const musicEnabled=capabilities.account&&capabilities.database&&capabilities.music;
  const tools=resolvedAffiliateTools();
  return <main className="detailShell createShell">
    <section className="detailHero compact"><span className="eyebrow">CREATE · CARIBBEAN INTELLIGENCE FIRST</span><h1>Make the record. Keep the provenance.</h1><p>ReggaeAI enriches your direction with Caribbean genre intelligence before routing generation to a verified provider. It records the provider job and blocks publication until storage, rights and provenance are ready.</p><div className="capabilityRow"><span data-ready={capabilities.account}>Account</span><span data-ready={capabilities.database}>Database</span><span data-ready={capabilities.music}>Treblo</span><span data-ready={capabilities.storage}>Controlled storage</span></div>{!session?.user?<a className="primary linkButton authAction" href="/signin">Sign in to create</a>:null}</section>
    <section className="createGrid"><article className="createPrimary"><div className="sectionHeading"><span className="eyebrow">SONG · RIDDIM · BEAT</span><h2>Native music generation</h2></div><CreateMusicForm enabled={musicEnabled}/></article><aside className="createSide"><article><span className="resultType">ARTWORK</span><strong>Provider interface ready next.</strong><p>ReggaeAI will reuse one verified IBIS image provider once that adapter is inspectable in the connected FTN code.</p><span className="accountState small">TO VERIFY</span></article><article><span className="resultType">MUSIC VIDEO</span><strong>Provider interface ready next.</strong><p>Video generation stays unavailable until a verified IBIS adapter is inspectable. Upload/display support can operate independently.</p><span className="accountState small">TO VERIFY</span></article><article><span className="resultType">STORAGE</span><strong>Generated does not mean published.</strong><p>Treblo output URLs are temporary. ReggaeAI will not expose a Publish action until the accepted asset is copied into founder-controlled storage.</p><span className="accountState small">BLOCKING PUBLICATION</span></article></aside></section>
    <section className="detailSection creatorHub"><div className="sectionHeading"><span className="eyebrow">CREATOR HUB · VERIFIED PROGRAMS</span><h2>Use the right tool for the job.</h2><p>ReggaeAI recommends external tools only where the current program can be verified. A referral disclosure appears only after our unique affiliate link is actually configured.</p></div><div className="resultGrid">{tools.map(tool=><a className="resultCard" href={tool.url} target="_blank" rel="noreferrer sponsored" key={tool.key}><span className="resultType">{tool.affiliateActive?'AFFILIATE · DISCLOSURE':'DIRECT LINK · AFFILIATE NOT ACTIVATED'}</span><strong>{tool.name}</strong><small>{tool.purpose}</small><span>↗</span></a>)}</div></section>
  </main>;
}
