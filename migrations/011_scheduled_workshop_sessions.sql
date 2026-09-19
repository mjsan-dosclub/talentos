create table if not exists public.scheduled_workshop_sessions (
  id uuid primary key default uuid_generate_v4(),
  workshop_code text not null,
  workshop_title text not null,
  institution_id text not null,
  institution_name text not null,
  trainer_id text not null,
  trainer_name text not null,
  session_date date not null,
  start_time text not null,
  end_time text not null,
  venue text not null,
  focus_topic text not null,
  cohort_size integer not null default 0 check (cohort_size >= 0),
  manual_status text not null default 'SCHEDULED' check (manual_status in ('SCHEDULED', 'POSTPONED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scheduled_workshop_sessions_date_idx
  on public.scheduled_workshop_sessions (session_date);

create index if not exists scheduled_workshop_sessions_trainer_date_idx
  on public.scheduled_workshop_sessions (trainer_id, session_date);
