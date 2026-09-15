-- ReggaeAI additive compatibility migration.
-- Safe to run repeatedly.

alter table if exists users add column if not exists avatar_url text;
alter table if exists users add column if not exists email_verified boolean not null default false;

alter table if exists recordings add column if not exists primary_genre text;
alter table if exists recordings add column if not exists secondary_genres text[] not null default '{}';
alter table if exists recordings add column if not exists explicit_content boolean not null default false;
alter table if exists recordings add column if not exists language text;
alter table if exists recordings add column if not exists region text;

create index if not exists recordings_publication_created_idx on recordings(publication_state, created_at desc);
create index if not exists recordings_primary_genre_idx on recordings(primary_genre);
create index if not exists artists_slug_idx on artists(slug);
create index if not exists productions_slug_idx on productions(slug);
