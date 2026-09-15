import { databaseConfigured, getPool, query } from '../../../../../lib/db';
import { verifyWiPayResponse } from '../../../../lib/payments/wipay';

function money(value){const n=Number(value);return Number.isFinite(n)?n.toFixed(2):null;}

export async function GET(request){
  const url=new URL(request.url),status=url.searchParams.get('status'),transactionId=url.searchParams.get('transaction_id'),orderId=url.searchParams.get('order_id'),responseTotal=url.searchParams.get('total'),hash=url.searchParams.get('hash'),currency=(url.searchParams.get('currency')||'USD').toUpperCase();
  let state='UNVERIFIED';
  if(databaseConfigured()&&orderId){
    const orderResult=await query('select * from orders where external_order_id=$1 limit 1',[orderId]);const order=orderResult.rows[0];
    const hashVerified=Boolean(order&&status==='success'&&verifyWiPayResponse({transactionId,originalTotal:order.gross_amount,hash}));
    const matches=Boolean(hashVerified&&order.status==='pending'&&(!order.processor_transaction_id||order.processor_transaction_id===transactionId)&&order.currency===currency&&money(order.gross_amount)===money(responseTotal));
    if(matches){const client=await getPool().connect();try{await client.query('begin');const locked=await client.query('select * from orders where id=$1 for update',[order.id]);if(locked.rows[0]?.status==='pending'){await client.query("update orders set status='paid',processor_verified=true,processor_transaction_id=$1,paid_at=now(),accounting_state='webhook_pending' where id=$2",[transactionId,order.id]);await client.query(`insert into revenue_events (order_id,event_type,amount,currency,metadata) values ($1,'sale',$2,$3,$4::jsonb)`,[order.id,order.gross_amount,order.currency,JSON.stringify({processor:'wipay',transactionId,verification:'hash+ledger_match'})]);if(order.buyer_user_id){await client.query(`insert into download_entitlements (user_id,order_item_id) select $1,oi.id from order_items oi join products p on p.id=oi.product_id where oi.order_id=$2 and p.product_type='track_download' on conflict (order_item_id) do nothing`,[order.buyer_user_id,order.id]);await client.query(`insert into licenses (user_id,order_item_id,product_id,license_template_id,granted_terms) select $1,oi.id,p.id,p.license_template_id,coalesce(lt.terms,'{}'::jsonb) from order_items oi join products p on p.id=oi.product_id left join license_templates lt on lt.id=p.license_template_id where oi.order_id=$2 and p.product_type in ('beat_license','riddim_license') on conflict (order_item_id) do nothing`,[order.buyer_user_id,order.id]);}}await client.query('commit');state='VERIFIED_COMPLETE';}catch(error){await client.query('rollback');console.error('wipay_reconciliation_failed',error?.message||error);state='BLOCKED';}finally{client.release();}}else state=hashVerified?'MISMATCH_BLOCKED':'UNVERIFIED';
  }else if(status==='success')state='DATABASE_REQUIRED';
  const destination=new URL('/account/library',request.url);destination.searchParams.set('payment',state.toLowerCase());if(orderId)destination.searchParams.set('order',orderId);return Response.redirect(destination,303);
}
