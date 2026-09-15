-- Licensing and accounting terms stay explicit and product-scoped.
create table if not exists license_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version integer not null default 1,
  terms jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(name, version)
);

alter table if exists products add column if not exists license_template_id uuid references license_templates(id);
alter table if exists products add column if not exists reggaeai_commission_bps integer check (reggaeai_commission_bps between 0 and 10000);
alter table if exists orders add column if not exists accounting_state text not null default 'unreconciled';

create table if not exists licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  order_item_id uuid not null unique references order_items(id) on delete cascade,
  product_id uuid not null references products(id),
  license_template_id uuid references license_templates(id),
  granted_terms jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- A licence is granted only from a verified paid order item.
-- Commission is product-scoped or explicitly configured; never silently assumed.
