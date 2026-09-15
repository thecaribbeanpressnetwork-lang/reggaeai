import { auth } from '../../../../auth';
import { databaseConfigured, query } from '../../../../lib/db';

export async function POST(request){
  const session=await auth();
  if(!session?.user?.email)return Response.json({ok:false,state:'AUTH_REQUIRED',message:'Sign in before confirming rights.'},{status:401});
  if(!databaseConfigured())return Response.json({ok:false,state:'DATABASE_REQUIRED'},{status:503});

  const body=await request.json().catch(()=>({}));
  const importId=String(body.importId||'').trim();
  if(!importId||body.attest!==true)return Response.json({ok:false,state:'ATTESTATION_REQUIRED',message:'Explicit rights confirmation is required.'},{status:400});

  try{
    const user=await query('select id from users where email=$1 limit 1',[session.user.email.toLowerCase()]);
    const userId=user.rows[0]?.id;
    if(!userId)return Response.json({ok:false,state:'ACCOUNT_NOT_PERSISTED'},{status:409});

    const updated=await query(`update imports set rights_confirmed=true, updated_at=now() where id=$1 and user_id=$2 returning id,rights_confirmed,state`,[importId,userId]);
    if(!updated.rows[0])return Response.json({ok:false,state:'IMPORT_NOT_FOUND'},{status:404});
    return Response.json({ok:true,state:'RIGHTS_CONFIRMED',import:updated.rows[0],message:'Rights attestation recorded. This is a creator statement, not independent verification.'});
  }catch(error){
    console.error('import_rights_confirm_failed',error?.message||error);
    return Response.json({ok:false,state:'BLOCKED',message:'Rights confirmation could not be stored.'},{status:500});
  }
}
