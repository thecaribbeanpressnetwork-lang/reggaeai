-- Controlled media/provenance ledger.

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references users(id) on delete set null,
  recording_id uuid references recordings(id) on delete set null,
  production_id uuid references productions(id) on delete set null,
  ai_job_id uuid references ai_jobs(id) on delete set null,
  media_type text not null check (media_type in ('audio','artwork','video','stems','lyrics','other')),
  source_provider text,
  source_url text,
  storage_provider text,
  storage_key text,
  controlled_url text,
  sha256 text,
  bytes bigint,
  mime_type text,
  provenance jsonb not null default '{}'::jsonb,
  rights_state text not null default 'to_verify',
  storage_state text not null default 'external_temporary' check (storage_state in ('external_temporary','copy_pending','controlled','failed','deleted')),
  publication_eligible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_assets_recording_idx on media_assets(recording_id);
create index if not exists media_assets_job_idx on media_assets(ai_job_id);
create index if not exists media_assets_storage_state_idx on media_assets(storage_state);

-- Invariant: a provider URL alone never makes an asset publication eligible.
-- Controlled storage, rights/provenance and the relevant release-readiness gate must all pass first.
