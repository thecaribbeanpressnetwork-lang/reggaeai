create unique index if not exists media_assets_job_source_unique on media_assets(ai_job_id, source_url) where ai_job_id is not null and source_url is not null;
