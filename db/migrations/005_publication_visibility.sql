-- Public visibility must be explicit, especially for licensable productions.
alter table if exists productions add column if not exists publication_state text not null default 'draft';
alter table if exists artists add column if not exists profile_state text not null default 'draft';

create index if not exists productions_publication_created_idx on productions(publication_state, created_at desc);
create index if not exists artists_profile_state_idx on artists(profile_state);
