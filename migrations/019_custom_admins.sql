create table if not exists public.custom_admins (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  permissions text[] not null default '{}',
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  must_reset_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_admins_status_idx on public.custom_admins(status);
alter table public.custom_admins enable row level security;
