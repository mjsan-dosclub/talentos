alter table public.students add column if not exists password_hash text;
alter table public.students add column if not exists must_reset_password boolean not null default true;
