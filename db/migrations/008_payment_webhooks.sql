create table if not exists payment_webhook_events (
  id text primary key,
  processor text not null default 'wipay',
  event_type text not null,
  transaction_id text,
  order_id text,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);
create index if not exists payment_webhook_order_idx on payment_webhook_events(order_id, processed_at desc);
