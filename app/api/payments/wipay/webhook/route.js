import { getPool } from '../../../../../../lib/db';
import { accrueVerifiedOrder, reverseOrderAccruals } from '../../../../../../lib/accounting';
import { verifyWiPayWebhook } from '../../../../../lib/payments/wipay';

const reversalEvents=new Set(['payment.refunded','payment.chargeback_processed','payment.fraud_confirmed']);

export async function POST(request){
  const rawBody=await request.text();const timestamp=request.headers.get('x-wipay-webhook-timestamp');const signature=request.headers.get('x-wipay-webhook-signature');
  if(!verifyWiPayWebhook({rawBody,timestamp,signature}))return Response.json({ok:false,state:'SIGNATURE_INVALID'},{status:401});
  let envelope;try{envelope=JSON.parse(rawBody);}catch{return Response.json({ok:false,state:'INVALID_JSON'},{status:400});}
  if(!envelope?.id||!envelope?.event)return Response.json({ok:false,state:'INVALID_EVENT'},{status:400});
  const data=envelope.data||{},event=envelope.event,orderId=data.order_id,transactionId=data.transaction_id||envelope.meta?.transaction_id;
  const client=await getPool().connect();
  try{
    await client.query('begin');
    const seen=await client.query('select 1 from payment_webhook_events where id=$1',[envelope.id]);if(seen.rowCount){await client.query('rollback');return Response.json({ok:true,state:'DUPLICATE_IGNORED'});}
    await client.query(`insert into payment_webhook_events(id,event_type,transaction_id,order_id,payload) values($1,$2,$3,$4,$5::jsonb)`,[envelope.id,event,transactionId||null,orderId||null,rawBody]);
    if(event==='webhook.test'){await client.query('commit');return Response.json({ok:true,state:'TEST_ACKNOWLEDGED'});}
    const orderResult=orderId?await client.query('select * from orders where external_order_id=$1 for update',[orderId]):{rows:[]};const order=orderResult.rows[0];
    if(!order){await client.query('commit');return Response.json({ok:true,state:'ORPHAN_RECORDED'});}
    if(transactionId&&order.processor_transaction_id&&order.processor_transaction_id!==transactionId){await client.query("update orders set accounting_state='transaction_mismatch' where id=$1",[order.id]);await client.query('commit');return Response.json({ok:true,state:'MISMATCH_RECORDED'});}
    if(event==='payment.success'){
      if(String(data.currency||'').toUpperCase()!==order.currency||Number(data.total).toFixed(2)!==Number(order.gross_amount).toFixed(2)){await client.query("update orders set accounting_state='amount_mismatch' where id=$1",[order.id]);await client.query('commit');return Response.json({ok:true,state:'MISMATCH_RECORDED'});}
      if(!order.processor_verified)await client.query("update orders set status='paid',processor_verified=true,processor_transaction_id=$1,paid_at=coalesce(paid_at,now()) where id=$2",[transactionId,order.id]);
      if(!['accrued_pending','reversed'].includes(order.accounting_state)){await accrueVerifiedOrder(client,{order:{...order,processor_transaction_id:transactionId},totalCredited:data.total_credited,currencyCredited:String(data.currency_credited||data.currency||'').toUpperCase(),eventId:envelope.id});}
    }else if(reversalEvents.has(event)){
      await reverseOrderAccruals(client,{order,eventId:envelope.id,eventType:event});
      await client.query("update orders set status=$1 where id=$2",[event==='payment.refunded'?'refunded':event==='payment.chargeback_processed'?'chargeback':'fraud',order.id]);
    }else if(event==='payment.chargeback_pending'||event==='payment.refund_requested'){
      await client.query("update orders set accounting_state='hold_pending' where id=$1",[order.id]);
    }else if(event==='payment.chargeback_released'||event==='payment.refund_rejected'){
      await client.query("update orders set accounting_state=case when processor_verified then 'accrued_pending' else accounting_state end where id=$1",[order.id]);
    }else if(event==='payment.failed'||event==='payment.error'){
      if(order.status==='pending')await client.query("update orders set status='failed',accounting_state='closed_failed' where id=$1",[order.id]);
    }
    await client.query('commit');return Response.json({ok:true,state:'RECORDED'});
  }catch(error){await client.query('rollback');console.error('wipay_webhook_failed',error?.message||error);return Response.json({ok:false,state:'RETRY',message:'Event was not durably applied.'},{status:500});}finally{client.release();}
}
