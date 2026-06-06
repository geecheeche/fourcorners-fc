-- Run this in your Supabase SQL editor

create table waivers (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  team text,
  emergency_name text not null,
  emergency_phone text not null,
  signature_data text not null,
  signed_at timestamptz not null default now()
);

create table attendance (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references waivers(id) on delete cascade,
  player_email text not null,
  player_name text not null,
  team text,
  game_date date not null,
  game_time text not null,
  venue text not null,
  token uuid not null unique,
  status text not null default 'pending' check (status in ('pending', 'attending', 'not_attending')),
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

-- Row level security: service role only for all operations
alter table waivers enable row level security;
alter table attendance enable row level security;

-- No public access (all ops via service role key in API routes)
create policy "service_role_all_waivers" on waivers for all using (auth.role() = 'service_role');
create policy "service_role_all_attendance" on attendance for all using (auth.role() = 'service_role');
