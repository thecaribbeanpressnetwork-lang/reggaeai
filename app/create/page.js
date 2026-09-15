import './create.css';
import CreateMusicForm from '../components/CreateMusicForm';
import { auth } from '../../auth';
import { databaseConfigured } from '../../lib/db';
import { resolvedAffiliateTools } from '../../lib/affiliateTools';
import { trebloConfigured } from '../../lib/providers/treblo';
import { googleDriveConfigured } from '../../lib/storage/googleDrive';

export const metadata = { title:'Create Caribbean AI Music | ReggaeAI', description:'Create Caribbean AI songs and riddims using ReggaeAI cultural prompt intelligence and verified generation providers.' };

export default async function CreatePage() {
  const session=await auth();
  const capabilities={account:Boolean(session?.user),database:databaseConfigured(),music:trebloConfigured(),storage:googleDriveConfigured()};
  const musicEnabled=capabilities.account&&capabilities.database&&capabilities.music;
  const tools=resolvedAffiliateTools();

  return <main className="detailShell createShell">
    <section className="detailHero compact">
      <span className="eyebrow">CREATE · CARIBBEAN INTELLIGENCE FIRST</span>
      <h1>Make the record. Keep the provenance.</h1>
      <p>Choose the Caribbean direction, describe the record and generate through ReggaeAI’s verified music provider. Every real generation job is recorded before the output is eligible for release.</p>
      {!session?.user?<a className="primary linkButton authAction" href="/signin">Sign in to create</a>:null}
    </section>

    <section className="createGrid createGridSingle">
      <article className="createPrimary">
        <div className="sectionHeading"><span className="eyebrow">SONG · RIDDIM · BEAT</span><h2>ReggaeAI Studio</h2></div>
        <CreateMusicForm enabled={musicEnabled}/>
        {session?.user ? <div className="truthPanel"><strong>{capabilities.storage?'Controlled storage connected':'Generation is active; release storage is still restricted.'}</strong><span>{capabilities.storage?'Successful output can move into founder-controlled Google Drive storage before publication.':'You can generate and preview real Treblo output. ReggaeAI will not falsely mark temporary provider media as a publishable master.'}</span></div> : null}
      </article>
    </section>

    {tools.length ? <section className="detailSection creatorHub"><div className="sectionHeading"><span className="eyebrow">CREATOR TOOLS</span><h2>Specialist tools when you need them.</h2><p>External tools are shown only when their current destination can be verified. Referral disclosure appears only when a real ReggaeAI affiliate link is configured.</p></div><div className="resultGrid">{tools.map(tool=><a className="resultCard" href={tool.url} target="_blank" rel="noreferrer sponsored" key={tool.key}><span className="resultType">{tool.affiliateActive?'AFFILIATE · DISCLOSURE':'DIRECT LINK'}</span><strong>{tool.name}</strong><small>{tool.purpose}</small><span>↗</span></a>)}</div></section>:null}
  </main>;
}
