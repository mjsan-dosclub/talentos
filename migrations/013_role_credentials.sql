-- Provision credentials for database-backed expert and college accounts.
alter table public.experts add column if not exists password_hash text;
alter table public.experts add column if not exists must_reset_password boolean not null default true;
alter table public.institutions add column if not exists password_hash text;
alter table public.institutions add column if not exists must_reset_password boolean not null default true;
