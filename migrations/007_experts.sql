create table if not exists public.experts (
  id uuid primary key,
  full_name text not null,
  email text not null unique,
  phone text not null,
  organization text not null,
  designation text not null,
  bio text not null default '',
  avatar text not null default '',
  linkedin_url text not null default '',
  github_url text not null default '',
  domain_specialties text[] not null default '{}',
  assigned_workshops text[] not null default '{}',
  status text not null default 'ACTIVE' check (status in ('ACTIVE','STANDBY','INACTIVE')),
  created_at timestamptz not null default now()
);
