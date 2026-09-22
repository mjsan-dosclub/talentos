alter table public.scheduled_workshop_sessions
  add column if not exists lifecycle_status text not null default 'NOT_STARTED'
    check (lifecycle_status in ('NOT_STARTED', 'IN_SESSION', 'ENDED'));

alter table public.scheduled_workshop_sessions
  add column if not exists started_at timestamptz;

alter table public.scheduled_workshop_sessions
  add column if not exists ended_at timestamptz;
