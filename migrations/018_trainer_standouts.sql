create table if not exists public.trainer_standouts (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.scheduled_workshop_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  trainer_id uuid not null references public.experts(id) on delete restrict,
  awarded_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create index if not exists trainer_standouts_session_idx
  on public.trainer_standouts (session_id);
