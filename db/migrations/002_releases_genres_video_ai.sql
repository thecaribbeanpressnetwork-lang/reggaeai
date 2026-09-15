-- ReggaeAI V1 catalogue completion: releases, genres, videos and AI jobs.

create table if not exists genres (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  description text,
  parent_id uuid references genres(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists releases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  release_type text not null check (release_type in ('single','ep','album','riddim_project')),
  primary_artist_id uuid references artists(id),
  label_name text,
  artwork_url text,
  release_date date,
  publication_state text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists release_tracks (
  release_id uuid not null references releases(id) on delete cascade,
  recording_id uuid not null references recordings(id) on delete cascade,
  track_number integer not null default 1 check (track_number > 0),
  disc_number integer not null default 1 check (disc_number > 0),
  primary key (release_id, recording_id),
  unique(release_id, disc_number, track_number)
);

create table if not exists recording_genres (
  recording_id uuid not null references recordings(id) on delete cascade,
  genre_id uuid not null references genres(id) on delete cascade,
  is_primary boolean not null default false,
  primary key (recording_id, genre_id)
);

create table if not exists production_genres (
  production_id uuid not null references productions(id) on delete cascade,
  genre_id uuid not null references genres(id) on delete cascade,
  is_primary boolean not null default false,
  primary key (production_id, genre_id)
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  recording_id uuid references recordings(id) on delete set null,
  artist_id uuid references artists(id) on delete set null,
  video_url text,
  poster_url text,
  source_provider text,
  provenance jsonb not null default '{}'::jsonb,
  rights_state text not null default 'discovered',
  publication_state text not null default 'draft',
  created_at timestamptz not null default now(),
  check (recording_id is not null or artist_id is not null)
);

create table if not exists ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  job_type text not null check (job_type in ('song','riddim','artwork','video','metadata')),
  provider text not null,
  provider_job_id text,
  state text not null default 'queued' check (state in ('queued','submitted','processing','streaming','succeeded','failed','cancelled')),
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error text,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_job_id)
);

create index if not exists release_publication_date_idx on releases(publication_state, release_date desc);
create index if not exists video_publication_created_idx on videos(publication_state, created_at desc);
create index if not exists ai_jobs_user_created_idx on ai_jobs(user_id, created_at desc);
