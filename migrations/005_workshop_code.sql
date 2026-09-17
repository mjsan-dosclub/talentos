alter table public.workshops add column if not exists code text;
update public.workshops set code = 'WS-' || lpad(session_number::text, 2, '0') where code is null;
alter table public.workshops alter column code set not null;
create unique index if not exists workshops_batch_code_uidx on public.workshops(batch_id, code);
