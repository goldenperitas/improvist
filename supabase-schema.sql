-- Supabase schema for Improvist
-- Run this in the Supabase SQL Editor

-- Enable UUID extension (usually enabled by default)
create extension if not exists "uuid-ossp";

-- Sets table
create table sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- Progressions table
create table progressions (
  id uuid primary key default gen_random_uuid(),
  set_id uuid references sets(id) on delete cascade not null,
  name text,
  chords text not null,
  instrument text,
  notes text,
  audio_path text,
  position integer default 0,
  created_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index sets_user_id_idx on sets(user_id);
create index progressions_set_id_idx on progressions(set_id);

-- Row Level Security (RLS) policies

-- Enable RLS on tables
alter table sets enable row level security;
alter table progressions enable row level security;

-- Sets policies: users can only access their own sets
create policy "Users can view their own sets"
  on sets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sets"
  on sets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sets"
  on sets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own sets"
  on sets for delete
  using (auth.uid() = user_id);

-- Progressions policies: users can access progressions in their own sets
create policy "Users can view progressions in their sets"
  on progressions for select
  using (
    exists (
      select 1 from sets
      where sets.id = progressions.set_id
      and sets.user_id = auth.uid()
    )
  );

create policy "Users can insert progressions in their sets"
  on progressions for insert
  with check (
    exists (
      select 1 from sets
      where sets.id = progressions.set_id
      and sets.user_id = auth.uid()
    )
  );

create policy "Users can update progressions in their sets"
  on progressions for update
  using (
    exists (
      select 1 from sets
      where sets.id = progressions.set_id
      and sets.user_id = auth.uid()
    )
  );

create policy "Users can delete progressions in their sets"
  on progressions for delete
  using (
    exists (
      select 1 from sets
      where sets.id = progressions.set_id
      and sets.user_id = auth.uid()
    )
  );

-- Storage bucket for audio files
-- Run this in Supabase Dashboard > Storage > Create a new bucket named "audio"
-- Then set up the following policies:

-- Storage policies (run in SQL Editor after creating the bucket):
-- insert into storage.buckets (id, name, public) values ('audio', 'audio', false);

-- Allow users to upload to their own folder
-- create policy "Users can upload audio files"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'audio' and
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Allow users to read their own audio files
-- create policy "Users can read their own audio files"
--   on storage.objects for select
--   using (
--     bucket_id = 'audio' and
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Allow users to delete their own audio files
-- create policy "Users can delete their own audio files"
--   on storage.objects for delete
--   using (
--     bucket_id = 'audio' and
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
