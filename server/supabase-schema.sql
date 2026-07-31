-- Campigir schema for Supabase/Postgres
-- Run in Supabase SQL Editor before deploying the API.

create table if not exists public.experiences (
  id text primary key,
  href text,
  image_src text,
  image_alt text,
  type text not null check (type in ('experience', 'rental')),
  title_pt text not null,
  title_en text not null,
  duration text,
  price text,
  price_per_hour text,
  per_day boolean not null default false,
  capacity integer not null default 10,
  active boolean not null default true,
  description_pt text,
  description_en text,
  location text,
  sort_order integer not null default 0,
  pricing jsonb
);

create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  experience_id text not null references public.experiences(id) on delete cascade,
  kind text not null check (kind in ('experience', 'rental')),
  date date not null,
  time text,
  count integer not null,
  quantity integer not null default 1,
  total numeric not null,
  name text not null,
  email text not null,
  phone text,
  notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  created_at timestamptz not null default now(),
  period text
);

create table if not exists public.blackouts (
  id bigint generated always as identity primary key,
  experience_id text not null references public.experiences(id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (experience_id, date)
);

create index if not exists bookings_experience_date_idx
  on public.bookings (experience_id, date);

create index if not exists bookings_status_idx
  on public.bookings (status);

create index if not exists blackouts_experience_date_idx
  on public.blackouts (experience_id, date);

-- API uses the service role key (server-side), so RLS can be off.
alter table public.experiences disable row level security;
alter table public.bookings disable row level security;
alter table public.blackouts disable row level security;
