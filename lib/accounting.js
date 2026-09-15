function cents(value){return Math.round(Number(value)*100);}
function dollars(c){return Number((c/100).toFixed(2));}

export async function accrueVerifiedOrder(client,{order,totalCredited,currencyCredited,eventId}){
  if(currencyCredited!=='USD'){await client.query("update orders set accounting_state='currency_review' where id=$1",[order.id]);return{state:'CURRENCY_REVIEW'};}
  const items=await client.query(`select oi.id,oi.unit_amount,oi.quantity,p.id product_id,p.reggaeai_commission_bps from order_items oi join products p on p.id=oi.product_id where oi.order_id=$1`,[order.id]);
  if(!items.rows.length){await client.query("update orders set accounting_state='no_items' where id=$1",[order.id]);return{state:'NO_ITEMS'};}
  if(items.rows.some(i=>i.reggaeai_commission_bps===null)){await client.query("update orders set accounting_state='commission_required' where id=$1",[order.id]);return{state:'COMMISSION_REQUIRED'};}
  const grossCents=cents(order.gross_amount), creditedCents=cents(totalCredited);if(grossCents<=0||creditedCents<0||creditedCents>grossCents){await client.query("update orders set accounting_state='credit_mismatch' where id=$1",[order.id]);return{state:'CREDIT_MISMATCH'};}
  const feeCents=grossCents-creditedCents;
  if(feeCents)await client.query(`insert into revenue_events(order_id,event_type,amount,currency,metadata) values($1,'processor_fee',$2,'USD',$3::jsonb)`,[order.id,-dollars(feeCents),JSON.stringify({processor:'wipay',webhookEventId:eventId})]);
  let allocated=0;
  for(let index=0;index<items.rows.length;index++){
    const item=items.rows[index], lineGross=cents(item.unit_amount)*Number(item.quantity||1);const lineNet=index===items.rows.length-1?creditedCents-allocated:Math.round(creditedCents*(lineGross/grossCents));allocated+=lineNet;
    const commission=Math.round(lineNet*Number(item.reggaeai_commission_bps)/10000),creatorPool=lineNet-commission;
    if(commission)await client.query(`insert into revenue_events(order_id,event_type,amount,currency,metadata) values($1,'reggaeai_commission',$2,'USD',$3::jsonb)`,[order.id,dollars(commission),JSON.stringify({productId:item.product_id,webhookEventId:eventId})]);
    const splits=await client.query(`select rs.rights_holder_id,rs.share_bps from royalty_splits rs where rs.product_id=$1 order by rs.rights_holder_id`,[item.product_id]);
    const splitTotal=splits.rows.reduce((sum,s)=>sum+Number(s.share_bps),0);if(splitTotal!==10000){await client.query("update orders set accounting_state='split_review' where id=$1",[order.id]);return{state:'SPLIT_REVIEW'};}
    let splitAllocated=0;
    for(let s=0;s<splits.rows.length;s++){
      const split=splits.rows[s];const amountCents=s===splits.rows.length-1?creatorPool-splitAllocated:Math.round(creatorPool*Number(split.share_bps)/10000);splitAllocated+=amountCents;const amount=dollars(amountCents);
      await client.query(`insert into revenue_events(order_id,event_type,amount,currency,rights_holder_id,metadata) values($1,'creator_accrual',$2,'USD',$3,$4::jsonb)`,[order.id,amount,split.rights_holder_id,JSON.stringify({productId:item.product_id,webhookEventId:eventId,state:'pending'})]);
      await client.query(`insert into creator_balances(rights_holder_id,pending_usd,available_usd,lifetime_usd) values($1,$2,0,$2) on conflict(rights_holder_id) do update set pending_usd=creator_balances.pending_usd+excluded.pending_usd,lifetime_usd=creator_balances.lifetime_usd+excluded.lifetime_usd,updated_at=now()`,[split.rights_holder_id,amount]);
    }
  }
  await client.query("update orders set accounting_state='accrued_pending' where id=$1",[order.id]);return{state:'ACCRUED_PENDING'};
}

export async function reverseOrderAccruals(client,{order,eventId,eventType}){
  const accruals=await client.query(`select rights_holder_id,sum(amount)::numeric amount from revenue_events where order_id=$1 and event_type='creator_accrual' and amount>0 group by rights_holder_id`,[order.id]);
  for(const row of accruals.rows){const amount=Number(row.amount);const balance=await client.query('select pending_usd,available_usd,lifetime_usd from creator_balances where rights_holder_id=$1 for update',[row.rights_holder_id]);if(!balance.rows[0])continue;const pending=Number(balance.rows[0].pending_usd),takePending=Math.min(pending,amount),remainder=amount-takePending;await client.query(`update creator_balances set pending_usd=pending_usd-$2,available_usd=available_usd-$3,lifetime_usd=lifetime_usd-$4,updated_at=now() where rights_holder_id=$1`,[row.rights_holder_id,takePending,remainder,amount]);await client.query(`insert into revenue_events(order_id,event_type,amount,currency,rights_holder_id,metadata) values($1,'creator_accrual',$2,'USD',$3,$4::jsonb)`,[order.id,-amount,row.rights_holder_id,JSON.stringify({reversal:eventType,webhookEventId:eventId})]);}
  await client.query(`update download_entitlements set revoked_at=coalesce(revoked_at,now()) where order_item_id in(select id from order_items where order_id=$1)`,[order.id]);await client.query(`update licenses set revoked_at=coalesce(revoked_at,now()) where order_item_id in(select id from order_items where order_id=$1)`,[order.id]);await client.query("update orders set accounting_state='reversed' where id=$1",[order.id]);
}
