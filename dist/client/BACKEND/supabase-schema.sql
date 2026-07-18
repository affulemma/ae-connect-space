-- A.E CONNECT SPACE backend schema for Supabase
-- Run this file inside Supabase SQL Editor, then place your project keys in SCRPIT/backend-config.js.

create extension if not exists pgcrypto;

create table if not exists marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  product text not null,
  seller text not null,
  business text not null,
  location text not null,
  phone text not null,
  email text not null,
  price text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists partner_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  idea text not null,
  skills text not null,
  needs text not null,
  contact text not null,
  created_at timestamptz not null default now()
);

create table if not exists business_discussions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  details text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists community_groups (
  id text primary key,
  title text not null,
  topic text not null,
  text text not null,
  features text not null,
  picture text,
  created_at timestamptz not null default now()
);

create table if not exists group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id text not null references community_groups(id) on delete cascade,
  sender text not null,
  body text,
  message_type text not null default 'text',
  duration text,
  attachment_name text,
  created_at timestamptz not null default now()
);

alter table marketplace_listings enable row level security;
alter table partner_profiles enable row level security;
alter table business_discussions enable row level security;
alter table community_groups enable row level security;
alter table group_messages enable row level security;

drop policy if exists "Public can read marketplace listings" on marketplace_listings;
create policy "Public can read marketplace listings"
on marketplace_listings for select
to anon
using (true);

drop policy if exists "Public can add marketplace listings" on marketplace_listings;
create policy "Public can add marketplace listings"
on marketplace_listings for insert
to anon
with check (true);

drop policy if exists "Public can read partner profiles" on partner_profiles;
create policy "Public can read partner profiles"
on partner_profiles for select
to anon
using (true);

drop policy if exists "Public can add partner profiles" on partner_profiles;
create policy "Public can add partner profiles"
on partner_profiles for insert
to anon
with check (true);

drop policy if exists "Public can read business discussions" on business_discussions;
create policy "Public can read business discussions"
on business_discussions for select
to anon
using (true);

drop policy if exists "Public can add business discussions" on business_discussions;
create policy "Public can add business discussions"
on business_discussions for insert
to anon
with check (true);

drop policy if exists "Public can read community groups" on community_groups;
create policy "Public can read community groups"
on community_groups for select
to anon
using (true);

drop policy if exists "Public can add community groups" on community_groups;
create policy "Public can add community groups"
on community_groups for insert
to anon
with check (true);

drop policy if exists "Public can read group messages" on group_messages;
create policy "Public can read group messages"
on group_messages for select
to anon
using (true);

drop policy if exists "Public can add group messages" on group_messages;
create policy "Public can add group messages"
on group_messages for insert
to anon
with check (true);
