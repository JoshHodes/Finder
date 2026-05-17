-- ============================================
-- Finder App — Supabase Setup
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable the pg_trgm extension for fuzzy search
create extension if not exists pg_trgm;

-- Locations table
create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  photo_path text not null,
  created_at timestamptz default now()
);

-- Items table (detected items from photos)
create table items (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Index for fast fuzzy search on item names
create index items_name_trgm_idx on items using gin (name gin_trgm_ops);

-- Index for location lookups
create index items_location_id_idx on items (location_id);

-- Row Level Security (permissive for MVP — no auth)
alter table locations enable row level security;
alter table items enable row level security;

-- Allow all operations for MVP (tighten for production)
create policy "Allow all on locations" on locations
  for all using (true) with check (true);

create policy "Allow all on items" on items
  for all using (true) with check (true);

-- ============================================
-- Storage bucket for location photos
-- ============================================
-- Create this manually in the Supabase Dashboard:
-- 1. Go to Storage → New Bucket
-- 2. Name: "location-photos"
-- 3. Set to PUBLIC
-- 4. Add policy: allow all for MVP
