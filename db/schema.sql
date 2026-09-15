-- ReggaeAI core PostgreSQL schema
-- Designed for managed PostgreSQL (Railway Postgres, Supabase, or equivalent).

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  display_name text,
  avatar_url text,
  auth_provider text,
  auth_subject text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(auth_provider, auth_subject)
);

create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  artist_type text not null check (artist_type in ('human','ai_persona','hybrid','project')),
  bio text,
  region text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists artist_claims (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  state text not null default 'pending' check (state in ('pending','approved','rejected','revoked')),
  evidence jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(artist_id, user_id)
);

create table if not exists productions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  production_type text not null check (production_type in ('riddim','beat','instrumental','steelpan_instrumental','backing_track','production','version','other')),
  producer_artist_id uuid references artists(id),
  bpm numeric(6,2),
  musical_key text,
  rights_state text not null default 'discovered',
  created_at timestamptz not null default now()
);

create table if not exists recordings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  primary_artist_id uuid references artists(id),
  production_id uuid references productions(id),
  duration_seconds numeric(9,3),
  audio_url text,
  artwork_url text,
  isrc text unique,
  ai_provenance jsonb not null default '{}'::jsonb,
  rights_state text not null default 'discovered',
  publication_state text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  source_provider text not null,
  source_url text not null,
  canonical_url text,
  provider_item_id text,
  resolved_metadata jsonb not null default '{}'::jsonb,
  rights_confirmed boolean not null default false,
  hosted boolean not null default false,
  monetizable boolean not null default false,
  state text not null default 'discovered',
  created_at timestamptz not null default now(),
  unique(source_provider, provider_item_id)
);

create table if not exists library_items (
  user_id uuid not null references users(id) on delete cascade,
  recording_id uuid not null references recordings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, recording_id)
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid references recordings(id),
  production_id uuid references productions(id),
  product_type text not null check (product_type in ('track_download','beat_license','riddim_license','other')),
  currency text not null default 'USD',
  amount numeric(12,2) not null check (amount >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check ((recording_id is not null)::int + (production_id is not null)::int = 1)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  external_order_id text not null unique,
  buyer_user_id uuid references users(id),
  status text not null default 'pending',
  currency text not null default 'USD',
  gross_amount numeric(12,2) not null,
  processor text not null default 'wipay',
  processor_transaction_id text,
  processor_verified boolean not null default false,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  unit_amount numeric(12,2) not null,
  quantity integer not null default 1 check (quantity > 0)
);

create table if not exists download_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  order_item_id uuid not null references order_items(id) on delete cascade,
  status text not null default 'active' check (status in ('active','revoked','refunded')),
  created_at timestamptz not null default now(),
  unique(user_id, order_item_id)
);

create table if not exists rights_holders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  artist_id uuid references artists(id),
  display_name text not null,
  payout_currency text not null default 'USD',
  payout_status text not null default 'unconfigured',
  created_at timestamptz not null default now()
);

create table if not exists royalty_splits (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  rights_holder_id uuid not null references rights_holders(id),
  share_bps integer not null check (share_bps >= 0 and share_bps <= 10000),
  unique(product_id, rights_holder_id)
);

create table if not exists revenue_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  event_type text not null check (event_type in ('sale','processor_fee','refund','chargeback','reggaeai_commission','creator_accrual','payout')),
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  rights_holder_id uuid references rights_holders(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists creator_balances (
  rights_holder_id uuid primary key references rights_holders(id),
  pending_usd numeric(12,2) not null default 0,
  available_usd numeric(12,2) not null default 0,
  lifetime_usd numeric(12,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  rights_holder_id uuid not null references rights_holders(id),
  amount_usd numeric(12,2) not null check (amount_usd >= 25.00),
  status text not null default 'scheduled' check (status in ('scheduled','processing','paid','failed','held')),
  provider text,
  provider_reference text,
  period_start date not null,
  period_end date not null,
  scheduled_for date not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ReggaeAI V1 payout policy:
-- * Creator accounting currency: USD
-- * Minimum payout: US$25
-- * Payout cadence: monthly, covering the previous closed accounting period
-- * Balances below US$25 roll forward
-- * Never mark a payout PAID until the payout provider confirms settlement
