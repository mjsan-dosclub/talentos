create table if not exists public.attendance_qr_tokens (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.scheduled_workshop_sessions(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists attendance_qr_tokens_session_idx
  on public.attendance_qr_tokens (session_id, expires_at);
