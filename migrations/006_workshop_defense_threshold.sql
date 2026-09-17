alter table public.workshops add column if not exists defense_pass_threshold integer not null default 20;
alter table public.workshops add constraint workshops_defense_threshold_check check (defense_pass_threshold between 1 and 25);
