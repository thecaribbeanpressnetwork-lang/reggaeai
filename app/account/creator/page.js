import ArtistClaimForm from '../../components/ArtistClaimForm';
import { auth } from '../../../auth';
import { databaseConfigured, query } from '../../../lib/db';
import styles from './creator.module.css';

export const metadata = { title: 'Creator | ReggaeAI', robots: { index: false, follow: false } };

export default async function CreatorPage() {
  const session = await auth();
  const dbReady = databaseConfigured();
  let userId=null, artists=[], imports=[], claims=[], readiness=[];

  if(session?.user?.email&&dbReady){
    const user=await query('select id from users where email=$1 limit 1',[session.user.email.toLowerCase()]);userId=user.rows[0]?.id||null;
    if(userId){
      const results=await Promise.all([
        query("select id,display_name,slug from artists where owner_user_id is null or owner_user_id=$1 order by display_name limit 100",[userId]),
        query('select id,source_provider,source_url,canonical_url,state,rights_confirmed,hosted,monetizable,created_at from imports where user_id=$1 order by created_at desc limit 50',[userId]),
        query('select ac.id,ac.status,ac.created_at,a.display_name,a.slug from artist_claims ac join artists a on a.id=ac.artist_id where ac.user_id=$1 order by ac.created_at desc limit 50',[userId]),
        query(`select r.slug,r.title,rr.readiness_state,rr.score,rr.blockers,rr.rights_state,rr.provenance_state from recordings r left join release_readiness rr on rr.recording_id=r.id left join artists a on a.id=r.primary_artist_id where a.owner_user_id=$1 order by r.updated_at desc limit 50`,[userId])
      ]);artists=results[0].rows;imports=results[1].rows;claims=results[2].rows;readiness=results[3].rows;
    }
  }

  return <main className="accountShell">
    <section className="accountHero compact"><span className="eyebrow">CREATOR CONTROL</span><h1>Claims, imports and release truth.</h1><p>Creator identity, source provenance and rights evidence remain separate. A public link never silently becomes ownership.</p><div className="capabilityRow"><span data-ready={Boolean(session?.user)}>Account</span><span data-ready={dbReady}>Database</span><span data-ready={Boolean(userId)}>Creator record</span></div>{!session?.user?<a className="primary linkButton authAction" href="/signin">Sign in</a>:null}</section>

    <section className={styles.panel}><div className={styles.head}><div><span className="eyebrow">CLAIM ARTIST</span><h2>Evidence before control.</h2></div><span className={styles.state}>{session?.user&&dbReady?'READY':'BLOCKED'}</span></div><ArtistClaimForm artists={artists} enabled={Boolean(session?.user&&dbReady&&artists.length)}/>{claims.length?<div className="adminList">{claims.map(c=><a key={c.id} href={`/artists/${c.slug}`}><div><strong>{c.display_name}</strong><span>Claim submitted {new Date(c.created_at).toLocaleDateString()}</span></div><div><span>{c.status}</span></div></a>)}</div>:null}</section>

    <section className={styles.panel}><div className={styles.head}><div><span className="eyebrow">IMPORTS</span><h2>{imports.length} retained source records</h2></div></div>{imports.length?<div className="adminList">{imports.map(i=><div className="payoutRow" key={i.id}><div><strong>{i.source_provider}</strong><span>{i.canonical_url||i.source_url}</span></div><div><span>{i.state}</span><span>{i.rights_confirmed?'RIGHTS CONFIRMED':'RIGHTS UNCONFIRMED'}</span></div></div>)}</div>:<div className="emptyState"><strong>No persistent imports yet.</strong><span>{dbReady?'Use Upload or Smart Import to create source records.':'The importer can discover metadata, but nothing is being pretended as persisted without a database.'}</span><a href="/upload">Open Upload</a></div>}</section>

    <section className={styles.panel}><div className={styles.head}><div><span className="eyebrow">RELEASE INTELLIGENCE</span><h2>Only unresolved evidence belongs here.</h2></div></div>{readiness.length?<div className="adminList">{readiness.map(r=><a key={r.slug} href={`/music/${r.slug}`}><div><strong>{r.title}</strong><span>{r.readiness_state||'discovered'} · rights {r.rights_state||'unknown'} · provenance {r.provenance_state||'unknown'}</span></div><div><span>{r.score||0}%</span><span>{Array.isArray(r.blockers)?r.blockers.length:0} blockers</span></div></a>)}</div>:<div className="emptyState"><strong>No creator release records yet.</strong><span>No readiness score is fabricated until a recording exists in the operational database.</span></div>}</section>
  </main>;
}
